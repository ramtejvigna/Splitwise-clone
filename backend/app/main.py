from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import time
import logging
from app import operations, models, schemas
from app.database import SessionLocal, create_tables
from app.chatbot_service import chatbot_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
create_tables()

app = FastAPI(title="Splitwise Clone API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
# This is used to log the requests to the API
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    process_time_ms = round(process_time * 1000)
    
    logger.info(f"{request.method} {request.url.path} {response.status_code} {process_time_ms}ms")
    
    return response

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Splitwise Clone API", "version": "1.0.0"}

# Group endpoints
@app.post("/groups", response_model=schemas.Group)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    try:
        return operations.create_group(db=db, group=group)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/groups/{group_id}", response_model=schemas.GroupDetail)
def read_group(group_id: int, db: Session = Depends(get_db)):
    db_group = operations.get_group(db, group_id=group_id)
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Calculate total expenses
    expenses = operations.get_group_expenses(db, group_id)
    total_expenses = sum(expense.amount for expense in expenses)
    
    group_detail = schemas.GroupDetail(
        id=db_group.id,
        name=db_group.name,
        created_at=db_group.created_at,
        users=db_group.users,
        total_expenses=total_expenses
    )
    
    return group_detail

@app.get("/groups", response_model=List[schemas.Group])
def read_groups(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    groups = operations.get_groups(db, skip=skip, limit=limit)
    return groups

# Expense endpoints
@app.post("/groups/{group_id}/expenses", response_model=schemas.Expense)
def create_expense(
    group_id: int, 
    expense: schemas.ExpenseCreate, 
    db: Session = Depends(get_db)
):
    db_group = operations.get_group(db, group_id=group_id)
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Validate payer is in group
    payer_in_group = any(user.id == expense.paid_by for user in db_group.users)
    if not payer_in_group:
        raise HTTPException(status_code=400, detail="Payer is not in the group")
    
    # Validate percentage splits if applicable
    if expense.split_type == "percentage":
        if not expense.splits:
            raise HTTPException(status_code=400, detail="Percentage splits required")
        
        total_percentage = sum(expense.splits.values())
        if abs(total_percentage - 100) > 0.01:
            raise HTTPException(status_code=400, detail="Percentages must sum to 100")
    
    return operations.create_expense(db=db, expense=expense, group_id=group_id)

@app.get("/groups/{group_id}/expenses", response_model=List[schemas.Expense])
def read_group_expenses(group_id: int, db: Session = Depends(get_db)):
    db_group = operations.get_group(db, group_id=group_id)
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    
    return operations.get_group_expenses(db, group_id)

# <------ Balance tracking ------>
# Balance endpoints
@app.get("/groups/{group_id}/balances")
def read_group_balances(group_id: int, db: Session = Depends(get_db)):
    db_group = operations.get_group(db, group_id=group_id)
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    
    balances = operations.get_group_balances(db, group_id)
    simplified_balances = operations.calculate_simplified_balances(db, group_id)
    
    # Format response
    balance_data = []
    for balance in balances:
        balance_data.append({
            "user_id": balance.user.id,
            "user_name": balance.user.name,
            "balance": round(balance.balance, 2)
        })
    
    return {
        "group_id": group_id,
        "group_name": db_group.name,
        "balances": balance_data,
        "simplified_transactions": simplified_balances
    }

@app.get("/users/{user_id}/balances")
def read_user_balances(user_id: int, db: Session = Depends(get_db)):
    user = operations.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    balances = operations.get_user_balances(db, user_id)
    
    total_balance = sum(balance.balance for balance in balances)
    group_balances = []
    
    for balance in balances:
        if abs(balance.balance) > 0.01:  # Only show non-zero balances
            group_balances.append({
                "group_id": balance.group.id,
                "group_name": balance.group.name,
                "balance": round(balance.balance, 2)
            })
    
    return {
        "user_id": user_id,
        "user_name": user.name,
        "total_balance": round(total_balance, 2),
        "group_balances": group_balances
    }

# Users endpoint (for frontend to get user list)
@app.get("/users", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

# Chatbot endpoint
@app.post("/chat", response_model=schemas.ChatResponse)
def chat_query(chat_message: schemas.ChatMessage, db: Session = Depends(get_db)):
    """Handle chatbot queries about expenses, balances, and groups"""
    try:
        result = chatbot_service.process_chat_query(
            db=db, 
            user_query=chat_message.message,
            user_id=chat_message.user_id
        )
        return schemas.ChatResponse(
            response=result["response"],
            context_used=result["context_used"]
        )
    except Exception as e:
        logger.error(f"Chatbot error: {e}")
        raise HTTPException(status_code=500, detail="Sorry, I encountered an error processing your request.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)