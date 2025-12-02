'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useBattleStore, useUserStore } from '@/stores';
import { TopBar, Card, EnergyDisplay, Button } from '@/components/ui';
import { Subject } from '@/lib/database.types';

export default function BattlePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const { user } = useUserStore();
  const { phase, startSearch, resetBattle } = useBattleStore();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reset battle state on mount
  useEffect(() => {
    resetBattle();
  }, [resetBattle]);
  
  // Load subjects
  useEffect(() => {
    async function fetchSubjects() {
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .gt('question_count', 4) // Need at least 5 questions for a battle
        .order('name');
      
      setSubjects(data || []);
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
  
  const examTypeIcons: Record<string, string> = {
    'LET': '👩‍🏫',
    'Nursing': '👩‍⚕️',
    'Criminology': '👮',
  };
  
  return (
    <>
      <TopBar
        title="Battle Mode"
        rightContent={
          <EnergyDisplay current={user?.energy ?? 0} max={user?.max_energy ?? 5} />
        }
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-3">⚔️</div>
          <h1 className="text-2xl font-bold text-foreground">1v1 Battle</h1>
          <p className="text-muted-foreground mt-1">
            Challenge another reviewer in real-time!
          </p>
        </div>
        
        {/* Energy warning */}
        {user && user.energy < 1 && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center">
            <span className="text-yellow-600">⚡ No energy left!</span>
            <p className="text-sm text-muted-foreground mt-1">
              Energy regenerates every 30 minutes.
            </p>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-center">
            {error}
          </div>
        )}
        
        {/* Subject selection */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Select Battle Subject
          </h2>
          
          <div className="space-y-2">
            {subjects.map((subject) => (
              <motion.div
                key={subject.id}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`p-4 flex items-center gap-4 cursor-pointer transition-all ${
                    selectedSubject === subject.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedSubject(subject.id)}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl">
                    {examTypeIcons[subject.exam_type] || '📖'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{subject.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {subject.question_count} questions • {subject.exam_type}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 transition-colors ${
                      selectedSubject === subject.id
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}
                  >
                    {selectedSubject === subject.id && (
                      <svg className="w-full h-full text-primary-foreground" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                        />
                      </svg>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Battle info */}
        <Card className="p-4 bg-secondary/50">
          <h3 className="font-semibold text-foreground mb-2">Battle Rules</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 5 questions per battle</li>
            <li>• 15 seconds per question</li>
            <li>• Matched with similar MMR players</li>
            <li>• Win to gain MMR and coins!</li>
          </ul>
        </Card>
        
        {/* Find match button */}
        <div className="pt-4">
          <Button
            className="w-full"
            size="lg"
            onClick={handleFindMatch}
            disabled={!selectedSubject || isSearching || (user?.energy ?? 0) < 1}
            isLoading={isSearching}
          >
            {isSearching ? 'Finding Opponent...' : '⚔️ Find Match'}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Costs 1 ⚡ energy
          </p>
        </div>
      </main>
    </>
  );
}
