'use client';

import React from 'react';
import { FinanceProvider } from '../context/FinanceContext';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <FinanceProvider>
      <div className="min-h-screen bg-white text-slate-900 flex font-sans antialiased">
        {/* 1. Sleek Left Sidebar */}
        <Sidebar />

        {/* 2. Main Viewport */}
        <main className="flex-1 min-w-0 bg-white px-8 py-6 overflow-y-auto">
          {/* Top Header */}
          <TopHeader />

          {/* Child Page Content */}
          {children}
        </main>
      </div>
    </FinanceProvider>
  );
}
