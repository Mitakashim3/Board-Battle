'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useGameStore, useUserStore, useAudioStore, type AnswerResult } from '@/stores';
import { TopBar, BreakModal, CoinDisplay } from '@/components/ui';
import { SwipeableCard, SwipeFeedback, ProgressBar } from '@/components/game';
import { QuestionStudentView, Subject } from '@/lib/database.types';

export default function ReviewerSessionPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  
  const supabase = createClient();
  const { user, updateUser } = useUserStore();
  const { triggerHaptic } = useAudioStore();
  
  const {
    currentSubject,
    questions,
    currentQuestionIndex,
    questionsAnswered,
    correctAnswers,
    streak,
    isLoading,
    showBreakModal,
    showResultFeedback,
    lastResult,
    startSession,
    recordAnswer,
    nextQuestion,
    setLoading,
    setShowBreakModal,
    setShowResultFeedback,
    getCurrentQuestion,
    getProgress,
  } = useGameStore();
  
  const [coinsEarned, setCoinsEarned] = useState(0);
  
  // Load subject and questions
  useEffect(() => {
    async function loadSession() {
      setLoading(true);
      
      // Fetch subject
      const { data: subjectData } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .single();
      
      if (!subjectData) {
        router.push('/reviewer');
        return;
      }
      
      // Fetch questions (using student view - no correct answers exposed)
      const { data: questionsData } = await supabase
        .from('questions_student_view')
        .select('*')
        .eq('subject_id', subjectId)
        .order('difficulty', { ascending: true });
      
      // Even if no questions, still show the page with empty state
      const shuffled = questionsData && questionsData.length > 0 
        ? [...questionsData].sort(() => Math.random() - 0.5)
        : [];
      
      startSession(subjectData as Subject, shuffled as QuestionStudentView[]);
    }
    
    loadSession();
  }, [subjectId, supabase, router, setLoading, startSession]);
  
  // Handle swipe/answer selection
  const handleSwipe = useCallback(
    async (selectedOption: number) => {
      const currentQuestion = getCurrentQuestion();
      if (!currentQuestion) return;
      
      // Submit answer to server (anti-cheat verification)
      const { data, error } = await supabase.rpc('submit_answer', {
        p_question_id: currentQuestion.id,
        p_selected_option: selectedOption,
        p_subject_id: subjectId,
      });
      
      if (error) {
        console.error('Error submitting answer:', error);
        return;
      }
      
      const result: AnswerResult = {
        questionId: currentQuestion.id,
        selectedOption,
        isCorrect: data.is_correct,
        correctOption: data.correct_option,
        explanation: data.explanation,
      };
      
      // Trigger haptic feedback
      triggerHaptic(result.isCorrect ? 'success' : 'error');
      
      // Update coins
      if (data.coins_earned > 0) {
        setCoinsEarned(prev => prev + data.coins_earned);
        if (user) {
          updateUser({ coins: user.coins + data.coins_earned });
        }
      }
      
      // Record the answer
      recordAnswer(result);
      
      // Move to next question after feedback
      setTimeout(() => {
        setShowResultFeedback(false);
        nextQuestion();
      }, 800);
    },
    [
      getCurrentQuestion,
      supabase,
      subjectId,
      triggerHaptic,
      recordAnswer,
      setShowResultFeedback,
      nextQuestion,
      user,
      updateUser,
    ]
  );
  
  const handleContinue = () => {
    setShowBreakModal(false);
  };
  
  const handleExit = () => {
    router.push('/reviewer');
  };
  
  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();
  const accuracy = questionsAnswered > 0 
    ? Math.round((correctAnswers / questionsAnswered) * 100) 
    : 0;
  
  if (isLoading || !currentSubject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a1628] via-[#071020] to-[#030812]">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No questions available
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#071020] to-[#030812]">
        <div className="sticky top-0 z-30 bg-[#0a1628]/90 backdrop-blur-xl border-b border-white/5">
          <div className="container mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => router.push('/reviewer')}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">{currentSubject.name}</h1>
          </div>
        </div>
        <main className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Questions Available</h2>
            <p className="text-gray-400 mb-8">
              This subject doesn't have any questions yet. Check back later or try another subject!
            </p>
            <button
              onClick={() => router.push('/reviewer')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              Browse Other Subjects
            </button>
          </div>
        </main>
      </div>
    );
  }
  
  // Session complete
  if (!currentQuestion && questions.length > 0) {
    return (
      <>
        <TopBar title={currentSubject.name} showBack />
        <main className="container mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Session Complete!</h1>
          <p className="text-muted-foreground mb-8">Great job reviewing!</p>
          
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="text-2xl font-bold text-foreground">{questionsAnswered}</div>
              <div className="text-xs text-muted-foreground">Answered</div>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="text-2xl font-bold text-success">{accuracy}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="text-2xl font-bold text-primary">🪙 {coinsEarned}</div>
              <div className="text-xs text-muted-foreground">Earned</div>
            </div>
          </div>
          
          <div className="space-y-3 max-w-xs mx-auto">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium"
            >
              Review Again
            </button>
            <button
              onClick={() => router.push('/reviewer')}
              className="w-full py-3 bg-secondary text-secondary-foreground rounded-xl font-medium"
            >
              Choose Another Subject
            </button>
          </div>
        </main>
      </>
    );
  }
  
  return (
    <>
      <TopBar
        title={currentSubject.name}
        showBack
        rightContent={<CoinDisplay amount={user?.coins ?? 0} showPlus={coinsEarned > 0 ? coinsEarned : undefined} />}
      />
      
      <main className="container mx-auto px-4 py-6">
        {/* Progress bar */}
        <div className="mb-6">
          <ProgressBar
            value={currentQuestionIndex + 1}
            max={questions.length}
            label="Progress"
            color="primary"
          />
        </div>
        
        {/* Stats bar */}
        <div className="flex justify-center gap-6 mb-6 text-sm">
          <div className="text-center">
            <span className="font-bold text-success">{correctAnswers}</span>
            <span className="text-muted-foreground"> correct</span>
          </div>
          <div className="text-center">
            <span className="font-bold text-primary">🔥 {streak}</span>
            <span className="text-muted-foreground"> streak</span>
          </div>
          <div className="text-center">
            <span className="font-bold text-foreground">{accuracy}%</span>
            <span className="text-muted-foreground"> accuracy</span>
          </div>
        </div>
        
        {/* Swipeable card */}
        {currentQuestion && (
          <SwipeableCard
            question={currentQuestion}
            onSwipe={handleSwipe}
            disabled={showResultFeedback}
          />
        )}
      </main>
      
      {/* Feedback overlay */}
      <AnimatePresence>
        {showResultFeedback && lastResult && (
          <SwipeFeedback
            isCorrect={lastResult.isCorrect}
            onComplete={() => setShowResultFeedback(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Break modal */}
      <AnimatePresence>
        {showBreakModal && (
          <BreakModal
            isOpen={showBreakModal}
            onContinue={handleContinue}
            onExit={handleExit}
            stats={{
              questionsAnswered,
              correctAnswers,
              streak,
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
