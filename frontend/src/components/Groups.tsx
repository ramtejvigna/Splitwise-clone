import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UsersIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import type { Group } from '../types';

const Groups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [groups, searchTerm]);

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

  const filterGroups = () => {
    if (!searchTerm) {
      setFilteredGroups(groups);
    } else {
      const filtered = groups.filter((group) =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.users.some((user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredGroups(filtered);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Groups</h1>
          <p className="text-gray-600">
            Manage your expense groups and view their details
          </p>
        </div>
        <Link
          to="/create-group"
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg px-6 py-3 font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center space-x-2 shadow-sm"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Group</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search groups or members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
        />
      </div>

      {/* Results Count */}
      {searchTerm && (
        <div className="text-sm text-gray-600">
          Found {filteredGroups.length} group{filteredGroups.length !== 1 ? 's' : ''} matching "{searchTerm}"
        </div>
      )}

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {searchTerm ? 'No groups found' : 'No groups yet'}
          </h3>
          <p className="mt-2 text-gray-500 max-w-sm mx-auto">
            {searchTerm
              ? 'Try adjusting your search terms or create a new group.'
              : 'Get started by creating your first group to split expenses with friends.'}
          </p>
          {!searchTerm && (
            <Link
              to="/create-group"
              className="mt-6 inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Your First Group
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all duration-200 group"
            >
              <div className="p-6">
                {/* Group Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {group.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Created {formatDate(group.created_at)}
                    </div>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </div>

                {/* Members */}
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    {group.users.length} member{group.users.length !== 1 ? 's' : ''}
                  </div>

                  {/* Member Avatars */}
                  <div className="flex -space-x-2">
                    {group.users.slice(0, 4).map((user, index) => (
                      <div
                        key={user.id}
                        className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                        title={user.name}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {group.users.length > 4 && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                        +{group.users.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Member Names */}
                  <div className="text-sm text-gray-500">
                    {group.users.slice(0, 3).map((user, index) => (
                      <span key={user.id}>
                        {user.name}
                        {index < Math.min(2, group.users.length - 1) && ', '}
                      </span>
                    ))}
                    {group.users.length > 3 && (
                      <span> and {group.users.length - 3} more</span>
                    )}
                  </div>
                </div>

                {/* Action Hint */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">View details</span>
                    <div className="flex items-center text-emerald-600 group-hover:text-emerald-700 transition-colors">
                      <span className="mr-1">Manage</span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Groups; 