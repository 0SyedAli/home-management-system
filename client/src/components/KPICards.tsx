'use client';

import React from 'react';
import { useFinance } from '../context/FinanceContext';

export const KPICards: React.FC = () => {
  const {
    salary,
    totalRentExpected,
    totalIncome,
    totalExpenses,
    totalCommitteePool,
    committeeMembers,
    totalInvestments,
  } = useFinance();

  const formatPKR = (num: number) => {
    return `Rs ${num.toLocaleString()}`;
  };

  const formatShortK = (num: number) => {
    if (num >= 1000) {
      const k = Math.round(num / 1000);
      return `Rs ${k}k`;
    }
    return `Rs ${num}`;
  };

  const budgetPercentage =
    totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0;

  const activeMembersCount = committeeMembers.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
      {/* 1. Total Income */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-200 transition-all">
        <span className="text-xs font-medium text-slate-500 block">
          Total Income
        </span>
        <div className="text-[25px] font-bold tracking-tight text-slate-900 my-1">
          {formatPKR(totalIncome)}
        </div>
        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <span>Salary: {formatShortK(salary)}</span>
          <span className="text-slate-300">•</span>
          <span>Rent: {formatShortK(totalRentExpected)}</span>
        </div>
      </div>

      {/* 2. Household Expenses */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-200 transition-all">
        <span className="text-xs font-medium text-slate-500 block">
          Household Expenses
        </span>
        <div className="text-[25px] font-bold tracking-tight text-slate-900 my-1">
          {formatPKR(totalExpenses)}
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {budgetPercentage}% of budget used
        </div>
      </div>

      {/* 3. Committee Dues */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-200 transition-all">
        <span className="text-xs font-medium text-slate-500 block">
          Committee Dues
        </span>
        <div className="text-[25px] font-bold tracking-tight text-slate-900 my-1">
          {formatPKR(totalCommitteePool)}
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {activeMembersCount}/{activeMembersCount} Members Active
        </div>
      </div>

      {/* 4. Active Investments */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-200 transition-all">
        <span className="text-xs font-medium text-slate-500 block">
          Active Investments
        </span>
        <div className="text-[25px] font-bold tracking-tight text-slate-900 my-1">
          {formatPKR(totalInvestments)}
        </div>
        <div className="text-xs text-emerald-600 font-semibold">
          Portfolio Active
        </div>
      </div>
    </div>
  );
};
