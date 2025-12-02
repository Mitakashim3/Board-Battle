import { BottomNav } from '@/components/ui';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 pb-20">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
