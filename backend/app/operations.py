from sqlalchemy.orm import Session
from sqlalchemy import and_
from . import models, schemas
from collections import defaultdict

# User CRUD operations
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(name=user.name, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_or_create_user(db: Session, name: str):
    # Create a simple email from name for demo purposes
    email = f"{name.lower().replace(' ', '.')}@splitwiseclone.com"
    user = get_user_by_email(db, email)
    if not user:
        user_create = schemas.UserCreate(name=name, email=email)
        user = create_user(db, user_create)
    return user

# Group CRUD operations
def create_group(db: Session, group: schemas.GroupCreate):
    db_group = models.Group(name=group.name)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    
    # Add users to group
    for user_id in group.user_ids:
        user = get_user_by_id(db, user_id)
        if not user:
            db.rollback()
            raise ValueError(f"User with ID {user_id} not found")
        
        db_group.users.append(user)
        
        # Initialize balance for user in this group
        balance = models.Balance(user_id=user.id, group_id=db_group.id, balance=0.0)
        db.add(balance)
    
    db.commit()
    db.refresh(db_group)
    return db_group

def get_group(db: Session, group_id: int):
    return db.query(models.Group).filter(models.Group.id == group_id).first()

def get_groups(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Group).offset(skip).limit(limit).all()

# Expense CRUD operations
def create_expense(db: Session, expense: schemas.ExpenseCreate, group_id: int):
    db_expense = models.Expense(
        description=expense.description,
        amount=expense.amount,
        paid_by=expense.paid_by,
        group_id=group_id,
        split_type=expense.split_type,
        splits=expense.splits
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    
    # Update balances
    update_balances_after_expense(db, db_expense)
    
    return db_expense

def update_balances_after_expense(db: Session, expense: models.Expense):
    group = get_group(db, expense.group_id)
    
    if expense.split_type == "equal":
        # Split equally among all group members
        split_amount = expense.amount / len(group.users)
        
        for user in group.users:
            balance = db.query(models.Balance).filter(
                and_(models.Balance.user_id == user.id, models.Balance.group_id == expense.group_id)
            ).first()
            
            if user.id == expense.paid_by:
                # Payer gets credited (positive balance)
                balance.balance += expense.amount - split_amount
            else:
                # Others get debited (negative balance)
                balance.balance -= split_amount
    
    elif expense.split_type == "percentage":
        # Split based on percentages
        for user in group.users:
            balance = db.query(models.Balance).filter(
                and_(models.Balance.user_id == user.id, models.Balance.group_id == expense.group_id)
            ).first()
            
            user_percentage = expense.splits.get(str(user.id), 0)
            user_share = expense.amount * (user_percentage / 100)
            
            if user.id == expense.paid_by:
                # Payer gets credited minus their share
                balance.balance += expense.amount - user_share
            else:
                # Others get debited for their share
                balance.balance -= user_share
    
    db.commit()

def get_group_expenses(db: Session, group_id: int):
    return db.query(models.Expense).filter(models.Expense.group_id == group_id).all()

# Balance CRUD operations
def get_group_balances(db: Session, group_id: int):
    return db.query(models.Balance).filter(models.Balance.group_id == group_id).all()

def get_user_balances(db: Session, user_id: int):
    return db.query(models.Balance).filter(models.Balance.user_id == user_id).all()

def calculate_simplified_balances(db: Session, group_id: int):
    """Calculate who owes whom in simplified form"""
    balances = get_group_balances(db, group_id)
    
    # Separate creditors (positive balance) and debtors (negative balance)
    creditors = []
    debtors = []
    
    for balance in balances:
        if balance.balance > 0:
            creditors.append({"user": balance.user, "amount": balance.balance})
        elif balance.balance < 0:
            debtors.append({"user": balance.user, "amount": abs(balance.balance)})
    
    # Calculate simplified transactions
    transactions = []
    
    # Sort by amount for optimal matching
    creditors.sort(key=lambda x: x["amount"], reverse=True)
    debtors.sort(key=lambda x: x["amount"], reverse=True)
    
    i, j = 0, 0
    while i < len(creditors) and j < len(debtors):
        creditor = creditors[i]
        debtor = debtors[j]
        
        amount = min(creditor["amount"], debtor["amount"])
        
        if amount > 0.01:  # Only add if amount is significant
            transactions.append({
                "from_user": debtor["user"].name,
                "to_user": creditor["user"].name,
                "amount": round(amount, 2)
            })
        
        creditor["amount"] -= amount
        debtor["amount"] -= amount
        
        if creditor["amount"] < 0.01:
            i += 1
        if debtor["amount"] < 0.01:
            j += 1
    
    return transactions