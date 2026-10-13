'use client';

import React from 'react';
import { useFinance } from '../context/FinanceContext';

export const IncomeVsExpensesCard: React.FC = () => {
  const { totalIncome, totalExpenses } = useFinance();

  const netRetained = Math.max(0, totalIncome - totalExpenses);

  const expenseRatio =
    totalIncome > 0 ? Math.min(100, (totalExpenses / totalIncome) * 100) : 0;
  const retainedRatio = Math.max(0, 100 - expenseRatio);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const expenseStroke = (expenseRatio / 100) * circumference;
  const retainedStroke = (retainedRatio / 100) * circumference;

  const formatPKR = (amt: number) => `Rs ${amt.toLocaleString()}`;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-50">
        <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight">
          Income vs Expenses
        </h2>
      </div>

      {/* Donut Chart & Legend */}
      <div className="flex items-center justify-center py-5">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth="13"
            />
            {/* Income Retained (Emerald green) */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#10B981"
              strokeWidth="13"
              strokeDasharray={`${retainedStroke} ${circumference}`}
              strokeDashoffset="0"
              strokeLinecap="round"
            />
            {/* Expenses (Warm Amber/Coral) */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#F59E0B"
              strokeWidth="13"
              strokeDasharray={`${expenseStroke} ${circumference}`}
              strokeDashoffset={`-${retainedStroke}`}
              strokeLinecap="round"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute text-center flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-slate-400 font-medium">
              Retained
            </span>
            <span className="text-xl font-bold text-slate-900 leading-tight">
              {retainedRatio.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-around text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-600 font-medium">
            Saved: <strong className="text-slate-900">{formatPKR(netRetained)}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span className="text-slate-600 font-medium">
            Spent: <strong className="text-slate-900">{formatPKR(totalExpenses)}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
