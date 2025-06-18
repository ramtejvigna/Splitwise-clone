import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import type { User, UserBalances } from '../types';

interface UserBalanceProps {
  currentUser: User | null;
}

const UserBalance = ({ currentUser }: UserBalanceProps) => {
  const [userBalances, setUserBalances] = useState<UserBalances | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadUserBalances();
    }
  }, [currentUser]);

  const loadUserBalances = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const balancesData = await apiService.getUserBalances(currentUser.id);
      setUserBalances(balancesData);
    } catch (error) {
      console.error('Failed to load user balances:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-white rounded-xl h-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl h-32"></div>
          ))}
        </div>
        <div className="bg-white rounded-xl h-64"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <UserGroupIcon className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No user selected</h3>
        <p className="mt-2 text-gray-500">Please select a user from the navigation to view balances.</p>
      </div>
    );
  }

  if (!userBalances) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Unable to load balances</h3>
        <p className="mt-2 text-gray-500">There was an error loading your balance information.</p>
      </div>
    );
  }

  const totalOwed = userBalances.group_balances
    .filter(b => b.balance < 0)
    .reduce((sum, b) => sum + Math.abs(b.balance), 0);

  const totalOwing = userBalances.group_balances
    .filter(b => b.balance > 0)
    .reduce((sum, b) => sum + b.balance, 0);

  const netBalance = totalOwing - totalOwed;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl text-white p-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">{currentUser.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{currentUser.name}</h1>
            <p className="text-emerald-100">{currentUser.email}</p>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-emerald-100 text-sm font-medium">Total Balance</p>
            <p className={`text-2xl font-bold ${
              netBalance > 0 ? 'text-white' : 
              netBalance < 0 ? 'text-red-200' : 'text-white'
            }`}>
              {netBalance > 0 ? '+' : ''}{netBalance.toFixed(2)}
            </p>
            <p className="text-emerald-100 text-xs mt-1">
              {netBalance > 0 ? 'You are owed overall' : 
               netBalance < 0 ? 'You owe overall' : 'You are settled up'}
            </p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-emerald-100 text-sm font-medium">You're Owed</p>
            <p className="text-2xl font-bold text-white">+₹{totalOwing.toFixed(2)}</p>
            <p className="text-emerald-100 text-xs mt-1">Money coming to you</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-emerald-100 text-sm font-medium">You Owe</p>
            <p className="text-2xl font-bold text-red-200">₹{totalOwed.toFixed(2)}</p>
            <p className="text-emerald-100 text-xs mt-1">Money you need to pay</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Groups</p>
              <p className="text-2xl font-bold text-gray-900">
                {userBalances.group_balances.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Positive Balances</p>
              <p className="text-2xl font-bold text-green-600">
                {userBalances.group_balances.filter(b => b.balance > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Outstanding Debts</p>
              <p className="text-2xl font-bold text-red-600">
                {userBalances.group_balances.filter(b => b.balance < 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Group Balances */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Group Balances</h2>
            <Link
              to="/groups"
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
            >
              View Groups
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {userBalances.group_balances.length === 0 ? (
            <div className="text-center py-8">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No group balances</h3>
              <p className="mt-2 text-gray-500">
                You don't have any active balances in groups yet.
              </p>
              <Link
                to="/create-group"
                className="mt-4 inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Create Your First Group
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userBalances.group_balances.map((balance) => (
                <Link
                  key={balance.group_id}
                  to={`/groups/${balance.group_id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center">
                        <UserGroupIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{balance.group_name}</h3>
                        <p className="text-sm text-gray-500">
                          {balance.balance > 0 
                            ? 'You are owed money' 
                            : balance.balance < 0 
                              ? 'You owe money' 
                              : 'Settled up'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${
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
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 ml-auto" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {userBalances.group_balances.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {totalOwed > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-red-900">Outstanding Debts</h3>
                    <p className="text-sm text-red-700">
                      You owe ₹{totalOwed.toFixed(2)} across {userBalances.group_balances.filter(b => b.balance < 0).length} groups
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {totalOwing > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-900">Money Owed to You</h3>
                    <p className="text-sm text-green-700">
                      You are owed ₹{totalOwing.toFixed(2)} across {userBalances.group_balances.filter(b => b.balance > 0).length} groups
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBalance; 