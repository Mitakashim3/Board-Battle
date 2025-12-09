'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Subject } from '@/lib/database.types';
import { BookOpen, GraduationCap, Stethoscope, Gavel, ChevronRight, Search, Brain } from 'lucide-react';

function SubjectIcon({ url, name, fallback }: { url: string | null, name: string, fallback: React.ReactNode }) {
  const [error, setError] = useState(false);

  if (url && !error) {
    return (
      <img
        src={url}
        alt={name}
        className="w-8 h-8 object-contain"
        onError={() => setError(true)}
      />
    );
  }

  return <>{fallback}</>;
}

export default function ReviewerPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchSubjects() {
      setIsLoading(true);
      
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .order('exam_type', { ascending: true })
        .order('name', { ascending: true });
      
      setSubjects(data || []);
      setIsLoading(false);
    }
    
    fetchSubjects();
  }, [supabase]);
  
  // Filter subjects based on search
  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.exam_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group subjects by exam type
  const groupedSubjects = filteredSubjects.reduce((acc, subject) => {
    if (!acc[subject.exam_type]) {
      acc[subject.exam_type] = [];
    }
    acc[subject.exam_type].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);
  
  const getExamIcon = (type: string) => {
    switch (type) {
      case 'LET': return <GraduationCap className="w-6 h-6 text-blue-400" />;
      case 'Nursing': return <Stethoscope className="w-6 h-6 text-emerald-400" />;
      case 'Criminology': return <Gavel className="w-6 h-6 text-amber-400" />;
      default: return <BookOpen className="w-6 h-6 text-purple-400" />;
    }
  };

  const getExamColor = (type: string) => {
    switch (type) {
      case 'LET': return 'from-blue-500/20 to-blue-600/5 border-blue-500/20';
      case 'Nursing': return 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20';
      case 'Criminology': return 'from-amber-500/20 to-amber-600/5 border-amber-500/20';
      default: return 'from-purple-500/20 to-purple-600/5 border-purple-500/20';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#0a1628]/60 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Reviewer</h1>
            <p className="text-sm text-gray-400">Study at your own pace</p>
          </div>
        </div>
      </header>
      
      <div className="p-6 lg:p-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a3a5c] via-[#0d2847] to-[#071020] border border-white/10 p-8">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
              <Brain className="w-4 h-4" />
              <span>Solo Study Mode</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Master Your Subjects</h2>
            <p className="text-gray-400 mb-8 text-lg">
              Access comprehensive review materials, practice questions, and track your progress for your upcoming board exams.
            </p>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Search subjects or exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
              />
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        </div>

        {Object.keys(groupedSubjects).length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No subjects found</h3>
            <p className="text-gray-400">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedSubjects).map(([examType, examSubjects]) => (
              <section key={examType}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${getExamColor(examType)} border bg-opacity-10`}>
                    {getExamIcon(examType)}
                  </div>
                  <h2 className="text-xl font-bold text-white">{examType}</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {examSubjects.map((subject, index) => (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative h-full"
                    >
                      <div className="p-5 rounded-xl bg-[#0d1f35] border border-white/5 hover:border-blue-500/30 hover:bg-[#112540] transition-all duration-300 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <SubjectIcon 
                              url={subject.icon_url} 
                              name={subject.name} 
                              fallback={<BookOpen className="w-6 h-6 text-blue-400" />} 
                            />
                          </div>
                          <span className="px-2.5 py-1 text-xs font-medium bg-white/5 text-gray-400 rounded-full">
                            {subject.question_count} questions
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">
                          {subject.description || `Review materials for ${subject.name}`}
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Link href={`/reviewer/${subject.id}`} className="flex-1">
                            <button className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                              <Brain className="w-4 h-4" />
                              Start Practice
                            </button>
                          </Link>
                          <Link href={`/reviewer/${subject.id}/questions`}>
                            <button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-white/10">
                              <BookOpen className="w-4 h-4" />
                              View All
                            </button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
