# AI Chatbot Setup Guide

This project now includes an AI-powered chatbot that can answer natural language queries about expenses, balances, and groups using HuggingFace API.

## Features

The chatbot can answer questions like:
- "How much does Alice owe in group Goa Trip?"
- "Show me my latest 3 expenses"
- "Who paid the most in Weekend Trip?"
- General questions about balances, expenses, and group information

## Setup

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Set Environment Variable
You need to set up a HuggingFace API token:

1. Visit [HuggingFace.co](https://huggingface.co) and create an account
2. Go to your profile settings and create an API token
3. Set the environment variable:

**On Windows:**
```bash
set HUGGINGFACE_API_TOKEN=your_token_here
```

**On macOS/Linux:**
```bash
export HUGGINGFACE_API_TOKEN=your_token_here
```

#### Start the Backend Server
```bash
cd backend
python -m app.main
```

### 2. Frontend Setup

The chatbot is already integrated into the frontend. Just make sure you have the dependencies installed:

```bash
cd frontend
npm install
npm run dev
```

## How It Works

1. **Context Generation**: The chatbot queries your database to get current information about users, groups, expenses, and balances
2. **Query Processing**: User queries are sent to HuggingFace API along with structured context from the database
3. **Fallback Responses**: If the HuggingFace API is unavailable, the chatbot provides intelligent fallback responses based on pattern matching

## Usage

1. Look for the blue chat icon in the bottom-right corner of any page
2. Click to open the chatbot
3. Type your questions about expenses, balances, or groups
4. The chatbot will respond with relevant information from your data

## API Endpoint

The chatbot uses a POST endpoint at `/chat` that accepts:

```json
{
  "message": "Your question here",
  "user_id": 1  // optional
}
```

And returns:

```json
{
  "response": "AI-generated response",
  "context_used": {
    "users_count": 5,
    "groups_count": 3,
    "expenses_count": 10,
    "balances_count": 8
  }
}
```

## Troubleshooting

1. **No API Token Error**: Make sure you've set the `HUGGINGFACE_API_TOKEN` environment variable
2. **Chatbot Not Responding**: Check that the backend server is running and accessible
3. **Generic Responses**: If you're getting generic responses, it might be using fallback mode due to API issues

## Customization

You can customize the chatbot by modifying:
- `backend/app/chatbot_service.py`: Modify the LLM prompts or add new query patterns
- `frontend/src/components/Chatbot.tsx`: Customize the UI appearance and behavior
- Model Selection: Change the HuggingFace model in the chatbot service for different response styles 