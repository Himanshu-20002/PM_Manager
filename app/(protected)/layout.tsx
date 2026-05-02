import { Sidebar } from '@/components/feature/Sidebar';
import { SessionProvider } from '@/lib/SessionContext';
import { DataProvider } from '@/lib/DataContext';
import React, { memo } from 'react';

const MemoizedSidebar = memo(Sidebar);

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DataProvider>
        <div className="flex h-screen bg-slate-50 overflow-hidden">
          <MemoizedSidebar />
          <main className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </DataProvider>
    </SessionProvider>
  );
}
