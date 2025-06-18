import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  PlusIcon,
  ChevronLeftIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import type { GroupDetail, ExpenseCreate } from '../types';

const CreateExpense = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState<number | null>(null);
  const [splitType, setSplitType] = useState<'equal' | 'percentage' | 'exact'>('equal');
  const [percentageSplits, setPercentageSplits] = useState<Record<number, number>>({});
  const [exactSplits, setExactSplits] = useState<Record<number, number>>({});

  useEffect(() => {
    if (id) {
      loadGroup();
    }
  }, [id]);

  const loadGroup = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const groupData = await apiService.getGroup(parseInt(id));
      setGroup(groupData);
      
      // Initialize splits
      const initialPercentage = Math.floor(100 / groupData.users.length);
      const initialExact = 0;
      
      const percentageInit: Record<number, number> = {};
      const exactInit: Record<number, number> = {};
      
      groupData.users.forEach(user => {
        percentageInit[user.id] = initialPercentage;
        exactInit[user.id] = initialExact;
      });
      
      setPercentageSplits(percentageInit);
      setExactSplits(exactInit);
      
      // Set first user as default payer
      if (groupData.users.length > 0) {
        setPaidBy(groupData.users[0]!.id);
      }
    } catch (error) {
      console.error('Failed to load group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePercentageChange = (userId: number, value: number) => {
    setPercentageSplits(prev => ({
      ...prev,
      [userId]: value
    }));
  };

  const handleExactChange = (userId: number, value: number) => {
    setExactSplits(prev => ({
      ...prev,
      [userId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!group || !paidBy) return;
    
    // Validation
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Validate splits based on type
    let splits: Record<number, number> | undefined;
    
    if (splitType === 'percentage') {
      const total = Object.values(percentageSplits).reduce((sum, val) => sum + val, 0);
      if (Math.abs(total - 100) > 0.01) {
        setError('Percentages must add up to 100%');
        return;
      }
      splits = percentageSplits;
    } else if (splitType === 'exact') {
      const total = Object.values(exactSplits).reduce((sum, val) => sum + val, 0);
      if (Math.abs(total - amountNum) > 0.01) {
        setError(`Exact amounts must add up to ₹${amountNum.toFixed(2)}`);
        return;
      }
      splits = exactSplits;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const expenseData: ExpenseCreate = {
        description: description.trim(),
        amount: amountNum,
        paid_by: paidBy,
        split_type: splitType,
        splits: splits,
      };
      
      await apiService.createExpense(group.id, expenseData);
      navigate(`/groups/${group.id}`);
    } catch (error: any) {
      console.error('Failed to create expense:', error);
      setError(error.response?.data?.detail || 'Failed to create expense');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="bg-white rounded-xl h-96"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Group not found</h3>
        <p className="mt-2 text-gray-500">The group you're looking for doesn't exist.</p>
      </div>
    );
  }

  const totalPercentage = Object.values(percentageSplits).reduce((sum, val) => sum + val, 0);
  const totalExact = Object.values(exactSplits).reduce((sum, val) => sum + val, 0);
  const amountNum = parseFloat(amount) || 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/groups/${group.id}`)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>
                <p className="text-gray-600">Split an expense in {group.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Dinner at restaurant, Groceries, Gas"
              className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
              disabled={submitting}
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-lg">₹</span>
              </div>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="block w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Paid by *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setPaidBy(user.id)}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                    paidBy === user.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                  disabled={submitting}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    paidBy === user.id
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-900">{user.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Split Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              How to split *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['equal', 'percentage', 'exact'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSplitType(type)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    splitType === type
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                  disabled={submitting}
                >
                  <div className="text-center">
                    <h3 className="font-medium capitalize">{type}</h3>
                    <p className="text-xs mt-1 opacity-75">
                      {type === 'equal' && 'Split evenly'}
                      {type === 'percentage' && 'By percentage'}
                      {type === 'exact' && 'Exact amounts'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Split Details */}
          {splitType !== 'equal' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {splitType === 'percentage' ? 'Percentage Split' : 'Exact Amounts'}
              </h3>
              
              <div className="space-y-4">
                {group.users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {splitType === 'exact' && <span className="text-gray-500">₹</span>}
                      <input
                        type="number"
                        value={splitType === 'percentage' ? percentageSplits[user.id] || '' : exactSplits[user.id] || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          if (splitType === 'percentage') {
                            handlePercentageChange(user.id, value);
                          } else {
                            handleExactChange(user.id, value);
                          }
                        }}
                        placeholder="0"
                        step={splitType === 'percentage' ? '1' : '0.01'}
                        min="0"
                        max={splitType === 'percentage' ? '100' : undefined}
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center"
                        disabled={submitting}
                      />
                      {splitType === 'percentage' && <span className="text-gray-500">%</span>}
                    </div>
                  </div>
                ))}
                
                {/* Split Summary */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-900">
                      Total: {splitType === 'percentage' ? `${totalPercentage.toFixed(1)}%` : `₹${totalExact.toFixed(2)}`}
                    </span>
                    {splitType === 'percentage' ? (
                      <span className={`text-sm ${Math.abs(totalPercentage - 100) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(totalPercentage - 100) < 0.01 ? '✓ Valid' : `Need ${(100 - totalPercentage).toFixed(1)}% more`}
                      </span>
                    ) : (
                      <span className={`text-sm ${Math.abs(totalExact - amountNum) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(totalExact - amountNum) < 0.01 ? '✓ Valid' : `Need ₹${(amountNum - totalExact).toFixed(2)} more`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(`/groups/${group.id}`)}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !description.trim() || !amount || !paidBy}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Expense</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExpense; 