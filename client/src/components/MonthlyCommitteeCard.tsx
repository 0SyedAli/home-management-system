'use client';

import React from 'react';
import { useFinance } from '../context/FinanceContext';

export const MonthlyCommitteeCard: React.FC = () => {
  const { committeeMembers, toggleCommitteeStatus } = useFinance();

  const formatPKR = (amt: number) => `Rs ${amt.toLocaleString()}`;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] mb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-50">
        <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight">
          Monthly Committee (Kameti)
        </h2>
      </div>

      {/* Ledger Rows */}
      {committeeMembers.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 font-medium">
          No committee members added yet. Go to <a href="/committee" className="text-emerald-600 font-semibold underline">Committee</a> to add members.
        </div>
      ) : (
        <div className="divide-y divide-slate-100/90">
          {committeeMembers.map((member) => {
            const isPaid = member.status === 'Paid';

            return (
              <div
                key={member.id}
                className="py-3.5 flex items-center justify-between first:pt-2 last:pb-1"
              >
                {/* Member & Installment */}
                <div className="text-sm font-medium text-slate-900">
                  <span>{member.name}</span>
                  <span className="text-slate-300 mx-2">—</span>
                  <span className="font-semibold text-slate-900">{formatPKR(member.monthlyInstallment)}</span>
                </div>

                {/* 1-Click Status Toggle Pill */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleCommitteeStatus(member.id)}
                    title="Click to toggle status (Paid / Pending)"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-150 active:scale-95 border ${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {member.status}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
