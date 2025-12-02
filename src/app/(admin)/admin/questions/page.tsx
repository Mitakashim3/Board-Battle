'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { TopBar, Card, Button, Input, Textarea, Select } from '@/components/ui';
import { Subject, Difficulty } from '@/lib/database.types';
import { createQuestionSchema, bulkCreateQuestionsSchema, type CreateQuestionInput } from '@/lib/validations';

interface QuestionForm {
  questionText: string;
  options: { id: number; text: string }[];
  correctOptionId: number;
  difficulty: Difficulty;
  explanation: string;
}

const emptyQuestion: QuestionForm = {
  questionText: '',
  options: [
    { id: 0, text: '' },
    { id: 1, text: '' },
    { id: 2, text: '' },
    { id: 3, text: '' },
  ],
  correctOptionId: 0,
  difficulty: 'medium',
  explanation: '',
};

export default function AdminQuestionsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [questions, setQuestions] = useState<QuestionForm[]>([{ ...emptyQuestion }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  
  // Load subjects
  useEffect(() => {
    async function fetchSubjects() {
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      
      setSubjects(data || []);
      if (data && data.length > 0) {
        setSelectedSubject(data[0].id);
      }
      setIsLoading(false);
    }
    
    fetchSubjects();
  }, [supabase]);
  
  // Add new question form
  const addQuestion = () => {
    setQuestions([...questions, { ...emptyQuestion }]);
  };
  
  // Remove question form
  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };
  
  // Update question field
  const updateQuestion = (index: number, field: keyof QuestionForm, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };
  
  // Update option text
  const updateOption = (questionIndex: number, optionId: number, text: string) => {
    const updated = [...questions];
    updated[questionIndex].options = updated[questionIndex].options.map(opt =>
      opt.id === optionId ? { ...opt, text } : opt
    );
    setQuestions(updated);
  };
  
  // Handle bulk submit
  const handleSubmit = async () => {
    setErrors({});
    setSuccessCount(0);
    
    if (!selectedSubject) {
      setErrors({ general: 'Please select a subject' });
      return;
    }
    
    // Validate all questions
    const questionsToSubmit: CreateQuestionInput[] = questions.map(q => ({
      subjectId: selectedSubject,
      questionText: q.questionText,
      options: q.options,
      correctOptionId: q.correctOptionId,
      difficulty: q.difficulty,
      explanation: q.explanation || null,
    }));
    
    const validation = bulkCreateQuestionsSchema.safeParse({ questions: questionsToSubmit });
    
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Insert questions
      const { data, error } = await supabase
        .from('questions')
        .insert(
          questionsToSubmit.map(q => ({
            subject_id: q.subjectId,
            question_text: q.questionText,
            options: q.options,
            correct_option_id: q.correctOptionId,
            difficulty: q.difficulty,
            explanation: q.explanation,
          }))
        )
        .select();
      
      if (error) {
        throw error;
      }
      
      setSuccessCount(data?.length || 0);
      
      // Reset form after success
      setTimeout(() => {
        setQuestions([{ ...emptyQuestion }]);
        setSuccessCount(0);
      }, 3000);
      
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to save questions' });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Parse bulk text input (for pasting multiple questions)
  const handleBulkPaste = (text: string) => {
    // Simple parser for format:
    // Q: Question text
    // A: Option A
    // B: Option B
    // C: Option C
    // D: Option D
    // Answer: A
    // ---
    
    const blocks = text.split('---').filter(b => b.trim());
    const parsed: QuestionForm[] = [];
    
    for (const block of blocks) {
      const lines = block.trim().split('\n').map(l => l.trim());
      const question: QuestionForm = { ...emptyQuestion, options: [...emptyQuestion.options] };
      
      for (const line of lines) {
        if (line.startsWith('Q:')) {
          question.questionText = line.slice(2).trim();
        } else if (line.startsWith('A:')) {
          question.options[0].text = line.slice(2).trim();
        } else if (line.startsWith('B:')) {
          question.options[1].text = line.slice(2).trim();
        } else if (line.startsWith('C:')) {
          question.options[2].text = line.slice(2).trim();
        } else if (line.startsWith('D:')) {
          question.options[3].text = line.slice(2).trim();
        } else if (line.toLowerCase().startsWith('answer:')) {
          const answer = line.split(':')[1]?.trim().toUpperCase();
          question.correctOptionId = ['A', 'B', 'C', 'D'].indexOf(answer);
        } else if (line.toLowerCase().startsWith('difficulty:')) {
          const diff = line.split(':')[1]?.trim().toLowerCase();
          if (['easy', 'medium', 'hard'].includes(diff)) {
            question.difficulty = diff as Difficulty;
          }
        } else if (line.toLowerCase().startsWith('explanation:')) {
          question.explanation = line.split(':').slice(1).join(':').trim();
        }
      }
      
      if (question.questionText && question.options[0].text) {
        parsed.push(question);
      }
    }
    
    if (parsed.length > 0) {
      setQuestions(parsed);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <>
      <TopBar title="Add Questions" showBack />
      
      <main className="container mx-auto px-4 py-6 space-y-6 pb-32">
        {/* Subject selection */}
        <Card className="p-4">
          <Select
            label="Subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            options={subjects.map(s => ({ value: s.id, label: `${s.name} (${s.exam_type})` }))}
          />
        </Card>
        
        {/* Bulk paste option */}
        <Card className="p-4">
          <details>
            <summary className="cursor-pointer font-medium text-foreground">
              📋 Bulk Paste (Advanced)
            </summary>
            <div className="mt-4">
              <Textarea
                placeholder={`Paste questions in format:
Q: Question text
A: Option A
B: Option B
C: Option C
D: Option D
Answer: A
Difficulty: medium
---
(next question)`}
                rows={10}
                onChange={(e) => handleBulkPaste(e.target.value)}
              />
            </div>
          </details>
        </Card>
        
        {/* Error display */}
        {errors.general && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
            {errors.general}
          </div>
        )}
        
        {/* Success message */}
        <AnimatePresence>
          {successCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-success/10 border border-success/20 rounded-xl text-success"
            >
              ✅ Successfully added {successCount} question(s)!
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Question forms */}
        <div className="space-y-6">
          {questions.map((question, qIndex) => (
            <motion.div
              key={qIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIndex * 0.05 }}
            >
              <Card className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">
                    Question {qIndex + 1}
                  </h3>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="text-destructive text-sm hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <Textarea
                  label="Question Text"
                  value={question.questionText}
                  onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                  placeholder="Enter the question..."
                  rows={3}
                  error={errors[`questions.${qIndex}.questionText`]}
                />
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Options
                  </label>
                  {question.options.map((option) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctOptionId === option.id}
                        onChange={() => updateQuestion(qIndex, 'correctOptionId', option.id)}
                        className="w-4 h-4 accent-primary"
                        title="Mark as correct answer"
                      />
                      <span className="w-6 text-sm font-medium text-muted-foreground">
                        {String.fromCharCode(65 + option.id)}.
                      </span>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(qIndex, option.id, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + option.id)}`}
                        className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Select the radio button next to the correct answer
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Difficulty"
                    value={question.difficulty}
                    onChange={(e) => updateQuestion(qIndex, 'difficulty', e.target.value)}
                    options={[
                      { value: 'easy', label: 'Easy' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'hard', label: 'Hard' },
                    ]}
                  />
                </div>
                
                <Textarea
                  label="Explanation (Optional)"
                  value={question.explanation}
                  onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                  placeholder="Explain the correct answer..."
                  rows={2}
                />
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Add more button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={addQuestion}
        >
          + Add Another Question
        </Button>
      </main>
      
      {/* Floating save button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          isLoading={isSaving}
          disabled={!selectedSubject}
        >
          Save {questions.length} Question{questions.length > 1 ? 's' : ''}
        </Button>
      </div>
    </>
  );
}
