'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
    <>
      <TopBar title="Manage Subjects" showBack />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Add subject button */}
        <Button
          className="w-full"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Subject'}
        </Button>
        
        {/* Add subject form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 space-y-4">
              <h3 className="font-semibold text-foreground">New Subject</h3>
              
              {errors.general && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {errors.general}
                </div>
              )}
              
              <Input
                label="Subject Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., General Education"
                error={errors.name}
              />
              
              <Textarea
                label="Description (Optional)"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the subject..."
                rows={2}
              />
              
              <Select
                label="Exam Type"
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value as 'LET' | 'Nursing' | 'Criminology' })}
                options={[
                  { value: 'LET', label: 'LET (Licensure Exam for Teachers)' },
                  { value: 'Nursing', label: 'Nursing Licensure Exam' },
                  { value: 'Criminology', label: 'Criminologist Licensure Exam' },
                ]}
              />
              
              <Input
                label="Icon URL (Optional)"
                value={formData.iconUrl || ''}
                onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value || null })}
                placeholder="https://..."
              />
              
              <Button
                className="w-full"
                onClick={handleSubmit}
                isLoading={isSaving}
              >
                Create Subject
              </Button>
            </Card>
          </motion.div>
        )}
        
        {/* Subjects list */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : subjects.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No subjects yet. Create one above!</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl">
                    {subject.icon_url ? (
                      <img
                        src={subject.icon_url}
                        alt={subject.name}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      examTypeIcons[subject.exam_type] || '📖'
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{subject.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {subject.exam_type} • {subject.question_count} questions
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(subject.id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
