import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  PlusIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import type { User, Group } from '../types';

interface DashboardProps {
  users: User[];
}

const Dashboard = ({ users }: DashboardProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const groupsData = await apiService.getGroups();
      setGroups(groupsData);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-white rounded-xl h-32"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl h-64"></div>
          <div className="bg-white rounded-xl h-64"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl text-white p-8">
        <h1 className="text-3xl font-bold mb-2">
          Splitwise Dashboard 💰
        </h1>
        <p className="text-emerald-100">
          Manage expenses and track balances across all users and groups.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* All Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
          </div>
          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <UserIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="p-2 bg-blue-100 rounded-full">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All Groups */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">All Groups</h2>
              <Link
                to="/groups"
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {groups.length === 0 ? (
              <div className="text-center py-8">
                <UserGroupIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-gray-500">No groups yet</p>
                <Link
                  to="/create-group"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create First Group
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.slice(0, 6).map((group) => (
                  <Link
                    key={group.id}
                    to={`/groups/${group.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{group.name}</h3>
                        <p className="text-sm text-gray-500">
                          {group.users.length} members
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/create-group"
            className="flex items-center p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200"
          >
            <PlusIcon className="h-6 w-6 mr-3" />
            <div>
              <h3 className="font-medium">Create New Group</h3>
              <p className="text-sm text-emerald-100">Start splitting expenses with friends</p>
            </div>
          </Link>
          <Link
            to="/groups"
            className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
          >
            <UserGroupIcon className="h-6 w-6 mr-3" />
            <div>
              <h3 className="font-medium">Browse Groups</h3>
              <p className="text-sm text-blue-100">View and manage your groups</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 