'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { TopBar, Card, Button, Input, Textarea, Select } from '@/components/ui';
import { Subject } from '@/lib/database.types';
import { createSubjectSchema, type CreateSubjectInput } from '@/lib/validations';

export default function AdminSubjectsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<CreateSubjectInput>({
    name: '',
    description: '',
    examType: 'LET',
    iconUrl: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Load subjects
  useEffect(() => {
    async function fetchSubjects() {
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .order('exam_type')
        .order('name');
      
      setSubjects(data || []);
      setIsLoading(false);
    }
    
    fetchSubjects();
  }, [supabase]);
  
  const handleSubmit = async () => {
    setErrors({});
    
    const validation = createSubjectSchema.safeParse(formData);
    
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          name: formData.name,
          description: formData.description,
          exam_type: formData.examType,
          icon_url: formData.iconUrl,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setSubjects([...subjects, data]);
      setShowForm(false);
      setFormData({ name: '', description: '', examType: 'LET', iconUrl: null });
    } catch (err: any) {
      setErrors({ general: err.message });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will delete all questions in this subject.')) {
      return;
    }
    
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };
  
  const examTypeIcons: Record<string, string> = {
    'LET': '👩‍🏫',
    'Nursing': '👩‍⚕️',
    'Criminology': '👮',
  };
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a1628]/90 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-5">
          <h1 className="text-2xl font-bold text-white">Manage Subjects</h1>
          <p className="text-sm text-gray-400 mt-1">Create and manage exam subjects</p>
        </div>
      </div>
      
      <main className="container mx-auto px-6 py-6 space-y-6">
        {/* Add subject button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          {showForm ? '✕ Cancel' : '+ Add New Subject'}
        </button>
        
        {/* Add subject form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="p-6 rounded-xl bg-[#0d1f35] border border-white/5 space-y-5">
              <h3 className="text-lg font-semibold text-white">New Subject</h3>
              
              {errors.general && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {errors.general}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subject Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., General Education"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the subject..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Exam Type</label>
                <select
                  value={formData.examType}
                  onChange={(e) => setFormData({ ...formData, examType: e.target.value as 'LET' | 'Nursing' | 'Criminology' })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                >
                  <option value="LET">LET (Licensure Exam for Teachers)</option>
                  <option value="Nursing">Nursing Licensure Exam</option>
                  <option value="Criminology">Criminologist Licensure Exam</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Icon URL (Optional)</label>
                <input
                  type="text"
                  value={formData.iconUrl || ''}
                  onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value || null })}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                />
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {isSaving ? 'Creating...' : 'Create Subject'}
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Subjects list */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#0d1f35] border border-white/5 text-center">
            <p className="text-gray-400">No subjects yet. Create one above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="p-5 rounded-xl bg-[#0d1f35] border border-white/5 hover:border-blue-500/30 transition-all flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-xl">
                    {subject.icon_url ? (
                      <img
                        src={subject.icon_url}
                        alt={subject.name}
                        className="w-7 h-7 object-contain"
                      />
                    ) : (
                      examTypeIcons[subject.exam_type] || '📖'
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">{subject.name}</h3>
                    <p className="text-sm text-gray-400">
                      {subject.exam_type} • {subject.question_count} questions
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/questions/manage?subject=${subject.id}`}>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                        View Questions
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(subject.id)}
                      className="p-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors border border-red-500/20"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
