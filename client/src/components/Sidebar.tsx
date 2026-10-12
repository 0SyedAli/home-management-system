'use client';

import React from 'react';
import {
  LayoutDashboard,
  Home,
  Receipt,
  PiggyBank,
  Users2,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'rental', label: 'Portions & Rent', icon: Home, badge: '2 Active' },
    { id: 'expenses', label: 'Household Cashflow', icon: Receipt },
    { id: 'investments', label: 'Investments', icon: PiggyBank },
    { id: 'committee', label: 'Kameti (ROSCA)', icon: Users2, badge: 'Active' },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between min-h-screen select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
              H
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-900 tracking-tight leading-none">
                Bait-ul-Maal
              </h1>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                Household & Portions OS
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Finance & Assets
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isActive
                        ? 'bg-slate-200 text-slate-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User / Household Profile Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50/70 border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-700">
            SA
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-slate-800 truncate">Family Head Admin</p>
            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 inline" /> Verified Ledger
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
