'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUserStore } from '@/stores';
import { createClient } from '@/lib/supabase/client';
import { TopBar, EnergyDisplay, CoinDisplay, MmrDisplay, Card } from '@/components/ui';
import { Subject, UserProgress } from '@/lib/database.types';
import { getMmrTier } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useUserStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();
  const mmrTier = user ? getMmrTier(user.mmr) : null;
  
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      
      // Fetch user progress
      if (user) {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);
        
        setProgress(progressData || []);
      }
      
      setSubjects(subjectsData || []);
      setIsLoading(false);
    }
    
    fetchData();
  }, [supabase, user]);
  
  return (
    <>
      <TopBar
        title="Dashboard"
        rightContent={
          <div className="flex items-center gap-4">
            <EnergyDisplay current={user?.energy ?? 0} max={user?.max_energy ?? 5} />
            <CoinDisplay amount={user?.coins ?? 0} />
          </div>
        }
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6"
        >
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.username ?? 'Warrior'}! 👋
          </h1>
          <div className="flex items-center gap-4 mt-3">
            {mmrTier && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{mmrTier.icon}</span>
                <span className={`font-semibold ${mmrTier.color}`}>{mmrTier.name}</span>
              </div>
            )}
            <MmrDisplay mmr={user?.mmr ?? 1000} />
          </div>
        </motion.div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/reviewer">
            <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="font-semibold text-foreground">Solo Review</h3>
              <p className="text-sm text-muted-foreground">Practice at your pace</p>
            </Card>
          </Link>
          
          <Link href="/battle">
            <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="text-3xl mb-2">⚔️</div>
              <h3 className="font-semibold text-foreground">Battle Mode</h3>
              <p className="text-sm text-muted-foreground">Challenge opponents</p>
            </Card>
          </Link>
        </div>
        
        {/* Subjects */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Your Subjects
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : subjects.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No subjects available yet.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {subjects.map((subject, index) => {
                const subjectProgress = progress.find(p => p.subject_id === subject.id);
                const accuracy = subjectProgress 
                  ? Math.round((subjectProgress.correct_answers / subjectProgress.questions_answered) * 100) || 0
                  : 0;
                
                return (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/reviewer/${subject.id}`}>
                      <Card className="p-4 flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                          {subject.exam_type === 'LET' ? '👩‍🏫' : 
                           subject.exam_type === 'Nursing' ? '👩‍⚕️' : '👮'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {subject.question_count} questions • {subject.exam_type}
                          </p>
                        </div>
                        <div className="text-right">
                          {subjectProgress ? (
                            <>
                              <div className="font-bold text-primary">{accuracy}%</div>
                              <div className="text-xs text-muted-foreground">
                                {subjectProgress.questions_answered} answered
                              </div>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">Start</span>
                          )}
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
        
        {/* Daily Streak */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Daily Streak</h3>
              <p className="text-sm text-muted-foreground">Keep reviewing every day!</p>
            </div>
            <div className="text-right">
              <div className="text-3xl">🔥</div>
              <div className="font-bold text-orange-500">
                {progress.length > 0 
                  ? Math.max(...progress.map(p => p.streak)) 
                  : 0} days
              </div>
            </div>
          </div>
        </Card>
      </main>
    </>
  );
}
