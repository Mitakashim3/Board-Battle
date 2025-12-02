'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { TopBar, Card } from '@/components/ui';
import { Subject } from '@/lib/database.types';

export default function ReviewerPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  // Group subjects by exam type
  const groupedSubjects = subjects.reduce((acc, subject) => {
    if (!acc[subject.exam_type]) {
      acc[subject.exam_type] = [];
    }
    acc[subject.exam_type].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);
  
  const examTypeIcons: Record<string, string> = {
    'LET': '👩‍🏫',
    'Nursing': '👩‍⚕️',
    'Criminology': '👮',
  };
  
  return (
    <>
      <TopBar title="Solo Review" showBack />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Choose a Subject</h1>
          <p className="text-muted-foreground mt-1">
            Swipe through questions at your own pace
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : Object.keys(groupedSubjects).length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="font-semibold text-foreground mb-2">No Subjects Available</h3>
            <p className="text-muted-foreground">
              Check back soon for new review materials!
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSubjects).map(([examType, examSubjects]) => (
              <section key={examType}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{examTypeIcons[examType] || '📖'}</span>
                  <h2 className="text-lg font-semibold text-foreground">{examType}</h2>
                </div>
                
                <div className="grid gap-3">
                  {examSubjects.map((subject, index) => (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/reviewer/${subject.id}`}>
                        <Card className="p-4 flex items-center gap-4 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            {subject.icon_url ? (
                              <img
                                src={subject.icon_url}
                                alt={subject.name}
                                className="w-8 h-8 object-contain"
                              />
                            ) : (
                              <span className="text-xl">{examTypeIcons[examType] || '📖'}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{subject.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {subject.question_count} questions
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
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
