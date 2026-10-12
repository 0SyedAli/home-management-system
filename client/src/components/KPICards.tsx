'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Building,
  PiggyBank,
  Users2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export interface DashboardMetrics {
  totalMonthlyIncome: number;
  salaryIncome: number;
  rentalIncome: number;
  householdExpenses: number;
  netMonthlySavings: number;
  savingsRatio: number;
  activeInvestmentsValuation: number;
  activeInvestmentsGain: number;
  committeeReceivable: number;
  committeeCollected: number;
}

interface KPICardsProps {
  metrics: DashboardMetrics;
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics }) => {
  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Monthly Income */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium text-slate-500">Monthly Inflow</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-semibold tracking-tight text-slate-900">
          {formatPKR(metrics.totalMonthlyIncome)}
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span className="truncate">Salary: {formatPKR(metrics.salaryIncome)}</span>
          <span className="text-emerald-600 font-medium truncate">
            Rent: +{formatPKR(metrics.rentalIncome)}
          </span>
        </div>
      </div>

      {/* 2. Household Expenses */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium text-slate-500">Household Expenses</span>
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-semibold tracking-tight text-slate-900">
          {formatPKR(metrics.householdExpenses)}
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>Groceries & Bills</span>
          <span className="text-rose-500 font-medium">Billed to Date</span>
        </div>
      </div>

      {/* 3. Net Monthly Savings */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium text-slate-500">Net Monthly Savings</span>
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div
          className={`text-xl font-semibold tracking-tight ${
            metrics.netMonthlySavings >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {formatPKR(metrics.netMonthlySavings)}
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>Savings Rate</span>
          <span className="font-semibold text-slate-700">{metrics.savingsRatio}% of Inflow</span>
        </div>
      </div>

      {/* 4. Active Investments */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium text-slate-500">Active Investments</span>
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-semibold tracking-tight text-slate-900">
          {formatPKR(metrics.activeInvestmentsValuation)}
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>Unrealized Gain</span>
          <span className="text-emerald-600 font-medium flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            +{formatPKR(metrics.activeInvestmentsGain)}
          </span>
        </div>
      </div>

      {/* 5. Committee Dues */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium text-slate-500">Committee (Kameti) Dues</span>
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <Users2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-semibold tracking-tight text-slate-900">
          {formatPKR(metrics.committeeReceivable)}
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>Collected: {formatPKR(metrics.committeeCollected)}</span>
          <span className="text-amber-600 font-medium">Pending Dues</span>
        </div>
      </div>
    </div>
  );
};
