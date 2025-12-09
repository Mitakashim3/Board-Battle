'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/lib/database.types';
import { Search, Shield, UserCheck, Calendar, TrendingUp, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function AdminUsersPage() {
  const supabase = createClient();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string | null }>({ 
    show: false, 
    id: null 
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  async function fetchUsers() {
    setIsLoading(true);
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    setUsers(data || []);
    setIsLoading(false);
  }

  function filterUsers() {
    let filtered = [...users];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }

  async function handleDelete(userId: string) {
    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (!error) {
      setUsers(users.filter((u) => u.id !== userId));
      setSuccessMessage('User deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    }

    setDeleteModal({ show: false, id: null });
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setSuccessMessage(`Role updated to ${newRole}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen">
      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-4 right-4 z-50 p-4 bg-green-600 text-white rounded-lg shadow-lg flex items-center gap-2"
        >
          <UserCheck className="w-5 h-5" />
          {successMessage}
        </motion.div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a1628]/90 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-5">
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-sm text-gray-400 mt-1">View and manage all users</p>
        </div>
      </div>

      <main className="container mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-5 rounded-xl bg-[#0d1f35] border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{users.length}</p>
                <p className="text-sm text-gray-400">Total Users</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#0d1f35] border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {users.filter((u) => u.role === 'admin').length}
                </p>
                <p className="text-sm text-gray-400">Admins</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#0d1f35] border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {users.filter((u) => u.role === 'student').length}
                </p>
                <p className="text-sm text-gray-400">Students</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#0d1f35] border border-white/5 text-center">
            <p className="text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-5 rounded-xl bg-[#0d1f35] border border-white/5 hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-white font-bold text-lg">
                      {user.username.charAt(0).toUpperCase()}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{user.username}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{user.email}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Joined {formatDate(user.created_at)}
                        </span>
                        <span>🪙 {user.coins} coins</span>
                        <span>⚡ {user.energy}/{user.max_energy} energy</span>
                        <span>🏆 {user.mmr} MMR</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRole(user.id, user.role)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors text-sm font-medium border border-white/10"
                    >
                      {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    <button
                      onClick={() => setDeleteModal({ show: true, id: user.id })}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <ConfirmModal
          isOpen={true}
          title="Delete User"
          description="Are you sure you want to delete this user? This action cannot be undone and will remove all their data."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={() => deleteModal.id && handleDelete(deleteModal.id)}
          onClose={() => setDeleteModal({ show: false, id: null })}
          variant="danger"
        />
      )}
    </div>
  );
}
