'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showValue?: boolean;
  color?: 'primary' | 'success' | 'destructive' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  showValue = true,
  color = 'primary',
  size = 'md',
  animated = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    destructive: 'bg-destructive',
    warning: 'bg-yellow-500',
  };
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };
  
  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1 text-sm">
          {label && <span className="font-medium text-foreground">{label}</span>}
          {showValue && (
            <span className="text-muted-foreground">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full bg-secondary rounded-full overflow-hidden',
          sizeClasses[size]
        )}
      >
        <motion.div
          className={cn('h-full rounded-full', colorClasses[color])}
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

interface BattleProgressProps {
  playerScore: number;
  opponentScore: number;
  maxScore: number;
  playerName?: string;
  opponentName?: string;
  className?: string;
}

export function BattleProgress({
  playerScore,
  opponentScore,
  maxScore,
  playerName = 'You',
  opponentName = 'Opponent',
  className,
}: BattleProgressProps) {
  const playerPercentage = (playerScore / maxScore) * 100;
  const opponentPercentage = (opponentScore / maxScore) * 100;
  
  return (
    <div className={cn('w-full', className)}>
      {/* Player progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-foreground">{playerName}</span>
          <motion.span
            key={playerScore}
            initial={{ scale: 1.2, color: 'hsl(var(--success))' }}
            animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
            className="text-lg font-bold"
          >
            {playerScore}
          </motion.span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${playerPercentage}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>
      
      {/* VS divider */}
      <div className="vs-divider py-2">
        <span className="px-4 text-sm font-bold text-muted-foreground">VS</span>
      </div>
      
      {/* Opponent progress */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-foreground">{opponentName}</span>
          <motion.span
            key={opponentScore}
            initial={{ scale: 1.2, color: 'hsl(var(--destructive))' }}
            animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
            className="text-lg font-bold"
          >
            {opponentScore}
          </motion.span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-destructive rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${opponentPercentage}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}

interface RoundTimerProps {
  seconds: number;
  maxSeconds: number;
  onExpire?: () => void;
  className?: string;
}

export function RoundTimer({
  seconds,
  maxSeconds,
  className,
}: RoundTimerProps) {
  const percentage = (seconds / maxSeconds) * 100;
  const isLow = seconds <= 5;
  
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <motion.div
        className={cn(
          'text-2xl font-bold tabular-nums',
          isLow ? 'text-destructive' : 'text-foreground'
        )}
        animate={isLow ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        {seconds}s
      </motion.div>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={cn(
            'h-full rounded-full transition-colors',
            isLow ? 'bg-destructive' : 'bg-primary'
          )}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
