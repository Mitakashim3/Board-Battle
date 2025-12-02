'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattleStore, useUserStore, useAudioStore } from '@/stores';
import { createClient } from '@/lib/supabase/client';
import { BattleProgress, RoundTimer } from './ProgressBar';
import { SwipeableCard, SwipeFeedback } from './SwipeableCard';
import { cn } from '@/lib/utils';
import { QuestionStudentView, User } from '@/lib/database.types';

interface BattleArenaProps {
  battleId: string;
}

export function BattleArena({ battleId }: BattleArenaProps) {
  const supabase = createClient();
  const { user } = useUserStore();
  const { triggerHaptic } = useAudioStore();
  
  const {
    battle,
    opponent,
    questionIds,
    currentRound,
    playerScore,
    opponentScore,
    phase,
    countdown,
    currentQuestionId,
    playerAnswered,
    roundTimeRemaining,
    lastRoundResult,
    setBattle,
    startCountdown,
    decrementCountdown,
    startPlaying,
    startRound,
    setPlayerAnswered,
    setOpponentAnswered,
    updateScores,
    showRoundResult,
    nextRound,
    finishBattle,
    decrementRoundTime,
  } = useBattleStore();
  
  const [currentQuestion, setCurrentQuestion] = useState<QuestionStudentView | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const roundTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load battle data
  useEffect(() => {
    async function loadBattle() {
      const { data: battleData, error: battleError } = await supabase
        .from('battles')
        .select('*')
        .eq('id', battleId)
        .single();
      
      if (battleError || !battleData) {
        setError('Battle not found');
        return;
      }
      
      // Get opponent data
      const opponentId = battleData.player1_id === user?.id 
        ? battleData.player2_id 
        : battleData.player1_id;
      
      let opponentData: User | null = null;
      if (opponentId) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', opponentId)
          .single();
        opponentData = data;
      }
      
      const questionIds = (battleData.round_data as string[]) || [];
      
      setBattle(battleData, opponentData, questionIds);
      
      if (battleData.status === 'active') {
        startCountdown();
      }
    }
    
    loadBattle();
  }, [battleId, user?.id, supabase, setBattle, startCountdown]);
  
  // Subscribe to battle changes (real-time)
  useEffect(() => {
    if (!battleId) return;
    
    const channel = supabase
      .channel(`battle-${battleId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'battles',
          filter: `id=eq.${battleId}`,
        },
        (payload) => {
          const updated = payload.new as typeof battle;
          if (!updated) return;
          
          // Update scores
          const isPlayer1 = battle?.player1_id === user?.id;
          const newPlayerScore = isPlayer1 ? updated.player1_score : updated.player2_score;
          const newOpponentScore = isPlayer1 ? updated.player2_score : updated.player1_score;
          
          updateScores(newPlayerScore, newOpponentScore);
          
          // Check if battle ended
          if (updated.status === 'completed') {
            finishBattle(updated.winner_id);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [battleId, battle?.player1_id, user?.id, supabase, updateScores, finishBattle]);
  
  // Countdown timer
  useEffect(() => {
    if (phase !== 'countdown') return;
    
    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        decrementCountdown();
        triggerHaptic('light');
      }, 1000);
    } else {
      startPlaying();
      if (questionIds[0]) {
        startRound(questionIds[0]);
      }
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, countdown, decrementCountdown, startPlaying, startRound, questionIds, triggerHaptic]);
  
  // Round timer
  useEffect(() => {
    if (phase !== 'playing' || playerAnswered) return;
    
    if (roundTimeRemaining > 0) {
      roundTimerRef.current = setTimeout(() => {
        decrementRoundTime();
      }, 1000);
    } else {
      // Time's up - auto submit wrong answer
      handleSwipe(-1); // -1 means no answer
    }
    
    return () => {
      if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
    };
  }, [phase, roundTimeRemaining, playerAnswered, decrementRoundTime]);
  
  // Load current question
  useEffect(() => {
    if (!currentQuestionId) {
      setCurrentQuestion(null);
      return;
    }
    
    async function loadQuestion() {
      const { data } = await supabase
        .from('questions_student_view')
        .select('*')
        .eq('id', currentQuestionId)
        .single();
      
      setCurrentQuestion(data);
    }
    
    loadQuestion();
  }, [currentQuestionId, supabase]);
  
  // Handle answer submission
  const handleSwipe = useCallback(
    async (selectedOption: number) => {
      if (!currentQuestionId || !battleId || playerAnswered) return;
      
      setPlayerAnswered();
      
      // Submit answer to server
      const startTime = Date.now();
      const timeTaken = 15000 - roundTimeRemaining * 1000;
      
      const { data, error } = await supabase.rpc('submit_battle_answer', {
        p_battle_id: battleId,
        p_question_id: currentQuestionId,
        p_selected_option: selectedOption >= 0 ? selectedOption : 0,
        p_time_taken_ms: timeTaken,
      });
      
      if (error) {
        console.error('Error submitting answer:', error);
        return;
      }
      
      setIsCorrect(data?.is_correct ?? false);
      setShowFeedback(true);
      triggerHaptic(data?.is_correct ? 'success' : 'error');
      
      // Update scores
      updateScores(data?.new_score ?? playerScore, data?.opponent_score ?? opponentScore);
      
      // Show result and move to next round
      setTimeout(() => {
        setShowFeedback(false);
        showRoundResult({
          playerCorrect: data?.is_correct ?? false,
          opponentCorrect: false, // Will be updated via real-time
          correctOption: data?.correct_option ?? 0,
        });
        
        setTimeout(() => {
          if (currentRound >= questionIds.length) {
            // End battle
            supabase.rpc('end_battle', { p_battle_id: battleId });
          } else {
            nextRound();
            const nextQuestionId = questionIds[currentRound];
            if (nextQuestionId) {
              startRound(nextQuestionId);
            }
          }
        }, 2000);
      }, 1000);
    },
    [
      currentQuestionId,
      battleId,
      playerAnswered,
      roundTimeRemaining,
      supabase,
      setPlayerAnswered,
      updateScores,
      playerScore,
      opponentScore,
      showRoundResult,
      currentRound,
      questionIds,
      nextRound,
      startRound,
      triggerHaptic,
    ]
  );
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative min-h-screen bg-background">
      {/* Header with scores */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <BattleProgress
            playerScore={playerScore}
            opponentScore={opponentScore}
            maxScore={questionIds.length}
            playerName={user?.username ?? 'You'}
            opponentName={opponent?.username ?? 'Opponent'}
          />
          
          {phase === 'playing' && !playerAnswered && (
            <div className="mt-4">
              <RoundTimer
                seconds={roundTimeRemaining}
                maxSeconds={15}
              />
            </div>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Searching phase */}
          {phase === 'searching' && (
            <motion.div
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[400px]"
            >
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-lg font-medium">Finding opponent...</p>
            </motion.div>
          )}
          
          {/* Countdown phase */}
          {phase === 'countdown' && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex flex-col items-center justify-center min-h-[400px]"
            >
              <motion.span
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-8xl font-bold text-primary"
              >
                {countdown || 'GO!'}
              </motion.span>
            </motion.div>
          )}
          
          {/* Playing phase */}
          {(phase === 'playing' || phase === 'round_result') && currentQuestion && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-6">
                <span className="text-sm text-muted-foreground">
                  Round {currentRound} of {questionIds.length}
                </span>
              </div>
              
              <SwipeableCard
                question={currentQuestion}
                onSwipe={handleSwipe}
                disabled={playerAnswered}
                isLoading={false}
              />
              
              {/* Round result overlay */}
              {phase === 'round_result' && lastRoundResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-card rounded-xl border border-border"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {lastRoundResult.playerCorrect ? '✅ Correct!' : '❌ Wrong'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Correct answer: Option {String.fromCharCode(65 + lastRoundResult.correctOption)}
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
          
          {/* Finished phase */}
          {phase === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[400px]"
            >
              <div
                className={cn(
                  'text-6xl mb-4',
                  playerScore > opponentScore ? 'text-success' : 
                  playerScore < opponentScore ? 'text-destructive' : 
                  'text-muted-foreground'
                )}
              >
                {playerScore > opponentScore ? '🏆' : 
                 playerScore < opponentScore ? '😢' : 
                 '🤝'}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {playerScore > opponentScore ? 'Victory!' : 
                 playerScore < opponentScore ? 'Defeat' : 
                 'Draw'}
              </h2>
              <p className="text-muted-foreground mb-8">
                Final Score: {playerScore} - {opponentScore}
              </p>
              <button
                onClick={() => window.location.href = '/battle'}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
              >
                Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Feedback overlay */}
      <AnimatePresence>
        {showFeedback && (
          <SwipeFeedback
            isCorrect={isCorrect}
            onComplete={() => setShowFeedback(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
