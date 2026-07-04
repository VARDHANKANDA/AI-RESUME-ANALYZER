"""Sample test data seeder."""

from app.auth.jwt_handler import get_password_hash
from app.database import SessionLocal
from app.models.user import User


def seed_sample_users():
    db = SessionLocal()
    try:
        samples = [
            {"email": "john.doe@example.com", "full_name": "John Doe", "password": "Password@123"},
            {"email": "jane.smith@example.com", "full_name": "Jane Smith", "password": "Password@123"},
        ]
        for sample in samples:
            if not db.query(User).filter(User.email == sample["email"]).first():
                db.add(User(
                    email=sample["email"],
                    hashed_password=get_password_hash(sample["password"]),
                    full_name=sample["full_name"],
                ))
        db.commit()
        print("Sample users seeded successfully")
    finally:
        db.close()


if __name__ == "__main__":
    seed_sample_users()
