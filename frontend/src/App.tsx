import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Groups from './components/Groups';
import GroupDetail from './components/GroupDetail';
import CreateGroup from './components/CreateGroup';
import CreateExpense from './components/CreateExpense';
import UserBalance from './components/UserBalance';
import { apiService } from './services/api';
import type { User } from './types';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await apiService.getUsers();
      setUsers(usersData);
      // Set first user as current user for demo purposes
      if (usersData.length > 0) {
        setCurrentUser(usersData[0]!);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Layout 
        currentUser={currentUser} 
        setCurrentUser={setCurrentUser} 
        users={users}
      >
        <Routes>
          <Route path="/" element={<Dashboard users={users} />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/create-group" element={<CreateGroup users={users} />} />
          <Route path="/groups/:id/add-expense" element={<CreateExpense />} />
          <Route path="/my-balance" element={<UserBalance currentUser={currentUser} />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
