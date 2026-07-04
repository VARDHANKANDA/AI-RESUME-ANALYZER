"""Basic API tests."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app)


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_register_and_login(client):
    register_data = {
        "email": "test@example.com",
        "password": "Password@123",
        "full_name": "Test User",
    }
    reg = client.post("/register", json=register_data)
    assert reg.status_code == 201
    assert "access_token" in reg.json()

    login = client.post("/login", json={"email": "test@example.com", "password": "Password@123"})
    assert login.status_code == 200
    assert login.json()["user"]["email"] == "test@example.com"


def test_protected_profile(client):
    client.post("/register", json={
        "email": "user@test.com",
        "password": "Password@123",
        "full_name": "User Test",
    })
    login = client.post("/login", json={"email": "user@test.com", "password": "Password@123"})
    token = login.json()["access_token"]

    profile = client.get("/profile", headers={"Authorization": f"Bearer {token}"})
    assert profile.status_code == 200
    assert profile.json()["full_name"] == "User Test"
