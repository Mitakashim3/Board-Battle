'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input, Button } from '@/components/ui';

/**
 * SECRET ADMIN LOGIN PAGE
 * 
 * This page is intentionally NOT linked from anywhere in the app.
 * Only people who know this URL can access it.
 * 
 * Route: /auth/admin-portal
 * 
 * SECURITY FEATURES:
 * 1. Hidden route (not linked anywhere)
 * 2. Uses same auth as regular login (Supabase Auth)
 * 3. After login, middleware checks if user has 'admin' role
 * 4. Non-admins get 404 when trying to access /admin routes
 */
export default function AdminPortalPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const supabase = createClient();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        // Check if user is actually an admin
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (userError || userData?.role !== 'admin') {
          // Sign out non-admin users immediately
          await supabase.auth.signOut();
          setError('Access denied. Admin privileges required.');
          return;
        }

        // Admin verified, redirect to admin dashboard
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Admin Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-gray-400 mt-2 text-sm">Authorized personnel only</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="admin@boardbattle.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-medium rounded-xl transition-colors"
            >
              {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <p className="mt-6 text-center text-xs text-gray-500">
          All login attempts are logged and monitored.
          <br />
          Unauthorized access is prohibited.
        </p>
      </div>
    </main>
  );
}
