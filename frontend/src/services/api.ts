import axios from 'axios';
import type {
  User,
  Group,
  GroupDetail,
  GroupCreate,
  Expense,
  ExpenseCreate,
  GroupBalances,
  UserBalances,
  ChatRequest,
  ChatResponse,
} from '../types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request/response interceptors for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Users
  async getUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  },

  // Groups
  async getGroups(): Promise<Group[]> {
    const response = await api.get('/groups');
    return response.data;
  },

  async getGroup(groupId: number): Promise<GroupDetail> {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  },

  async createGroup(group: GroupCreate): Promise<Group> {
    const response = await api.post('/groups', group);
    return response.data;
  },

  // Expenses
  async getGroupExpenses(groupId: number): Promise<Expense[]> {
    const response = await api.get(`/groups/${groupId}/expenses`);
    return response.data;
  },

  async createExpense(groupId: number, expense: ExpenseCreate): Promise<Expense> {
    const response = await api.post(`/groups/${groupId}/expenses`, expense);
    return response.data;
  },

  // Balances
  async getGroupBalances(groupId: number): Promise<GroupBalances> {
    const response = await api.get(`/groups/${groupId}/balances`);
    return response.data;
  },

  async getUserBalances(userId: number): Promise<UserBalances> {
    const response = await api.get(`/users/${userId}/balances`);
    return response.data;
  },

  // Chatbot
  async sendChatMessage(chatRequest: ChatRequest): Promise<ChatResponse> {
    const response = await api.post('/chat', chatRequest);
    return response.data;
  },
};

export default apiService; 