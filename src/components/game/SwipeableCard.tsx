'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import { QuestionStudentView, QuestionOption } from '@/lib/database.types';
import { useAudioStore } from '@/stores';
import { cn } from '@/lib/utils';

interface SwipeableCardProps {
  question: QuestionStudentView;
  onSwipe: (optionId: number) => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

const SWIPE_THRESHOLD = 100;
const ROTATION_RANGE = 15;
const SCALE_RANGE = 0.1;

export function SwipeableCard({
  question,
  onSwipe,
  isLoading = false,
  disabled = false,
  className,
}: SwipeableCardProps) {
  const [exitX, setExitX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const { triggerHaptic } = useAudioStore();
  
  // Motion values for smooth animations
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transform values based on drag position
  const rotate = useTransform(x, [-300, 0, 300], [-ROTATION_RANGE, 0, ROTATION_RANGE]);
  const scale = useTransform(
    x,
    [-300, -100, 0, 100, 300],
    [1 - SCALE_RANGE, 1, 1, 1, 1 - SCALE_RANGE]
  );
  
  // Opacity indicators for swipe direction
  const leftIndicatorOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  
  // Background color based on swipe direction
  const backgroundColor = useTransform(
    x,
    [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    ['rgba(239, 68, 68, 0.2)', 'rgba(255, 255, 255, 1)', 'rgba(34, 197, 94, 0.2)']
  );
  
  const options = question.options as QuestionOption[];
  
  // Handle drag start
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    triggerHaptic('light');
  }, [triggerHaptic]);
  
  // Handle drag end
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      
      const threshold = SWIPE_THRESHOLD;
      const velocity = info.velocity.x;
      const offset = info.offset.x;
      
      // Determine if swipe is valid
      if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
        const direction = offset > 0 ? 'right' : 'left';
        setExitX(direction === 'right' ? 500 : -500);
        
        // Map swipe direction to option
        // Right = True/Option A (index 0)
        // Left = False/Option B (index 1)
        const selectedOption = direction === 'right' ? 0 : 1;
        
        triggerHaptic('medium');
        
        // Animate out and call onSwipe
        animate(x, direction === 'right' ? 500 : -500, {
          type: 'spring',
          stiffness: 300,
          damping: 30,
          onComplete: () => {
            onSwipe(selectedOption);
          },
        });
      } else {
        // Snap back to center
        animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
        animate(y, 0, { type: 'spring', stiffness: 500, damping: 30 });
      }
    },
    [onSwipe, x, y, triggerHaptic]
  );
  
  // Handle option button click (for accessibility)
  const handleOptionClick = useCallback(
    (optionId: number) => {
      if (disabled || isLoading) return;
      
      triggerHaptic('medium');
      const direction = optionId === 0 ? 1 : -1;
      setExitX(direction * 500);
      
      animate(x, direction * 500, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        onComplete: () => {
          onSwipe(optionId);
        },
      });
    },
    [disabled, isLoading, onSwipe, x, triggerHaptic]
  );
  
  // Reset position when question changes
  useEffect(() => {
    x.set(0);
    y.set(0);
    setExitX(0);
  }, [question.id, x, y]);
  
  return (
    <div className={cn('relative w-full max-w-md mx-auto', className)}>
      {/* Swipe indicators */}
      <motion.div
        className="absolute inset-0 flex items-center justify-start pl-8 pointer-events-none z-10"
        style={{ opacity: leftIndicatorOpacity }}
      >
        <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-bold text-lg rotate-12 shadow-lg">
          FALSE
        </div>
      </motion.div>
      
      <motion.div
        className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none z-10"
        style={{ opacity: rightIndicatorOpacity }}
      >
        <div className="bg-success text-success-foreground px-4 py-2 rounded-lg font-bold text-lg -rotate-12 shadow-lg">
          TRUE
        </div>
      </motion.div>
      
      {/* Main card */}
      <motion.div
        className={cn(
          'relative bg-card rounded-2xl shadow-xl overflow-hidden swipe-card',
          'border border-border',
          isDragging && 'cursor-grabbing',
          !isDragging && !disabled && 'cursor-grab',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        style={{
          x,
          y,
          rotate,
          scale,
          backgroundColor,
        }}
        drag={!disabled && !isLoading}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: 'grabbing' }}
        animate={{ x: exitX }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Card content */}
        <div className="p-6 min-h-[400px] flex flex-col">
          {/* Difficulty badge */}
          <div className="flex justify-between items-start mb-4">
            <span
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium',
                question.difficulty === 'easy' && 'bg-success/20 text-success',
                question.difficulty === 'medium' && 'bg-yellow-500/20 text-yellow-600',
                question.difficulty === 'hard' && 'bg-destructive/20 text-destructive'
              )}
            >
              {question.difficulty.toUpperCase()}
            </span>
            
            {isLoading && (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          
          {/* Question text */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg md:text-xl text-center leading-relaxed font-medium text-card-foreground">
              {question.question_text}
            </p>
          </div>
          
          {/* Swipe hint */}
          <div className="mt-6 flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>False</span>
            </div>
            <div className="flex items-center gap-2">
              <span>True</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Option buttons (for multiple choice questions) */}
        {options.length > 2 && (
          <div className="px-6 pb-6 space-y-2">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                disabled={disabled || isLoading}
                className={cn(
                  'w-full p-4 rounded-xl text-left transition-all',
                  'bg-secondary hover:bg-secondary/80',
                  'border border-transparent hover:border-primary/20',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span className="font-medium text-secondary-foreground">
                  {String.fromCharCode(65 + option.id)}. {option.text}
                </span>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Feedback overlay component
export function SwipeFeedback({
  isCorrect,
  onComplete,
}: {
  isCorrect: boolean;
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 600);
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn(
        'fixed inset-0 flex items-center justify-center z-50 pointer-events-none',
        isCorrect ? 'flash-correct' : 'flash-wrong'
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.3 }}
        className={cn(
          'w-24 h-24 rounded-full flex items-center justify-center',
          isCorrect ? 'bg-success' : 'bg-destructive'
        )}
      >
        {isCorrect ? (
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </motion.div>
    </motion.div>
  );
}
