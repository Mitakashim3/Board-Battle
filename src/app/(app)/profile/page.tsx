'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, Save, X, Trophy, Zap, Target, Flame } from 'lucide-react';
import { useUserStore } from '@/stores';
import { createClient } from '@/lib/supabase/client';
import { getMmrTier } from '@/lib/utils';
import { ToastContainer } from '@/components/ui/Toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, logout } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const supabase = createClient();
  const mmrTier = user ? getMmrTier(user.mmr) : null;
  
  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    const { error } = await supabase
      .from('users')
      .update({ username })
      .eq('id', user.id);
    
    if (!error) {
      updateUser({ username });
      setIsEditing(false);
    }
    
    setIsSaving(false);
  };
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      logout();
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      // Force logout anyway
      logout();
      router.replace('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <>
      <ToastContainer />
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#0a1628]/60 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-sm text-gray-400">Manage your account</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <div className="w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>
      
      <div className="p-6 lg:p-8 space-y-8">
        {/* Profile Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a3a5c] via-[#0d2847] to-[#071020] border border-white/10 p-8">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-500/20">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-xl font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setUsername(user.username ?? '');
                    }}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <h2 className="text-3xl font-bold">{user.username}</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-gray-400">{user.email}</p>
              {mmrTier && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium">
                  <Trophy className="w-4 h-4" />
                  {mmrTier.name} League
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              <div className="text-center px-6 py-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-2xl font-bold text-yellow-400">{user.coins}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Coins</p>
              </div>
              <div className="text-center px-6 py-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-2xl font-bold text-blue-400">{user.mmr}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">MMR</p>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-2xl" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-semibold">Accuracy</h3>
            </div>
            <p className="text-3xl font-bold">0%</p>
            <p className="text-sm text-gray-400 mt-1">Overall performance</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-semibold">Best Streak</h3>
            </div>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-gray-400 mt-1">Consecutive correct</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-semibold">Energy</h3>
            </div>
            <p className="text-3xl font-bold">{user.energy}/{user.max_energy}</p>
            <p className="text-sm text-gray-400 mt-1">Current energy</p>
          </div>
        </div>
      </div>
    </>
  );
}
