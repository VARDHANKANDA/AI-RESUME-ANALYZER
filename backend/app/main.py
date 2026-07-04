"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import get_settings
from app.database import Base, engine, SessionLocal
from app.auth.jwt_handler import get_password_hash
from app.models.user import User
from app.routes import auth, resume, analysis, dashboard, admin

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)


def seed_admin_user():
    """Create default admin user if not exists."""
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not admin:
            admin = User(
                email=settings.ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                full_name="System Admin",
                is_admin=True,
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    seed_admin_user()
    yield


app = FastAPI(
    title="AI Resume Analyzer API",
    description="AI-powered resume analysis, ATS scoring, and job matching",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "message": str(exc)},
    )


@app.get("/health")
@limiter.limit("30/minute")
async def health_check(request: Request):
    return {"status": "healthy", "service": "AI Resume Analyzer API"}


# Register routes - auth uses /auth prefix internally
app.include_router(auth.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

# Also expose auth at root level as specified in requirements
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(analysis.router)
app.include_router(dashboard.router)
app.include_router(admin.router)
