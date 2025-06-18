import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  UserGroupIcon,
  PlusIcon,
  CurrencyDollarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import type { User } from '../types';

interface LayoutProps {
  children: ReactNode;
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  users: User[];
}

const Layout = ({ children, currentUser, setCurrentUser, users }: LayoutProps) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Groups', href: '/groups', icon: UserGroupIcon },
    { name: 'My Balance', href: '/my-balance', icon: CurrencyDollarIcon },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  SplitWise
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              <div className="hidden md:flex space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActiveRoute(item.href)
                          ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                          : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* User Selector */}
              {currentUser && (
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-gray-600" />
                  <select
                    value={currentUser.id}
                    onChange={(e) => {
                      const selectedUser = users.find(user => user.id === parseInt(e.target.value));
                      if (selectedUser) setCurrentUser(selectedUser);
                    }}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quick Action Button */}
              <Link
                to="/create-group"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center space-x-2 shadow-sm"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="hidden sm:inline">New Group</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 bg-white/90 backdrop-blur-sm">
          <div className="flex justify-around py-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActiveRoute(item.href)
                      ? 'text-emerald-700'
                      : 'text-gray-600 hover:text-emerald-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout; 