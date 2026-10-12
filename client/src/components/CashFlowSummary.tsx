'use client';

import React from 'react';
import { ShoppingCart, Zap, Wrench, Stethoscope, GraduationCap, MoreHorizontal, ArrowUpRight } from 'lucide-react';

interface CashFlowSummaryProps {
  income: number;
  expenses: number;
  savings: number;
  categories: {
    Groceries: number;
    Utilities: number;
    Maintenance: number;
    Education: number;
    Medical: number;
    Miscellaneous: number;
  };
}

export const CashFlowSummary: React.FC<CashFlowSummaryProps> = ({
  income,
  expenses,
  savings,
  categories,
}) => {
  const expensePercentage = income > 0 ? Math.min(100, (expenses / income) * 100) : 0;
  const savingsPercentage = income > 0 ? Math.max(0, (savings / income) * 100) : 0;

  const categoryIcons: Record<string, React.ReactNode> = {
    Groceries: <ShoppingCart className="w-3.5 h-3.5 text-slate-500" />,
    Utilities: <Zap className="w-3.5 h-3.5 text-amber-500" />,
    Maintenance: <Wrench className="w-3.5 h-3.5 text-sky-500" />,
    Education: <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />,
    Medical: <Stethoscope className="w-3.5 h-3.5 text-rose-500" />,
    Miscellaneous: <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />,
  };

  const formatPKR = (amt: number) => `Rs ${amt.toLocaleString()}`;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Cash Flow & Expense Breakdown</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time monthly reconciliation against verified inflows
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-600 font-medium">Inflow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span className="text-slate-600 font-medium">Outflow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block" />
            <span className="text-slate-600 font-medium">Net Retained</span>
          </div>
        </div>
      </div>

      {/* Progress Bars for Macro Flow */}
      <div className="mt-4 pt-1">
        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
          <span>Income Utilization</span>
          <span className="text-slate-900 font-semibold">
            {expensePercentage.toFixed(1)}% Spent / {savingsPercentage.toFixed(1)}% Saved
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200/50">
          <div
            className="h-full bg-rose-500 rounded-l-full transition-all duration-500"
            style={{ width: `${expensePercentage}%` }}
            title={`Expenses: ${formatPKR(expenses)}`}
          />
          <div
            className="h-full bg-emerald-500 rounded-r-full transition-all duration-500"
            style={{ width: `${savingsPercentage}%` }}
            title={`Savings: ${formatPKR(savings)}`}
          />
        </div>
      </div>

      {/* Categorized Breakdown Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
        {Object.entries(categories).map(([catName, amount]) => {
          const share = expenses > 0 ? (amount / expenses) * 100 : 0;
          return (
            <div
              key={catName}
              className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-500">{catName}</span>
                {categoryIcons[catName]}
              </div>
              <div className="text-sm font-semibold text-slate-900">{formatPKR(amount)}</div>
              <div className="text-[10px] text-slate-400 mt-1">
                {share.toFixed(0)}% of total expenses
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
