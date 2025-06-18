from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Table, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

Base = declarative_base()

# Association table for many-to-many relationship between groups and users
group_users = Table(
    'group_users',
    Base.metadata,
    Column('group_id', Integer, ForeignKey('groups.id'), primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    
    # Relationships
    groups = relationship("Group", secondary=group_users, back_populates="users")
    expenses_paid = relationship("Expense", back_populates="payer")

class Group(Base):
    __tablename__ = "groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    users = relationship("User", secondary=group_users, back_populates="groups")
    expenses = relationship("Expense", back_populates="group")

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    paid_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    split_type = Column(String, nullable=False)  # 'equal' or 'percentage'
    splits = Column(JSON)  # Store split details as JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    payer = relationship("User", back_populates="expenses_paid")
    group = relationship("Group", back_populates="expenses")

class Balance(Base):
    __tablename__ = "balances"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    balance = Column(Float, default=0.0)  # Positive means they are owed, negative means they owe
    
    # Relationships
    user = relationship("User")
    group = relationship("Group")