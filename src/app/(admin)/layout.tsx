'use client';

import { AdminSidebar } from '@/components/layout/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#071020] to-[#030812]">
      <AdminSidebar />
      <main className="ml-[72px] min-h-screen">
        {children}
      </main>
    </div>
  );
}
