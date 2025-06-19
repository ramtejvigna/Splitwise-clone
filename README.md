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

### Group Endpoints

- `GET /groups`: Get all groups for the authenticated user
- `POST /groups`: Create a new group
  - Body: `{ "name": string, "description": string }`
- `GET /groups/{group_id}`: Get group details
- `PUT /groups/{group_id}`: Update group details
- `DELETE /groups/{group_id}`: Delete a group

### Expense Endpoints

- `POST /expenses`: Create a new expense
  - Body: `{ "group_id": int, "amount": float, "description": string, "paid_by": int, "split_type": string, "splits": array }`
- `GET /expenses/{group_id}`: Get all expenses in a group
- `PUT /expenses/{expense_id}`: Update an expense
- `DELETE /expenses/{expense_id}`: Delete an expense

### User Balance Endpoints

- `GET /balances`: Get overall balances for the current user
- `GET /balances/{group_id}`: Get balances within a specific group

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