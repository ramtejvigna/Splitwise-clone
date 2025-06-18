from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models

def seed_users():
    db = SessionLocal()
    
    # Check if users already exist
    existing_users = db.query(models.User).count()
    if existing_users > 0:
        print(f"Database already has {existing_users} users. Skipping seed.")
        db.close()
        return
    
    # Create sample users
    users_data = [
        {"name": "Ramtej Vigna", "email": "ramtej@example.com"},
        {"name": "Vamsi", "email": "vamsi@example.com"},
        {"name": "Rajesh", "email": "rajesh@example.com"},
        {"name": "William", "email": "william@example.com"},
        {"name": "Dhamodhar", "email": "dhamodhar@example.com"},
    ]
    
    for user_data in users_data:
        user = models.User(**user_data)
        db.add(user)
    
    db.commit()
    print(f"Successfully seeded {len(users_data)} users!")
    db.close()

if __name__ == "__main__":
    seed_users() 