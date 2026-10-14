'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Receipt,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  Settings,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const pathname = usePathname();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, href: '/' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, href: '/expenses' },
    { id: 'income', label: 'Income', icon: TrendingUp, href: '/investments' },
    { id: 'members', label: 'Members', icon: UserCheck, href: '/rental' },
    { id: 'utilities', label: 'Bills & Utilities', icon: Zap, href: '/rental' },
    { id: 'committee', label: 'Committee Management', icon: Users, href: '/committee' },
    { id: 'reports', label: 'Reports', icon: BarChart3, href: '/expenses' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-100 flex flex-col justify-between min-h-screen select-none shrink-0 py-7 px-4">
      <div>
        {/* Brand Mint Icon */}
        <Link href="/" className="px-3 mb-8 flex items-center gap-3 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center shadow-xs">
            {/* Curved abstract mint wave icon */}
            <svg
              className="w-5 h-5 text-emerald-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 14c4-6 8-6 12 0" />
              <path d="M8 10c2.5-4 5.5-4 8 0" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-800">
            Bait-ul-Maal
          </span>
        </Link>

        {/* Clean Navigation Menu Items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab !== undefined
                ? activeTab === item.id
                : item.href === '/'
                ? pathname === '/' || pathname === '/dashboard'
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  if (setActiveTab) setActiveTab(item.id);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-slate-100/90 text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-slate-900' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Subtle bottom note */}
      <div className="px-3 py-2 text-xs text-slate-400 font-normal border-t border-slate-100/80 pt-4">
        Family Finances OS
      </div>
    </aside>
  );
};
