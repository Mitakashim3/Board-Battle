'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Home' },
  { href: '/reviewer', icon: '📚', label: 'Review' },
  { href: '/battle', icon: '⚔️', label: 'Battle' },
  { href: '/profile', icon: '👤', label: 'Profile' },
];

export function BottomNav() {
  const pathname = usePathname();
  
  return (
    <nav className="thumb-zone bg-card border-t border-border">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <span className="text-xl relative z-10">{item.icon}</span>
              <span className="text-xs font-medium relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function TopBar({
  title,
  showBack = false,
  rightContent,
}: {
  title?: string;
  showBack?: boolean;
  rightContent?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => window.history.back()}
              className="p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {title && (
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          )}
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
    </header>
  );
}
