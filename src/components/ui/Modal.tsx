'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BreakModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onExit: () => void;
  stats: {
    questionsAnswered: number;
    correctAnswers: number;
    streak: number;
  };
}

export function BreakModal({
  isOpen,
  onContinue,
  onExit,
  stats,
}: BreakModalProps) {
  if (!isOpen) return null;
  
  const accuracy = stats.questionsAnswered > 0
    ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
    : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm mx-4 bg-card rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-primary/10 p-6 text-center">
          <span className="text-4xl">☕</span>
          <h2 className="mt-2 text-xl font-bold text-foreground">Break Time!</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Great progress! Take a moment to rest.
          </p>
        </div>
        
        {/* Stats */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">
                {stats.questionsAnswered}
              </div>
              <div className="text-xs text-muted-foreground">Answered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">
                {accuracy}%
              </div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                🔥 {stats.streak}
              </div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
          </div>
          
          {/* Ad placeholder */}
          <div className="bg-secondary rounded-lg p-8 text-center">
            <span className="text-muted-foreground text-sm">
              [Ad Placeholder]
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-6 pt-0 space-y-2">
          <button
            onClick={onContinue}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Continue Reviewing
          </button>
          <button
            onClick={onExit}
            className="w-full py-3 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
          >
            Exit to Home
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Loading spinner component
export function LoadingSpinner({ 
  size = 'md',
  className 
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };
  
  return (
    <div
      className={cn(
        'border-primary border-t-transparent rounded-full animate-spin',
        sizeClasses[size],
        className
      )}
    />
  );
}

// Energy display component
export function EnergyDisplay({
  current,
  max,
  nextRegenAt,
  className,
}: {
  current: number;
  max: number;
  nextRegenAt?: Date | null;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-3 h-6 rounded-sm transition-colors',
              i < current ? 'bg-yellow-500' : 'bg-secondary'
            )}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        ⚡ {current}/{max}
      </span>
    </div>
  );
}

// Coin display component
export function CoinDisplay({
  amount,
  showPlus,
  className,
}: {
  amount: number;
  showPlus?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className="text-lg">🪙</span>
      <span className="font-bold text-foreground">{amount.toLocaleString()}</span>
      {showPlus && showPlus > 0 && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-success text-sm font-medium"
        >
          +{showPlus}
        </motion.span>
      )}
    </div>
  );
}

// MMR display component
export function MmrDisplay({
  mmr,
  change,
  className,
}: {
  mmr: number;
  change?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className="text-lg">🏆</span>
      <span className="font-bold text-foreground">{mmr}</span>
      {change && change !== 0 && (
        <motion.span
          initial={{ opacity: 0, y: change > 0 ? 10 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'text-sm font-medium',
            change > 0 ? 'text-success' : 'text-destructive'
          )}
        >
          {change > 0 ? '+' : ''}{change}
        </motion.span>
      )}
    </div>
  );
}
