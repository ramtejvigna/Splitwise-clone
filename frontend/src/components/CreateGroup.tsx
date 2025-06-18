import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import type { User, GroupCreate } from '../types';

interface CreateGroupProps {
  users: User[];
}

const CreateGroup = ({ users }: CreateGroupProps) => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUserToggle = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }
    
    if (selectedUsers.length === 0) {
      setError('Please select at least one member');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const groupData: GroupCreate = {
        name: groupName.trim(),
        user_ids: selectedUsers,
      };
      
      const newGroup = await apiService.createGroup(groupData);
      navigate(`/groups/${newGroup.id}`);
    } catch (error: any) {
      console.error('Failed to create group:', error);
      setError(error.response?.data?.detail || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const selectedUsersData = users.filter(user => selectedUsers.includes(user.id));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Group</h1>
              <p className="text-gray-600">Set up a new group to split expenses with friends</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Group Name */}
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Weekend Trip, Roommates, Office Lunch"
              className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
              disabled={loading}
            />
          </div>

          {/* Members Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Select Members *
            </label>
            
            {/* Selected Members Preview */}
            {selectedUsers.length > 0 && (
              <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-emerald-800">
                    Selected Members ({selectedUsers.length})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedUsersData.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 border border-emerald-200"
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                      <button
                        type="button"
                        onClick={() => handleUserToggle(user.id)}
                        className="text-emerald-600 hover:text-emerald-800"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {users.map((user) => {
                const isSelected = selectedUsers.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleUserToggle(user.id)}
                    className={`relative flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                    disabled={loading}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckIcon className="h-5 w-5 text-emerald-600" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

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
              onClick={() => navigate('/groups')}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !groupName.trim() || selectedUsers.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5" />
                  <span>Create Group</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup; 