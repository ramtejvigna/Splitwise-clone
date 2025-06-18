import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  UserGroupIcon,
  PlusIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UsersIcon,
  ReceiptRefundIcon,
  ArrowsRightLeftIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import type { GroupDetail as GroupDetailType, Expense, GroupBalances } from '../types';

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<GroupDetailType | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<GroupBalances | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances'>('expenses');

  useEffect(() => {
    if (id) {
      loadGroupData();
    }
  }, [id]);

  const loadGroupData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [groupData, expensesData, balancesData] = await Promise.all([
        apiService.getGroup(parseInt(id)),
        apiService.getGroupExpenses(parseInt(id)),
        apiService.getGroupBalances(parseInt(id)),
      ]);

      setGroup(groupData);
      setExpenses(expensesData);
      setBalances(balancesData);
    } catch (error) {
      console.error('Failed to load group data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getUserName = (userId: number) => {
    return group?.users.find(user => user.id === userId)?.name || 'Unknown';
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="bg-white rounded-xl h-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <UserGroupIcon className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Group not found</h3>
        <p className="mt-2 text-gray-500">The group you're looking for doesn't exist.</p>
        <Link
          to="/groups"
          className="mt-6 inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Back to Groups
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/groups"
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          <p className="text-gray-600">
            {group.users.length} members • Created {formatDate(group.created_at)}
          </p>
        </div>
        <Link
          to={`/groups/${group.id}/add-expense`}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg px-6 py-3 font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center space-x-2 shadow-sm"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Expense</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Members</p>
              <p className="text-2xl font-bold text-gray-900">{group.users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">₹{group.total_expenses.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ReceiptRefundIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Members</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.users.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'expenses'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Expenses ({expenses.length})
            </button>
            <button
              onClick={() => setActiveTab('balances')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'balances'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Balances
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'expenses' ? (
            <div className="space-y-4">
              {expenses.length === 0 ? (
                <div className="text-center py-8">
                  <ReceiptRefundIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No expenses yet</h3>
                  <p className="mt-2 text-gray-500">Add your first expense to get started.</p>
                  <Link
                    to={`/groups/${group.id}/add-expense`}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add First Expense
                  </Link>
                </div>
              ) : (
                expenses.map((expense) => (
                  <div key={expense.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{expense.description}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span>Paid by {getUserName(expense.paid_by)}</span>
                          <span>•</span>
                          <span>{formatDate(expense.created_at)}</span>
                          <span>•</span>
                          <span className="capitalize">{expense.split_type} split</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                         ₹{expense.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Individual Balances */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Individual Balances</h3>
                <div className="space-y-3">
                  {balances?.balances.map((balance) => (
                    <div key={balance.user_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {balance.user_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{balance.user_name}</span>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          balance.balance > 0
                            ? 'text-green-600'
                            : balance.balance < 0
                            ? 'text-red-600'
                            : 'text-gray-500'
                        }`}>
                          {balance.balance > 0
                            ? `+₹${balance.balance.toFixed(2)}`
                            : balance.balance < 0
                            ? `-₹${Math.abs(balance.balance).toFixed(2)}`
                            : '₹0.00'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {balance.balance > 0
                            ? 'gets back'
                            : balance.balance < 0
                            ? 'owes'
                            : 'settled up'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simplified Transactions */}
              {balances?.simplified_transactions && balances.simplified_transactions.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <ArrowsRightLeftIcon className="h-5 w-5 mr-2" />
                    Suggested Settlements
                  </h3>
                  <div className="space-y-3">
                    {balances.simplified_transactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {transaction.from_user.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{transaction.from_user}</span>
                          <span className="text-gray-500">pays</span>
                          <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {transaction.to_user.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{transaction.to_user}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-blue-600">
                            ₹{transaction.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetail; 