'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Question, Subject } from '@/lib/database.types';
import { Search, Filter, ChevronLeft, BookOpen, Play } from 'lucide-react';
import Link from 'next/link';

interface QuestionOption {
  id: number;
  text: string;
}

export default function SubjectQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const supabase = createClient();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [subjectId]);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchQuery, selectedDifficulty]);

  async function fetchData() {
    setIsLoading(true);

    // Fetch subject
    const { data: subjectData } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .single();

    if (subjectData) {
      setSubject(subjectData);
    }

    // Fetch all questions (admin view with correct answers)
    const { data: questionsData } = await supabase
      .from('questions')
      .select('*')
      .eq('subject_id', subjectId)
      .order('difficulty', { ascending: true })
      .order('created_at', { ascending: false });

    setQuestions(questionsData || []);
    setIsLoading(false);
  }

  function filterQuestions() {
    let filtered = [...questions];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((q) =>
        q.question_text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter((q) => q.difficulty === selectedDifficulty);
    }

    setFilteredQuestions(filtered);
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'hard':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#071020] to-[#030812] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#071020] to-[#030812] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Subject not found</p>
          <button
            onClick={() => router.push('/reviewer')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            Back to Reviewer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#071020] to-[#030812]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a1628]/90 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/reviewer')}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{subject.name}</h1>
                <p className="text-sm text-gray-400">{questions.length} questions total</p>
              </div>
            </div>
            
            {/* Start Practice Button */}
            <Link href={`/reviewer/${subjectId}`}>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium">
                <Play className="w-4 h-4" />
                Start Practice
              </button>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
              />
            </div>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="container mx-auto px-4 py-6">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No questions found</h3>
            <p className="text-gray-400">
              {searchQuery || selectedDifficulty !== 'all'
                ? 'Try adjusting your filters'
                : 'This subject has no questions yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question, index) => {
              const options = question.options as any as QuestionOption[];
              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-[#0d1f35] border border-white/5 rounded-xl p-5 hover:border-blue-500/30 transition-all"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-sm font-bold text-gray-400">
                        {index + 1}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
                          question.difficulty
                        )}`}
                      >
                        {question.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <h3 className="text-lg font-semibold text-white mb-4 leading-relaxed">
                    {question.question_text}
                  </h3>

                  {/* Options */}
                  <div className="space-y-2 mb-4">
                    {options.map((option) => {
                      const isCorrect = option.id === question.correct_option_id;
                      return (
                        <div
                          key={option.id}
                          className={`p-3 rounded-lg border transition-colors ${
                            isCorrect
                              ? 'bg-green-500/10 border-green-500/30 text-green-400'
                              : 'bg-white/5 border-white/10 text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'
                              }`}
                            >
                              {String.fromCharCode(65 + option.id)}
                            </div>
                            <span className="flex-1">{option.text}</span>
                            {isCorrect && (
                              <span className="text-xs font-medium px-2 py-1 bg-green-500/20 rounded-full">
                                ✓ Correct
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                      <p className="text-sm text-blue-400">
                        <span className="font-semibold">Explanation:</span> {question.explanation}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
