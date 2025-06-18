export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Group {
  id: number;
  name: string;
  created_at: string;
  users: User[];
}

export interface GroupDetail extends Group {
  total_expenses: number;
}

export interface GroupCreate {
  name: string;
  user_ids: number[];
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  paid_by: number;
  split_type: 'equal' | 'percentage' | 'exact';
  splits?: Record<number, number>;
  created_at: string;
  group_id: number;
}

export interface ExpenseCreate {
  description: string;
  amount: number;
  paid_by: number;
  split_type: 'equal' | 'percentage' | 'exact';
  splits?: Record<number, number>;
}

export interface Balance {
  user_id: number;
  user_name: string;
  balance: number;
}

export interface GroupBalances {
  group_id: number;
  group_name: string;
  balances: Balance[];
  simplified_transactions: SimplifiedTransaction[];
}

export interface SimplifiedTransaction {
  from_user: string;
  to_user: string;
  amount: number;
}

export interface UserBalances {
  user_id: number;
  user_name: string;
  total_balance: number;
  group_balances: Array<{
    group_id: number;
    group_name: string;
    balance: number;
  }>;
} 