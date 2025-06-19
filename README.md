# Splitwise Clone

A full-stack expense sharing application built with FastAPI, React, and PostgreSQL. This application helps users manage and split expenses within groups, similar to Splitwise.

## Features

- User authentication and management
- Create and manage groups
- Add expenses and split them among group members
- Track balances and settlements
- Real-time updates
- AI-powered chatbot assistance

## Tech Stack

### Backend
- FastAPI (Python web framework)
- PostgreSQL (Database)
- SQLAlchemy (ORM)
- Pydantic (Data validation)
- Uvicorn (ASGI server)

### Frontend
- React 19
- TypeScript
- Vite
- TailwindCSS
- React Router DOM
- Axios

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Python 3.8+ (for local development)

## Setup and Running

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/yourusername/splitwise-clone.git
cd splitwise-clone
```

2. Start the application using Docker Compose:
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Local Development Setup

#### Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication
Currently, the API does not implement authentication. This is a planned feature for future releases.

### Base URL
- Local Development: `http://localhost:8000`
- API Documentation (Swagger UI): `http://localhost:8000/docs`

### Group Endpoints

#### Get All Groups
- **GET** `/groups`
- **Query Parameters:**
  - `skip` (optional): Number of records to skip (default: 0)
  - `limit` (optional): Maximum number of records to return (default: 100)
- **Response:** List of groups
```json
[
  {
    "id": 1,
    "name": "Trip to Paris",
    "created_at": "2024-03-15T10:30:00",
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    ]
  }
]
```

#### Create Group
- **POST** `/groups`
- **Request Body:**
```json
{
  "name": "Trip to Paris",
  "user_ids": [1, 2, 3]
}
```
- **Response:** Created group object

#### Get Group Details
- **GET** `/groups/{group_id}`
- **Response:** Detailed group information including total expenses
```json
{
  "id": 1,
  "name": "Trip to Paris",
  "created_at": "2024-03-15T10:30:00",
  "users": [...],
  "total_expenses": 1000.50
}
```

### Expense Endpoints

#### Create Expense
- **POST** `/groups/{group_id}/expenses`
- **Request Body:**
```json
{
  "description": "Hotel Booking",
  "amount": 200.50,
  "paid_by": 1,
  "split_type": "equal",
  "splits": {}  // For percentage splits: {"1": 50, "2": 50}
}
```
- **Notes:**
  - `split_type` can be either "equal" or "percentage"
  - For percentage splits, the sum must equal 100
  - The payer must be a member of the group

#### Get Group Expenses
- **GET** `/groups/{group_id}/expenses`
- **Response:** List of all expenses in the group

### Balance Endpoints

#### Get Group Balances
- **GET** `/groups/{group_id}/balances`
- **Response:** Group balance information including simplified transactions
```json
{
  "group_id": 1,
  "group_name": "Trip to Paris",
  "balances": [
    {
      "user_id": 1,
      "user_name": "John",
      "balance": 100.50
    }
  ],
  "simplified_transactions": [
    {
      "from_user": "Alice",
      "to_user": "Bob",
      "amount": 50.25
    }
  ]
}
```

#### Get User Balances
- **GET** `/users/{user_id}/balances`
- **Response:** User's balance across all groups
```json
{
  "user_id": 1,
  "user_name": "John",
  "total_balance": 150.75,
  "group_balances": [
    {
      "group_id": 1,
      "group_name": "Trip to Paris",
      "balance": 100.50
    }
  ]
}
```

### User Endpoints

#### Get All Users
- **GET** `/users`
- **Query Parameters:**
  - `skip` (optional): Number of records to skip (default: 0)
  - `limit` (optional): Maximum number of records to return (default: 100)
- **Response:** List of users

### Chatbot Endpoint

#### Send Chat Message
- **POST** `/chat`
- **Request Body:**
```json
{
  "message": "What's my current balance?",
  "user_id": 1
}
```
- **Response:**
```json
{
  "response": "Your current total balance is $150.75...",
  "context_used": {
    // Additional context information used to generate response
  }
}
```

### Error Responses
All endpoints may return the following error responses:
- `400 Bad Request`: Invalid input data
- `404 Not Found`: Requested resource not found
- `500 Internal Server Error`: Server-side error

### Rate Limiting
The API implements rate limiting to prevent abuse. Specific limits are configured server-side.

## Assumptions and Design Decisions


1. **Database**:
   - PostgreSQL is used as the primary database
   - Uses connection pooling for better performance
   - Implements soft delete for data integrity

2. **Expense Splitting**:
   - Supports equal, exact, and percentage-based splits
   - All expenses must be settled in the same currency (USD)
   - Negative balances are allowed

3. **Groups**:
   - A user can be part of multiple groups
   - No limit on group size

4. **Performance**:
   - Implements caching for frequently accessed data
   - Uses database indexes for optimal query performance
   - API rate limiting is implemented

5  I have seeded some user data and based on that, I'm categorizing things. As the authentication isn't implemented...

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.