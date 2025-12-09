'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Subject, Question } from '@/lib/database.types';
import { Trash2, Search, Filter, ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface QuestionWithSubject extends Question {
  subject?: Subject;
}

export default function ManageQuestionsPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get('subject');
  
  const [questions, setQuestions] = useState<QuestionWithSubject[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionWithSubject[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectParam || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  // Update selected subject when URL param changes
  useEffect(() => {
    if (subjectParam) {
      setSelectedSubject(subjectParam);
    }
  }, [subjectParam]);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchQuery, selectedSubject, selectedDifficulty]);

  async function fetchData() {
    setIsLoading(true);

    // Fetch subjects
    const { data: subjectsData } = await supabase
      .from('subjects')
      .select('*')
      .order('exam_type')
      .order('name');

    setSubjects(subjectsData || []);

    // Fetch all questions
    const { data: questionsData } = await supabase
      .from('questions')
      .select('*, subjects(*)');

    if (questionsData) {
      const formattedQuestions = questionsData.map((q: any) => ({
        ...q,
        subject: q.subjects,
      }));
      setQuestions(formattedQuestions);
    }

    setIsLoading(false);
  }

  function filterQuestions() {
    let filtered = [...questions];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(q =>
        q.question_text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Subject filter
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(q => q.subject_id === selectedSubject);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    setFilteredQuestions(filtered);
  }

  async function handleDelete(id: string) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (!error) {
      setQuestions(questions.filter(q => q.id !== id));
      setSuccessMessage('Question deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    setDeleteModal({ show: false, id: null });
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedQuestions);
    
    const { error } = await supabase
      .from('questions')
      .delete()
      .in('id', ids);

    if (!error) {
      setQuestions(questions.filter(q => !selectedQuestions.has(q.id)));
      setSelectedQuestions(new Set());
      setSuccessMessage(`${ids.length} questions deleted successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    setBulkDeleteModal(false);
  }

  function toggleSelectQuestion(id: string) {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedQuestions(newSelected);
  }

  function toggleSelectAll() {
    if (selectedQuestions.size === filteredQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(filteredQuestions.map(q => q.id)));
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#071020] to-[#030812] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#071020] to-[#030812] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a1628]/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Manage Questions</h1>
                <p className="text-sm text-gray-400">{questions.length} total questions</p>
              </div>
            </div>

            {selectedQuestions.size > 0 && (
              <button
                onClick={() => setBulkDeleteModal(true)}
                className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete {selectedQuestions.size} selected
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.exam_type})</option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Select All */}
        {filteredQuestions.length > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <input
              type="checkbox"
              checked={selectedQuestions.size === filteredQuestions.length && filteredQuestions.length > 0}
              onChange={toggleSelectAll}
              className="w-5 h-5 accent-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-400">
              {selectedQuestions.size > 0
                ? `${selectedQuestions.size} of ${filteredQuestions.length} selected`
                : 'Select all'}
            </span>
          </div>
        )}

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No questions found</h3>
            <p className="text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question, index) => (
              <div
                key={question.id}
                className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex gap-4">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.has(question.id)}
                    onChange={() => toggleSelectQuestion(question.id)}
                    className="w-5 h-5 mt-1 accent-blue-500 cursor-pointer flex-shrink-0"
                  />

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-400">Q{index + 1}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            question.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                            question.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {question.difficulty}
                          </span>
                          <span className="text-sm text-gray-400">
                            {question.subject?.name} ({question.subject?.exam_type})
                          </span>
                        </div>
                        <p className="text-white text-lg mb-3">{question.question_text}</p>
                        
                        {/* Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {(question.options as Array<{id: number; text: string}>).map((option, i) => (
                            <div
                              key={i}
                              className={`p-3 rounded-lg text-sm ${
                                question.correct_option_id === option.id
                                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                  : 'bg-white/5 border border-white/10 text-gray-300'
                              }`}
                            >
                              <span className="font-medium">{String.fromCharCode(65 + i)}.</span> {option.text}
                            </div>
                          ))}
                        </div>

                        {question.explanation && (
                          <p className="text-sm text-gray-400 mt-2">
                            <span className="font-medium">Explanation:</span> {question.explanation}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => setDeleteModal({ show: true, id: question.id })}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <ConfirmModal
          isOpen={true}
          title="Delete Question"
          description="Are you sure you want to delete this question? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={() => deleteModal.id && handleDelete(deleteModal.id)}
          onClose={() => setDeleteModal({ show: false, id: null })}
          variant="danger"
        />
      )}

      {/* Bulk Delete Modal */}
      {bulkDeleteModal && (
        <ConfirmModal
          isOpen={true}
          title="Delete Multiple Questions"
          description={`Are you sure you want to delete ${selectedQuestions.size} questions? This action cannot be undone.`}
          confirmLabel="Delete All"
          cancelLabel="Cancel"
          onConfirm={handleBulkDelete}
          onClose={() => setBulkDeleteModal(false)}
          variant="danger"
        />
      )}
    </div>
  );
}
