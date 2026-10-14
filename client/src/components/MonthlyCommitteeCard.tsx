'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFinance } from '../context/FinanceContext';
import { Calendar, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { CommitteePaymentModal } from './CommitteePaymentModal';
import { CommitteeMember } from '../redux/types';

export const MonthlyCommitteeCard: React.FC = () => {
  const {
    committeeMembers,
    fiscalMonth,
    recordCommitteePayment,
    totalCommitteePool,
    totalCommitteeCollected,
  } = useFinance();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CommitteeMember | null>(null);

  // Active Month Label
  const activeCycle = fiscalMonth || 'October 2026';

  const formatPKR = (amt: number) => `Rs ${amt.toLocaleString()}`;

  const handleOpenPayment = (member: CommitteeMember) => {
    setSelectedMember(member);
    setPaymentModalOpen(true);
  };

  const handleSavePayment = (
    memberId: string,
    status: 'Paid' | 'Partial' | 'Pending',
    amountPaid: number,
    notes?: string
  ) => {
    recordCommitteePayment(memberId, status, amountPaid, notes);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] mb-6">
      {/* Header with Active Month Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2.5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight">
              Monthly Committee (Kameti)
            </h2>
            {/* Active Month Indicator */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mahina: {activeCycle}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Current month collection & dues status
          </p>
        </div>

        <Link
          href="/committee"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <span>View Full Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Progress / Summary Bar */}
      {committeeMembers.length > 0 && (
        <div className="pt-3 pb-1 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Collected: <span className="font-bold text-emerald-600">{formatPKR(totalCommitteeCollected)}</span> / {formatPKR(totalCommitteePool)}
          </span>
          <span className="text-[11px] text-slate-400">
            Click status to record Full / Partial payment
          </span>
        </div>
      )}

      {/* Ledger Rows */}
      {committeeMembers.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 font-medium">
          No committee members added yet. Go to{' '}
          <Link href="/committee" className="text-emerald-600 font-semibold underline">
            Committee Ledger
          </Link>{' '}
          to add members.
        </div>
      ) : (
        <div className="divide-y divide-slate-100/90 mt-2">
          {committeeMembers.map((member) => {
            const isPaid = member.status === 'Paid';
            const isPartial = member.status === 'Partial';
            const paidAmt = member.currentMonthPaidAmount || 0;
            const remainingDue = member.currentMonthRemainingDue !== undefined
              ? member.currentMonthRemainingDue
              : Math.max(0, member.monthlyInstallment - paidAmt);

            return (
              <div
                key={member.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 first:pt-2 last:pb-1"
              >
                {/* Member & Installment */}
                <div className="text-sm font-medium text-slate-900">
                  <span className="font-semibold">{member.name}</span>
                  <span className="text-slate-300 mx-2">—</span>
                  <span className="text-slate-700">{formatPKR(member.monthlyInstallment)}</span>
                  {/* {isPartial && (
                    <span className="block sm:inline sm:ml-2 text-xs font-medium text-amber-700">
                      (Baaqi {formatPKR(remainingDue)} agly month add hoga)
                    </span>
                  )} */}
                </div>

                {/* Status Button (Click to open Payment / Partial update modal) */}
                <div>
                  <button
                    type="button"
                    onClick={() => handleOpenPayment(member)}
                    title="Click to record Full or Partial payment"
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-150 active:scale-95 border ${isPaid
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : isPartial
                        ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                  >
                    {isPaid && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {isPartial && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                    {!isPaid && !isPartial && <Clock className="w-3.5 h-3.5 text-slate-400" />}

                    {isPaid && <span>Paid (Full)</span>}
                    {isPartial && (
                      // <span>
                      //   Partial: {formatPKR(paidAmt)} (Baaqi {formatPKR(remainingDue)})
                      // </span>
                      <span>
                        (Baaqi {formatPKR(remainingDue)})
                      </span>
                    )}
                    {!isPaid && !isPartial && <span>Pending</span>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal */}
      <CommitteePaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        member={selectedMember}
        currentCycleMonth={activeCycle}
        onSave={handleSavePayment}
      />
    </div>
  );
};
