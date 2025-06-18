from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Group schemas
class GroupBase(BaseModel):
    name: str

class GroupCreate(GroupBase):
    user_ids: List[int]  # List of user IDs to add to group

class Group(GroupBase):
    id: int
    created_at: datetime
    users: List[User] = []
    
    class Config:
        from_attributes = True

class GroupDetail(Group):
    total_expenses: float = 0.0

# Expense schemas
class ExpenseBase(BaseModel):
    description: str
    amount: float
    paid_by: int
    split_type: str  # 'equal' or 'percentage'
    splits: Dict = {}  # For percentage splits: {user_id: percentage}

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int
    group_id: int
    created_at: datetime
    payer: User
    
    class Config:
        from_attributes = True

# Balance schemas
class BalanceBase(BaseModel):
    user_id: int
    group_id: int
    balance: float

class Balance(BalanceBase):
    id: int
    user: User
    group: Group
    
    class Config:
        from_attributes = True

class GroupBalance(BaseModel):
    group_id: int
    group_name: str
    balances: List[Dict] = []  # {user_name: balance, owes_to: [...]}

class UserBalance(BaseModel):
    user_id: int
    user_name: str
    total_balance: float
    group_balances: List[Dict] = []  # Per group breakdown

class SimplifiedBalance(BaseModel):
    from_user: str
    to_user: str
    amount: float

class ChatMessage(BaseModel):
    message: str
    user_id: Optional[int] = None
    
class ChatResponse(BaseModel):
    response: str
    context_used: Optional[dict] = None