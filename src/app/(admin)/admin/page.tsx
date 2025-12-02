'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/stores';
import { TopBar, Card } from '@/components/ui';
import { Subject } from '@/lib/database.types';

export default function AdminDashboard() {
  const { user } = useUserStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalUsers: 0,
    totalBattles: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      
      setSubjects(subjectsData || []);
      
      // Get stats (simplified - in production you'd use proper count queries)
      const { count: questionCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });
      
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      const { count: battleCount } = await supabase
        .from('battles')
        .select('*', { count: 'exact', head: true });
      
      setStats({
        totalQuestions: questionCount || 0,
        totalUsers: userCount || 0,
        totalBattles: battleCount || 0,
      });
      
      setIsLoading(false);
    }
    
    fetchData();
  }, [supabase]);
  
  return (
    <>
      <TopBar
        title="Admin Dashboard"
        showBack
        rightContent={
          <span className="text-sm text-muted-foreground">
            👋 {user?.username}
          </span>
        }
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats overview */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{stats.totalQuestions}</div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
            <div className="text-xs text-muted-foreground">Users</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{stats.totalBattles}</div>
            <div className="text-xs text-muted-foreground">Battles</div>
          </Card>
        </div>
        
        {/* Quick actions */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/questions">
              <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="text-2xl mb-2">➕</div>
                <h3 className="font-semibold text-foreground">Add Questions</h3>
                <p className="text-xs text-muted-foreground">Bulk import questions</p>
              </Card>
            </Link>
            
            <Link href="/admin/subjects">
              <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="text-2xl mb-2">📚</div>
                <h3 className="font-semibold text-foreground">Manage Subjects</h3>
                <p className="text-xs text-muted-foreground">Add or edit subjects</p>
              </Card>
            </Link>
          </div>
        </section>
        
        {/* Subjects list */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Subjects Overview</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {subjects.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/admin/subjects/${subject.id}`}>
                    <Card className="p-4 flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{subject.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {subject.exam_type} • {subject.question_count} questions
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Card>
                  </Link>
                </motion.div>
              ))}
              
              {subjects.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No subjects yet. Create one to get started!</p>
                </Card>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
