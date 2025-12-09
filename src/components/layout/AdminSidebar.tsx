'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import {
  LayoutDashboard,
  FileQuestion,
  BookOpen,
  Users,
  Swords,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/stores';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: FileQuestion, label: 'Questions', href: '/admin/questions' },
  { icon: BookOpen, label: 'Subjects', href: '/admin/subjects' },
  { icon: Users, label: 'Users', href: '/admin/users' },
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className = '' }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useUserStore();
  const supabase = createClient();
  
  const sidebarRef = useRef<HTMLElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  // removed loggingOut state to ensure immediate UX on sign-out

  // GSAP Animation on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sidebarRef.current,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
    });

    return () => ctx.revert();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    // Close modal first to avoid blocking UI
    setShowLogoutModal(false);
    // Clear local state immediately for instant feedback
    logout();
    // Redirect immediately to login
    router.replace('/');
    // Sign out from Supabase in background (still secure)
    supabase.auth.signOut().catch(console.error);
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        description="Are you sure you want to sign out of the admin panel?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
      />

      <aside
        ref={sidebarRef}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`fixed left-0 top-0 h-full bg-[#0a1628]/90 backdrop-blur-xl border-r border-white/5 flex flex-col z-40 transition-all duration-300 ease-out ${
          isExpanded ? 'w-64' : 'w-[72px]'
        } ${className}`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/5 h-[72px] flex items-center">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
              <Swords className="w-5 h-5 text-white" />
            </div>
            <div
              className={`whitespace-nowrap transition-all duration-300 ${
                isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}
            >
              <span className="font-bold text-lg block">Board Battle</span>
              <span className="text-xs text-gray-400">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-hidden">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                  active
                    ? 'bg-purple-500/20 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {/* Active indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-r-full" />
                )}
                <item.icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span
                  className={`font-medium whitespace-nowrap transition-all duration-300 ${
                    isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                >
                  {item.label}
                </span>

                {/* Tooltip when collapsed */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-[#1a2a40] rounded-lg text-sm font-medium text-white opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-white/5">
          {/* User info */}
          <div
            className={`flex items-center gap-3 px-3 py-2 mb-2 transition-all duration-300 ${
              isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden mb-0 py-0'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.username || 'Admin'}</p>
              <p className="text-xs text-purple-400">Administrator</p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 group relative"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span
              className={`font-medium whitespace-nowrap transition-all duration-300 ${
                isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}
            >
              Sign Out
            </span>

            {/* Tooltip when collapsed */}
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-[#1a2a40] rounded-lg text-sm font-medium text-white opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                Sign Out
              </div>
            )}
          </button>
        </div>

        {/* Expand indicator */}
        <div
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-12 bg-[#0d1f35] border border-white/10 rounded-full flex items-center justify-center transition-opacity duration-300 ${
            isExpanded ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
