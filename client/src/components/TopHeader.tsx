'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const TopHeader: React.FC = () => {
  const { householdName, fiscalMonth, isApiConnected } = useFinance();

  return (
    <header className="flex items-center justify-between pb-7 pt-1">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
          {householdName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          {fiscalMonth}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Dynamic State & Storage Indicator */}
        <div
          title={isApiConnected ? "Connected to Backend API • Synced" : "Dynamic Redux State • Auto-saved to Local Storage"}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isApiConnected ? 'Backend Synced' : 'Auto-Saved • Dynamic'}</span>
        </div>

        <button
          title="Notifications"
          className="w-9 h-9 rounded-full border border-slate-200/80 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors shadow-2xs"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Profile Avatar circle with avatar */}
        <div
          title="Admin Profile"
          className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-2xs cursor-pointer"
        >
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
            alt="Profile Avatar"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="text-xs font-semibold text-slate-700">AF</span>
        </div>
      </div>
    </header>
  );
};
