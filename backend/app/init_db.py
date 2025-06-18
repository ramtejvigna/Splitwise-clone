from app.database import engine
from app.models import Base
from app.seed_data import seed_users

def init_database():
    """Initialize the database by creating tables and seeding data"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
    
    print("Seeding initial data...")
    seed_users()
    print("Database initialization complete!")

if __name__ == "__main__":
    init_database() 