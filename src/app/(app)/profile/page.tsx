'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUserStore } from '@/stores';
import { createClient } from '@/lib/supabase/client';
import { TopBar, Card, Button, Input } from '@/components/ui';
import { getMmrTier } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, logout } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username ?? '');
  const [isSaving, setIsSaving] = useState(false);
  
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
    await supabase.auth.signOut();
    logout();
    router.push('/');
  };
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <>
      <TopBar title="Profile" />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile card */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                />
              ) : (
                <h2 className="text-xl font-bold text-foreground">{user.username}</h2>
              )}
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave} isLoading={isSaving}>
                  Save
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </Card>
        
        {/* Stats */}
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-4">Your Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              {mmrTier && (
                <>
                  <div className="text-3xl mb-1">{mmrTier.icon}</div>
                  <div className={`font-semibold ${mmrTier.color}`}>{mmrTier.name}</div>
                  <div className="text-2xl font-bold text-foreground">{user.mmr}</div>
                  <div className="text-xs text-muted-foreground">MMR</div>
                </>
              )}
            </Card>
            
            <Card className="p-4 text-center">
              <div className="text-3xl mb-1">🪙</div>
              <div className="text-2xl font-bold text-foreground">{user.coins}</div>
              <div className="text-xs text-muted-foreground">Coins</div>
            </Card>
          </div>
        </section>
        
        {/* Energy */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Energy</h3>
              <p className="text-sm text-muted-foreground">Regenerates every 30 min</p>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: user.max_energy }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-4 h-8 rounded ${
                    i < user.energy ? 'bg-yellow-500' : 'bg-secondary'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
            </div>
          </div>
        </Card>
        
        {/* Settings */}
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-4">Settings</h3>
          <div className="space-y-2">
            <Card className="p-4 flex items-center justify-between">
              <span className="text-foreground">Haptic Feedback</span>
              <input
                type="checkbox"
                className="w-5 h-5 accent-primary"
                defaultChecked
              />
            </Card>
            <Card className="p-4 flex items-center justify-between">
              <span className="text-foreground">Sound Effects</span>
              <input
                type="checkbox"
                className="w-5 h-5 accent-primary"
                defaultChecked
              />
            </Card>
          </div>
        </section>
        
        {/* Admin link */}
        {user.role === 'admin' && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/admin')}
          >
            🔧 Admin Dashboard
          </Button>
        )}
        
        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          Sign Out
        </Button>
      </main>
    </>
  );
}
