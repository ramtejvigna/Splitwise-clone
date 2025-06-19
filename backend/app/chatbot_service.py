import requests
import json
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from . import models, operations
import os
from collections import defaultdict
from datetime import datetime

# HuggingFace API configuration - using a better model for Q&A
HUGGINGFACE_API_URL = "https://router.huggingface.co/sambanova/v1/chat/completions"
HUGGINGFACE_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN", "")

class ChatbotService:
    def __init__(self):
        self.headers = {
            "Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}",
            "Content-Type": "application/json"
        }

    def get_comprehensive_context(self, db: Session, user_id: Optional[int] = None) -> Dict[str, Any]:
        """Generate comprehensive structured context from database for the LLM"""
        context = {
            "users": [],
            "groups": [],
            "expenses": [],
            "balances": [],
            "statistics": {},
            "relationships": {}
        }
        
        try:
            # Get all users
            users = db.query(models.User).all()
            context["users"] = [{"id": user.id, "name": user.name} for user in users]
            
            # Initialize statistics
            total_expenses = 0
            total_amount = 0.0
            user_expense_count = defaultdict(int)
            user_paid_amount = defaultdict(float)
            group_expense_count = defaultdict(int)
            group_total_amount = defaultdict(float)
            
            # Get all groups with detailed information
            groups = db.query(models.Group).all()
            for group in groups:
                group_data = {
                    "id": group.id,
                    "name": group.name,
                    "members": [user.name for user in group.users],
                    "member_ids": [user.id for user in group.users],
                    "member_count": len(group.users)
                }
                context["groups"].append(group_data)
                
                # Get expenses for this group
                expenses = operations.get_group_expenses(db, group.id)
                for expense in expenses:
                    total_expenses += 1
                    total_amount += expense.amount
                    
                    payer = next((u for u in users if u.id == expense.paid_by), None)
                    payer_name = payer.name if payer else "Unknown"
                    
                    user_expense_count[payer_name] += 1
                    user_paid_amount[payer_name] += expense.amount
                    group_expense_count[group.name] += 1
                    group_total_amount[group.name] += expense.amount
                    
                    expense_data = {
                        "id": expense.id,
                        "description": expense.description,
                        "amount": expense.amount,
                        "paid_by": payer_name,
                        "paid_by_id": expense.paid_by,
                        "group_name": group.name,
                        "group_id": group.id,
                        "created_at": expense.created_at.strftime("%Y-%m-%d %H:%M"),
                        "split_type": expense.split_type,
                        "participants": len(group.users)
                    }
                    context["expenses"].append(expense_data)
                
                # Get balances for this group
                balances = operations.get_group_balances(db, group.id)
                for balance in balances:
                    if abs(balance.balance) > 0.01:
                        balance_data = {
                            "user_name": balance.user.name,
                            "user_id": balance.user.id,
                            "group_name": group.name,
                            "group_id": group.id,
                            "balance": round(balance.balance, 2),
                            "owes_or_owed": "owed" if balance.balance > 0 else "owes",
                            "absolute_amount": abs(round(balance.balance, 2))
                        }
                        context["balances"].append(balance_data)
            
            # Calculate comprehensive statistics
            context["statistics"] = {
                "total_users": len(users),
                "total_groups": len(groups),
                "total_expenses": total_expenses,
                "total_amount_spent": round(total_amount, 2),
                "average_expense_amount": round(total_amount / total_expenses, 2) if total_expenses > 0 else 0,
                "most_active_payer": max(user_expense_count.items(), key=lambda x: x[1]) if user_expense_count else None,
                "highest_spender": max(user_paid_amount.items(), key=lambda x: x[1]) if user_paid_amount else None,
                "most_active_group": max(group_expense_count.items(), key=lambda x: x[1]) if group_expense_count else None,
                "group_with_highest_expenses": max(group_total_amount.items(), key=lambda x: x[1]) if group_total_amount else None
            }
            
            # Calculate relationships and debts
            user_relationships = defaultdict(lambda: defaultdict(float))
            for balance in context["balances"]:
                for other_balance in context["balances"]:
                    if (balance["group_id"] == other_balance["group_id"] and 
                        balance["user_name"] != other_balance["user_name"]):
                        if balance["owes_or_owed"] == "owes" and other_balance["owes_or_owed"] == "owed":
                            user_relationships[balance["user_name"]][other_balance["user_name"]] += balance["absolute_amount"]
            
            context["relationships"] = dict(user_relationships)
            
            return context
        except Exception as e:
            print(f"Error getting comprehensive context: {e}")
            return context

    def create_intelligent_prompt(self, context: Dict[str, Any], user_query: str) -> str:
        """Create a comprehensive, intelligent prompt for the LLM"""
        
        prompt = f"""You are an intelligent assistant for a Splitwise expense sharing application. You have access to comprehensive data about users, groups, expenses, and balances. Answer the user's question accurately and helpfully using the provided data.

USER QUESTION: "{user_query}"

COMPLETE EXPENSE SHARING DATA:

=== USERS ===
Total Users: {context['statistics']['total_users']}
"""
        
        for user in context["users"]:
            prompt += f"• {user['name']} (ID: {user['id']})\n"
        
        prompt += f"\n=== GROUPS ===\nTotal Groups: {context['statistics']['total_groups']}\n"
        for group in context["groups"]:
            prompt += f"• '{group['name']}' ({group['member_count']} members): {', '.join(group['members'])}\n"
        
        prompt += f"\n=== EXPENSES ===\nTotal Expenses: {context['statistics']['total_expenses']}\n"
        prompt += f"Total Amount Spent: ₹{context['statistics']['total_amount_spent']}\n"
        prompt += f"Average Expense: ₹{context['statistics']['average_expense_amount']}\n\n"
        
        # Show recent expenses (last 10)
        recent_expenses = sorted(context["expenses"], key=lambda x: x['created_at'], reverse=True)[:10]
        for expense in recent_expenses:
            prompt += f"• {expense['description']}: ₹{expense['amount']} paid by {expense['paid_by']} in '{expense['group_name']}' on {expense['created_at']}\n"
        
        if len(context["expenses"]) > 10:
            prompt += f"... and {len(context['expenses']) - 10} more expenses\n"
        
        prompt += f"\n=== CURRENT BALANCES ===\n"
        if context["balances"]:
            for balance in context["balances"]:
                status = "is owed" if balance["owes_or_owed"] == "owed" else "owes"
                prompt += f"• {balance['user_name']} {status} ₹{balance['absolute_amount']} in '{balance['group_name']}'\n"
        else:
            prompt += "All balances are settled!\n"
        
        prompt += f"\n=== STATISTICS ===\n"
        stats = context["statistics"]
        if stats.get("most_active_payer"):
            prompt += f"• Most Active Payer: {stats['most_active_payer'][0]} ({stats['most_active_payer'][1]} expenses)\n"
        if stats.get("highest_spender"):
            prompt += f"• Highest Spender: {stats['highest_spender'][0]} (₹{stats['highest_spender'][1]:.2f})\n"
        if stats.get("most_active_group"):
            prompt += f"• Most Active Group: '{stats['most_active_group'][0]}' ({stats['most_active_group'][1]} expenses)\n"
        if stats.get("group_with_highest_expenses"):
            prompt += f"• Group with Highest Expenses: '{stats['group_with_highest_expenses'][0]}' (₹{stats['group_with_highest_expenses'][1]:.2f})\n"
        
        prompt += f"""
=== INSTRUCTIONS ===
Based on the complete data above, provide a helpful, accurate, and detailed answer to the user's question. 

Guidelines:
1. Use exact numbers and names from the data
2. Be conversational and friendly. Don't provide any information that is not in the data.
3. Provide specific details when asked
4. If asked about amounts, always use ₹ (Indian Rupees)
5. If asked about trends or patterns, analyze the data provided
6. If asked about recommendations or suggestions, base them on the data
7. If the question is unclear, ask for clarification while showing what you can help with
8. Always be precise with calculations and balances
9. Include relevant context that might be helpful to the user
10. If asked about settling debts, suggest the most efficient way


ANSWER:"""
        
        return prompt

    def query_intelligent_api(self, prompt: str) -> str:
        """Query HuggingFace API with the intelligent prompt using a better model"""
        
        if not HUGGINGFACE_API_TOKEN:
            return "I need a HuggingFace API token to help you. Please set the HUGGINGFACE_API_TOKEN environment variable."
        
        try:
            # Use FLAN-T5 which is better for question answering and instruction following
            payload = {
                "model": "Meta-Llama-3.1-8B-Instruct",  # or another supported model
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful assistant for a Splitwise expense sharing application. Provide accurate and helpful responses based on the expense data provided."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                "temperature": 0.3,
                "max_tokens": 300,
                "top_p": 0.9
            }
            
            # Update headers for chat completions API
            headers = {
                "Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(HUGGINGFACE_API_URL, headers=headers, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                # Handle chat completions response format
                if "choices" in result and len(result["choices"]) > 0:
                    message_content = result["choices"][0].get("message", {}).get("content", "").strip()
                    return message_content if message_content else "I couldn't generate a proper response. Please try rephrasing your question."
                else:
                    return "I received an unexpected response format. Please try again."
            elif response.status_code == 503:
                return "The AI model is currently loading. Please try again in a few seconds."
            elif response.status_code == 401:
                return "Authentication failed. Please check your API token."
            elif response.status_code == 429:
                return "Rate limit exceeded. Please try again in a moment."
            else:
                print(f"API Error: {response.status_code} - {response.text}")
                return f"I encountered an error (Status: {response.status_code}). Please try again later."
                
        except Exception as e:
            print(f"Error querying SambaNova API: {e}")
            return "I encountered a technical issue. Please try again later."

    def process_chat_query(self, db: Session, user_query: str, user_id: Optional[int] = None) -> Dict[str, Any]:
        """Main method to process any chat query intelligently"""
        
        try:
            # Get comprehensive database context
            context = self.get_comprehensive_context(db, user_id)
            
            # Create intelligent prompt
            intelligent_prompt = self.create_intelligent_prompt(context, user_query)
            
            # Query the AI model
            response = self.query_intelligent_api(intelligent_prompt)
            
            return {
                "response": response,
                "context_used": {
                    "users_count": len(context["users"]),
                    "groups_count": len(context["groups"]),
                    "expenses_count": len(context["expenses"]),
                    "balances_count": len(context["balances"]),
                    "total_amount": context["statistics"]["total_amount_spent"],
                    "model_used": "Meta-Llama-3.1-8B-Instruct"
                },
                "success": True
            }
            
        except Exception as e:
            print(f"Error processing chat query: {e}")
            return {
                "response": "I encountered an error while processing your question. Please try again.",
                "context_used": {},
                "success": False,
                "error": str(e)
            }

# Create a singleton instance
chatbot_service = ChatbotService() 