'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Swords, Zap, Trophy, AlertCircle, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useBattleStore, useUserStore } from '@/stores';
import { Subject } from '@/lib/database.types';
import { ToastContainer } from '@/components/ui/Toast';

export default function BattlePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const { user } = useUserStore();
  const { startSearch, resetBattle } = useBattleStore();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Reset battle state on mount
  useEffect(() => {
    resetBattle();
  }, [resetBattle]);
  
  // Load subjects
  useEffect(() => {
    async function fetchSubjects() {
      setIsLoading(true);
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .gt('question_count', 4) // Need at least 5 questions for a battle
        .order('name');
      
      setSubjects(data || []);
      setIsLoading(false);
    }
    
    fetchSubjects();
  }, [supabase]);
  
  // Handle find match
  const handleFindMatch = async () => {
    if (!selectedSubject || !user) return;
    
    if (user.energy < 1) {
      setError('Not enough energy! Wait for regeneration or come back later.');
      return;
    }
    
    setIsSearching(true);
    setError(null);
    startSearch();
    
    try {
      const { data, error: rpcError } = await supabase.rpc('find_or_create_battle', {
        p_subject_id: selectedSubject,
      });
      
      if (rpcError) {
        throw rpcError;
      }
      
      if (data?.battle_id) {
        router.push(`/battle/${data.battle_id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to find match. Please try again.');
      setIsSearching(false);
      resetBattle();
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
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
            <h1 className="text-2xl font-bold">Battle Arena</h1>
            <p className="text-sm text-gray-400">Challenge others in real-time</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold">{user?.energy ?? 0}/{user?.max_energy ?? 5}</span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="p-6 lg:p-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-[#071020] border border-purple-500/20 p-8 text-center">
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 mb-2">
              <Swords className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold">1v1 Battle</h2>
            <p className="text-gray-400 max-w-md">
              Compete against other reviewers in real-time. Win battles to earn MMR and climb the leaderboard!
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-2xl" />
        </div>

        {/* Subject Selection */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-4">Select Subject</h3>
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`group relative p-4 rounded-xl border text-left transition-all duration-200 ${
                  selectedSubject === subject.id
                    ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <h4 className={`font-semibold mb-1 ${selectedSubject === subject.id ? 'text-purple-400' : 'text-white'}`}>
                  {subject.name}
                </h4>
                <p className="text-sm text-gray-400">{subject.question_count} questions</p>
                
                {selectedSubject === subject.id && (
                  <div className="absolute top-4 right-4 w-3 h-3 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleFindMatch}
            disabled={!selectedSubject || isSearching || (user?.energy ?? 0) < 1}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
              !selectedSubject || (user?.energy ?? 0) < 1
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                : isSearching
                ? 'bg-purple-600/50 text-white cursor-wait'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02]'
            }`}
          >
            {isSearching ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Finding Opponent...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Find Match
              </>
            )}
          </button>
          
          {(user?.energy ?? 0) < 1 && (
            <p className="text-center text-sm text-yellow-400 mt-4">
              Not enough energy to battle. Wait for regeneration.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
