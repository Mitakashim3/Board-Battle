'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Sidebar } from '@/components/layout';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bgShapesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.bg-shape', {
        y: -30,
        duration: 8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 2,
      });
    }, bgShapesRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#071020] to-[#030812] text-white overflow-hidden">
      {/* Background 3D Shapes */}
      <div ref={bgShapesRef} className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="bg-shape absolute top-20 left-1/4 w-64 h-96 bg-gradient-to-b from-[#1a3a5c]/20 to-transparent rounded-full blur-3xl" />
        <div className="bg-shape absolute top-40 right-1/4 w-48 h-80 bg-gradient-to-b from-[#0d2847]/30 to-transparent rounded-full blur-3xl" />
        <div className="bg-shape absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-t from-[#1a3a5c]/10 to-transparent rounded-full blur-3xl" />
        {/* Vertical light columns */}
        <div className="absolute top-0 left-[20%] w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        <div className="absolute top-0 left-[50%] w-px h-full bg-gradient-to-b from-transparent via-white/3 to-transparent" />
        <div className="absolute top-0 left-[80%] w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      </div>

      <Sidebar />

      <div className="relative min-h-screen">
        <main className="ml-[72px] transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
