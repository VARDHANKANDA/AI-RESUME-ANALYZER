"""Authentication routes: register, login, logout, profile."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.jwt_handler import (
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from app.config import get_settings
from app.database import get_db
from app.models.token import AuthToken
from app.models.user import User
from app.schemas.schemas import MessageResponse, TokenResponse, UserLogin, UserRegister, UserResponse, UserUpdate

router = APIRouter(tags=["Authentication"])
settings = get_settings()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account."""
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    is_admin = user_data.email == settings.ADMIN_EMAIL
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        is_admin=is_admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token, jti, expire = create_access_token(user.id, user.email)
    db.add(AuthToken(user_id=user.id, token_jti=jti, expires_at=expire))
    db.commit()

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")

    token, jti, expire = create_access_token(user.id, user.email)
    db.add(AuthToken(user_id=user.id, token_jti=jti, expires_at=expire))
    db.commit()

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/logout", response_model=MessageResponse)
def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoke all active tokens for the current user."""
    db.query(AuthToken).filter(
        AuthToken.user_id == current_user.id,
        AuthToken.is_revoked == False,  # noqa: E712
    ).update({"is_revoked": True})
    db.commit()
    return MessageResponse(message="Logged out successfully")


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user profile information."""
    if update.full_name is not None:
        current_user.full_name = update.full_name
    if update.bio is not None:
        current_user.bio = update.bio
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)
