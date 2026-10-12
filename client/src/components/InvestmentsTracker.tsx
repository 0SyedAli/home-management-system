'use client';

import React from 'react';
import { PiggyBank, ArrowUpRight, Plus, ExternalLink, ShieldAlert } from 'lucide-react';

export interface InvestmentItem {
  id: string;
  assetName: string;
  assetType: string;
  investedCapital: number;
  currentValuation: number;
  returnPercentage: number;
  purchaseDate: string;
  institutionOrBroker?: string;
  notes?: string;
}

interface InvestmentsTrackerProps {
  investments: InvestmentItem[];
}

export const InvestmentsTracker: React.FC<InvestmentsTrackerProps> = ({ investments }) => {
  const formatPKR = (amt: number) => `Rs ${amt.toLocaleString()}`;

  const totalInvested = investments.reduce((sum, i) => sum + i.investedCapital, 0);
  const totalValuation = investments.reduce((sum, i) => sum + i.currentValuation, 0);
  const totalReturn = totalValuation - totalInvested;
  const returnRate = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Portfolio Headline Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              Investments Portfolio & Asset Allocation
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Capital preservation, bullion gold, and mutual fund positions
            </p>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Add Asset Position
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50">
            <span className="text-[11px] font-medium text-slate-500">Invested Capital</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{formatPKR(totalInvested)}</div>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50">
            <span className="text-[11px] font-medium text-slate-500">Current Market Valuation</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{formatPKR(totalValuation)}</div>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50">
            <span className="text-[11px] font-medium text-slate-500">Unrealized Capital Gains</span>
            <div className="text-lg font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              +{formatPKR(totalReturn)} ({returnRate.toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {investments.map((inv) => {
          const gain = inv.currentValuation - inv.investedCapital;
          return (
            <div
              key={inv.id}
              className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 uppercase">
                    {inv.assetType}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center">
                    +{inv.returnPercentage.toFixed(1)}%
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 mt-2.5 leading-snug">
                  {inv.assetName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{inv.institutionOrBroker}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Invested Cost</span>
                    <span className="font-semibold text-slate-700">
                      {formatPKR(inv.investedCapital)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Current Value</span>
                    <span className="font-semibold text-slate-900">
                      {formatPKR(inv.currentValuation)}
                    </span>
                  </div>
                </div>
              </div>

              {inv.notes && (
                <div className="mt-3 p-2 rounded bg-slate-50 text-[11px] text-slate-500 border border-slate-100 italic">
                  "{inv.notes}"
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
