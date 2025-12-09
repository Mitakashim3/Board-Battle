'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import {
  FileQuestion,
  BookOpen,
  Users,
  Swords,
  ChevronRight,
  Plus,
  Upload,
  BarChart3,
  TrendingUp,
  Activity,
  Search,
  Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/stores';
import { Subject } from '@/lib/database.types';
import { AdminSidebar } from '@/components/layout';

export default function AdminDashboard() {
  const { user } = useUserStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalUsers: 0,
    totalBattles: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Refs for GSAP animations
  const bgShapesRef = useRef<HTMLDivElement>(null);

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

      // Get stats
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

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered card fade up
      gsap.fromTo(
        '.admin-card',
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

      // Background shapes slow float
      gsap.to('.bg-shape', {
        y: -30,
        duration: 8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 2,
      });
    });

    return () => ctx.revert();
  }, [isLoading]);

  // Group subjects by exam type
  const subjectsByType = subjects.reduce((acc, subject) => {
    if (!acc[subject.exam_type]) acc[subject.exam_type] = [];
    acc[subject.exam_type].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);

  const quickActions = [
    {
      icon: Plus,
      title: 'Add Questions',
      description: 'Bulk import questions',
      href: '/admin/questions',
      color: 'from-emerald-500/20 to-emerald-600/5',
      iconColor: 'text-emerald-400',
      borderColor: 'hover:border-emerald-500/30',
    },
    {
      icon: FileQuestion,
      title: 'Manage Questions',
      description: 'View, edit, and delete',
      href: '/admin/questions/manage',
      color: 'from-indigo-500/20 to-indigo-600/5',
      iconColor: 'text-indigo-400',
      borderColor: 'hover:border-indigo-500/30',
    },
    {
      icon: BookOpen,
      title: 'Manage Subjects',
      description: 'Add or edit subjects',
      href: '/admin/subjects',
      color: 'from-blue-500/20 to-blue-600/5',
      iconColor: 'text-blue-400',
      borderColor: 'hover:border-blue-500/30',
    },
    {
      icon: BarChart3,
      title: 'Statistics',
      description: 'View analytics',
      href: '#',
      color: 'from-purple-500/20 to-purple-600/5',
      iconColor: 'text-purple-400',
      borderColor: 'hover:border-purple-500/30',
      onClick: () => {},
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#071020] to-[#030812] text-white overflow-hidden">
      {/* Background 3D Shapes */}
      <div ref={bgShapesRef} className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="bg-shape absolute top-20 left-1/4 w-64 h-96 bg-gradient-to-b from-purple-500/10 to-transparent rounded-full blur-3xl" />
        <div className="bg-shape absolute top-40 right-1/4 w-48 h-80 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-full blur-3xl" />
        <div className="bg-shape absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-t from-purple-500/5 to-transparent rounded-full blur-3xl" />
        {/* Vertical light columns */}
        <div className="absolute top-0 left-[20%] w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        <div className="absolute top-0 left-[50%] w-px h-full bg-gradient-to-b from-transparent via-white/3 to-transparent" />
        <div className="absolute top-0 left-[80%] w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      </div>

      {/* Sidebar */}
      <AdminSidebar />

      <div className="relative min-h-screen">
        {/* Main Content */}
        <main className="ml-[72px] transition-all duration-300">
          {/* Top Navbar */}
          <header className="sticky top-0 z-30 bg-[#0a1628]/60 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">Manage your Board Battle platform</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-40"
                  />
                </div>

                {/* Profile */}
                <Link href="/profile">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-sm font-bold hover:scale-105 transition-transform">
                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                  </div>
                </Link>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-6 lg:p-8 space-y-8">
            {/* Welcome Banner */}
            <div className="admin-card relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-[#071020] border border-purple-500/20 p-6 lg:p-8">
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">Admin Panel</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold mb-2">Welcome back, Admin</h2>
                  <p className="text-gray-400">Manage questions, subjects, and users from here</p>
                </div>
                <Link
                  href="/admin/questions"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Add Questions
                </Link>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-gradient-to-t from-indigo-500/10 to-transparent rounded-full blur-2xl" />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Questions Stat */}
              <div className="admin-card group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10 p-5 hover:border-emerald-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Questions</p>
                    <p className="text-3xl font-bold">{stats.totalQuestions.toLocaleString()}</p>
                    <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                      <TrendingUp className="w-4 h-4" />
                      Active in system
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileQuestion className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/50 via-green-500/50 to-transparent" />
              </div>

              {/* Users Stat */}
              <div className="admin-card group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10 p-5 hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Users</p>
                    <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-sm text-blue-400 mt-2 flex items-center gap-1 font-medium">
                      <Activity className="w-4 h-4" />
                      Registered reviewers
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/50 via-cyan-500/50 to-transparent" />
              </div>

              {/* Battles Stat */}
              <div className="admin-card group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10 p-5 hover:border-purple-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Battles</p>
                    <p className="text-3xl font-bold">{stats.totalBattles.toLocaleString()}</p>
                    <p className="text-sm text-purple-400 mt-2 flex items-center gap-1 font-medium">
                      <BarChart3 className="w-4 h-4" />
                      Matches played
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Swords className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-transparent" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="admin-card">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <Link key={action.href} href={action.href}>
                    <div className={`group relative rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10 p-5 ${action.borderColor} hover:-translate-y-1 hover:shadow-xl transition-all duration-300`}>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} border border-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                      </div>
                      <h3 className="font-semibold mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-400">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Subjects Overview */}
            <div className="admin-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Subjects Overview</h2>
                <Link
                  href="/admin/subjects"
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                >
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-10 h-10 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin" />
                  <p className="text-gray-400">Loading subjects...</p>
                </div>
              ) : subjects.length === 0 ? (
                <div className="rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10 p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No subjects yet</h3>
                  <p className="text-gray-400 mb-4">Create your first subject to get started</p>
                  <Link
                    href="/admin/subjects/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-medium text-sm hover:-translate-y-0.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Subject
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(subjectsByType).map(([examType, typeSubjects]) => (
                    <div key={examType} className="rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10 overflow-hidden">
                      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-8 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500" />
                          <h3 className="font-semibold">{examType}</h3>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-sm text-gray-400">{typeSubjects.length} subjects</span>
                      </div>
                      <div className="divide-y divide-white/5">
                        {typeSubjects.slice(0, 5).map((subject) => (
                          <Link
                            key={subject.id}
                            href={`/admin/questions/manage?subject=${subject.id}`}
                            className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-all duration-200 group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a4a7c]/30 to-[#0d2847]/30 border border-white/5 flex items-center justify-center group-hover:border-purple-500/30 transition-colors text-xl">
                              {subject.icon_url || '📚'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-white truncate group-hover:text-purple-400 transition-colors">{subject.name}</h4>
                              <p className="text-sm text-gray-500">{subject.question_count} questions</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:translate-x-1 group-hover:text-white transition-all" />
                          </Link>
                        ))}
                      </div>
                      {typeSubjects.length > 5 && (
                        <div className="px-5 py-3 border-t border-white/5">
                          <Link
                            href={`/admin/subjects?type=${examType}`}
                            className="text-sm text-purple-400 hover:text-purple-300"
                          >
                            +{typeSubjects.length - 5} more subjects
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
