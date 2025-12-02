import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format time in mm:ss format
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Calculate accuracy percentage
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

// Get MMR tier based on rating
export function getMmrTier(mmr: number): {
  name: string;
  color: string;
  icon: string;
} {
  if (mmr >= 2000) return { name: 'Master', color: 'text-purple-500', icon: '👑' };
  if (mmr >= 1600) return { name: 'Diamond', color: 'text-cyan-400', icon: '💎' };
  if (mmr >= 1400) return { name: 'Platinum', color: 'text-teal-400', icon: '🏅' };
  if (mmr >= 1200) return { name: 'Gold', color: 'text-yellow-500', icon: '🥇' };
  if (mmr >= 1000) return { name: 'Silver', color: 'text-gray-400', icon: '🥈' };
  if (mmr >= 800) return { name: 'Bronze', color: 'text-orange-600', icon: '🥉' };
  return { name: 'Beginner', color: 'text-gray-500', icon: '🎮' };
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Shuffle array (Fisher-Yates)
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Safe JSON parse
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

// Check if running on mobile
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Get initials from username
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
