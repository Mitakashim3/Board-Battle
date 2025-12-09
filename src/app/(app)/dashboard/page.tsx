'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import {
  BookOpen,
  Swords,
  Trophy,
  Settings,
  Bell,
  ChevronRight,
  Flame,
  Target,
  Zap,
  BarChart3,
  Sparkles,
  Play,
} from 'lucide-react';
import { useUserStore } from '@/stores';
import { createClient } from '@/lib/supabase/client';
import { Subject, UserProgress } from '@/lib/database.types';
import { getMmrTier } from '@/lib/utils';
import { ToastContainer } from '@/components/ui/Toast';

export default function DashboardPage() {
  const { user } = useUserStore();
  const supabase = createClient();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs for GSAP animations
  const cardsRef = useRef<HTMLDivElement>(null);
  
  const mmrTier = user ? getMmrTier(user.mmr) : null;

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .order('exam_type', { ascending: true })
        .order('name', { ascending: true });
      
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

  // GSAP Animations
  useEffect(() => {
    if (isLoading) return; // Don't animate while loading
    
    const cards = document.querySelectorAll('.dashboard-card');
    if (cards.length === 0) return; // Don't animate if no cards exist
    
    const ctx = gsap.context(() => {
      // Staggered card fade up
      gsap.fromTo(
        '.dashboard-card',
        { y: 20, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.2,
        }
      );
    });

    return () => ctx.revert();
  }, [isLoading]);

  // Calculate stats
  const totalAnswered = progress.reduce((sum, p) => sum + p.questions_answered, 0);
  const totalCorrect = progress.reduce((sum, p) => sum + p.correct_answers, 0);
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const bestStreak = progress.length > 0 ? Math.max(...progress.map(p => p.best_streak)) : 0;

  // Group subjects by exam type
  const subjectsByType = subjects.reduce((acc, subject) => {
    if (!acc[subject.exam_type]) acc[subject.exam_type] = [];
    acc[subject.exam_type].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);

  if (isLoading) {
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
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-gray-400">Welcome back, {user?.username || 'Warrior'}</p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Energy */}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-semibold">{user?.energy ?? 0}/{user?.max_energy ?? 5}</span>
                </div>
                
                {/* Coins */}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30" />
                  <span className="text-sm font-semibold">{user?.coins ?? 0}</span>
                </div>
                
                {/* Profile */}
                <Link href="/profile">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a4a7c] to-[#0d2847] flex items-center justify-center text-sm font-bold hover:scale-105 transition-transform">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </Link>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-6 lg:p-8 space-y-8" ref={cardsRef}>
            {/* Welcome Banner */}
            <div className="dashboard-card relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a3a5c] via-[#0d2847] to-[#071020] border border-white/10 p-6 lg:p-8">
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">Ready to review?</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold mb-2">Continue your journey</h2>
                  <p className="text-gray-400">Pick up where you left off or start a new challenge</p>
                </div>
                <Link
                  href="/reviewer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#0a1628] font-semibold hover:bg-gray-100 transition-all hover:scale-105"
                >
                  <Play className="w-5 h-5" />
                  Start Review
                </Link>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-gradient-to-t from-purple-500/10 to-transparent rounded-full blur-2xl" />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* MMR Card */}
              <div className="dashboard-card group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10 p-5 hover:border-yellow-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-500/5 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Rating</p>
                    <p className="text-3xl font-bold">{user?.mmr ?? 1000}</p>
                    {mmrTier && (
                      <p className="text-sm text-yellow-400 mt-1 font-medium">{mmrTier.name}</p>
                    )}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500/50 via-amber-500/50 to-transparent" />
              </div>

              {/* Accuracy Card */}
              <div className="dashboard-card group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10 p-5 hover:border-emerald-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Accuracy</p>
                    <p className="text-3xl font-bold">{overallAccuracy}%</p>
                    <p className="text-sm text-emerald-400 mt-1 font-medium">{totalCorrect}/{totalAnswered} correct</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/50 via-green-500/50 to-transparent" />
              </div>

              {/* Streak Card */}
              <div className="dashboard-card group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10 p-5 hover:border-orange-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Best Streak</p>
                    <p className="text-3xl font-bold">{bestStreak}</p>
                    <p className="text-sm text-orange-400 mt-1 font-medium">consecutive</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Flame className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500/50 via-red-500/50 to-transparent" />
              </div>

              {/* Questions Card */}
              <div className="dashboard-card group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10 p-5 hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Questions</p>
                    <p className="text-3xl font-bold">{totalAnswered}</p>
                    <p className="text-sm text-blue-400 mt-1 font-medium">answered</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/50 via-cyan-500/50 to-transparent" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Link href="/reviewer" className="dashboard-card group">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a3a5c] to-[#0d2847] border border-white/10 p-6 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1a4a7c]/20 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookOpen className="w-7 h-7 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Solo Review</h3>
                        <p className="text-sm text-gray-400">Practice at your own pace</p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:translate-x-2 group-hover:text-white transition-all" />
                  </div>
                </div>
              </Link>

              <Link href="/battle" className="dashboard-card group">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a3a5c] to-[#0d2847] border border-white/10 p-6 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1a4a7c]/20 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Swords className="w-7 h-7 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Battle Arena</h3>
                        <p className="text-sm text-gray-400">Challenge other reviewers</p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:translate-x-2 group-hover:text-white transition-all" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Subjects by Exam Type */}
            {isLoading ? (
              <div className="dashboard-card rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10 p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-gray-400">Loading subjects...</p>
                </div>
              </div>
            ) : (
              Object.entries(subjectsByType).map(([examType, typeSubjects]) => (
                <div key={examType} className="dashboard-card">
                  <div className="rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10 overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500" />
                        <h2 className="text-xl font-bold">{examType} Review</h2>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white/5 text-sm text-gray-400">{typeSubjects.length} subjects</span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {typeSubjects.map((subject) => {
                        const subjectProgress = progress.find(p => p.subject_id === subject.id);
                        const accuracy = subjectProgress
                          ? Math.round((subjectProgress.correct_answers / subjectProgress.questions_answered) * 100) || 0
                          : 0;

                        return (
                          <Link
                            key={subject.id}
                            href={`/reviewer/${subject.id}`}
                            className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-all duration-200 group"
                          >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a4a7c]/30 to-[#0d2847]/30 border border-white/5 flex items-center justify-center group-hover:border-blue-500/30 transition-colors text-2xl">
                              {subject.icon_url || '📚'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">{subject.name}</h3>
                              <p className="text-sm text-gray-500">{subject.question_count} questions</p>
                            </div>
                            <div className="text-right">
                              {subjectProgress ? (
                                <>
                                  <p className="font-bold text-white">{accuracy}%</p>
                                  <p className="text-xs text-gray-500">{subjectProgress.questions_answered} done</p>
                                </>
                              ) : (
                                <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-sm text-blue-400 font-medium">Start</span>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:translate-x-1 group-hover:text-white transition-all" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Empty state */}
            {!isLoading && subjects.length === 0 && (
              <div className="dashboard-card rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10 p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No subjects available</h3>
                <p className="text-gray-400">Check back later for new review materials.</p>
              </div>
            )}
          </div>
    </>
  );
}
