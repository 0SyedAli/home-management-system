'use client';

import React, { useState } from 'react';
import {
  Drawer,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  X,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Plus,
  ArrowRight,
  TrendingUp,
  Receipt,
  Edit2,
  History,
} from 'lucide-react';
import { IndividualCommittee, ScheduledInstallment } from '../../redux/types';

interface CommitteeDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  committee: IndividualCommittee | null;
  onOpenRecordPayment: (committeeId: string, installmentId: string) => void;
  onOpenEditCommittee: (committee: IndividualCommittee) => void;
}

export const CommitteeDetailDrawer: React.FC<CommitteeDetailDrawerProps> = ({
  open,
  onClose,
  committee,
  onOpenRecordPayment,
  onOpenEditCommittee,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedInstallmentHistory, setSelectedInstallmentHistory] = useState<ScheduledInstallment | null>(null);

  if (!committee) return null;

  const formatPKR = (amt: number) => `Rs ${amt.toLocaleString()}`;

  const outstandingBalance = Math.max(0, committee.totalExpectedAmount - committee.totalPaidAmount);
  const paidMonths = committee.installments.filter((i) => i.status === 'Paid').length;
  const partialMonths = committee.installments.filter((i) => i.status === 'Partially Paid').length;
  const pendingMonths = committee.installments.filter((i) => i.status === 'Pending').length;
  const progressPercent = Math.min(100, Math.round((committee.totalPaidAmount / committee.totalExpectedAmount) * 100));

  const filteredInstallments = committee.installments.filter((inst) => {
    if (filterStatus === 'All') return true;
    return inst.status === filterStatus;
  });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          width: '100%',
          maxWidth: '780px',
          fontFamily: 'Poppins, sans-serif',
          backgroundColor: '#FFFFFF',
        },
      }}
    >
      <div className="flex flex-col h-full bg-slate-50/30">
        {/* Drawer Header */}
        <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {committee.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {committee.locationName}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  committee.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : committee.status === 'Partially Paid'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {committee.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {committee.membersCount} Members ({committee.membersCount} × {formatPKR(committee.sharePerMember)}) • {committee.durationMonths} Months Duration ({committee.startMonth} – {committee.endMonth})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenEditCommittee(committee)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top KPI Cards (4 Tiles) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-2xs">
              <span className="text-[11px] text-slate-400 font-medium block">Monthly Due</span>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {formatPKR(committee.monthlyAmount)}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">per installment</span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-2xs">
              <span className="text-[11px] text-slate-400 font-medium block">Total Expected</span>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {formatPKR(committee.totalExpectedAmount)}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">{committee.durationMonths} scheduled</span>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 shadow-2xs">
              <span className="text-[11px] text-emerald-700 font-medium block">Total Paid</span>
              <div className="text-lg font-bold text-emerald-700 mt-1">
                {formatPKR(committee.totalPaidAmount)}
              </div>
              <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
                {paidMonths} of {committee.durationMonths} months paid
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/40 shadow-2xs">
              <span className="text-[11px] text-amber-700 font-medium block">Remaining Due</span>
              <div className="text-lg font-bold text-amber-700 mt-1">
                {formatPKR(outstandingBalance)}
              </div>
              <span className="text-[10px] text-amber-600 font-medium mt-0.5 block">
                {pendingMonths + partialMonths} months remaining
              </span>
            </div>
          </div>

          {/* Progress Bar Banner */}
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-700">Lifecycle Payment Progress</span>
                <span className="text-blue-700">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="text-xs font-medium text-slate-500 shrink-0">
              {paidMonths} Full Paid {partialMonths > 0 && `• ${partialMonths} Partial`} • {pendingMonths} Pending
            </div>
          </div>

          {/* My Committee Month (Payout) Banner */}
          {committee.myCommitteeMonth && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                  ⭐
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                    My Committee Month (Payout Turn)
                  </span>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {committee.myCommitteeMonth}
                  </div>
                  <span className="text-xs text-amber-900 font-medium">
                    Expected Full Pool Payout: {formatPKR(committee.payoutAmount || (committee.monthlyAmount * committee.durationMonths))}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                  Meri Kameti ka Mahina
                </span>
              </div>
            </div>
          )}

          {/* Monthly Payment Schedule Section Header & Filters */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Monthly Payment Schedule ({committee.installments.length} Months)
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Independent schedule from {committee.startMonth} to {committee.endMonth}
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/60 self-start sm:self-auto">
                {['All', 'Paid', 'Partially Paid', 'Pending'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      filterStatus === st
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Installments Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Month / Cycle</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Amount Due</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Balance</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/90 text-slate-700">
                  {filteredInstallments.map((inst) => {
                    const isPaid = inst.status === 'Paid';
                    const isPartial = inst.status === 'Partially Paid';
                    const isPending = inst.status === 'Pending';

                    return (
                      <tr
                        key={inst.id}
                        className={`transition-colors ${
                          committee.myCommitteeMonth &&
                          (inst.monthYear === committee.myCommitteeMonth ||
                            committee.myCommitteeMonth.includes(inst.monthYear))
                            ? 'bg-amber-50/40 hover:bg-amber-50/70'
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-400">
                          {inst.monthIndex}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{inst.monthYear}</span>
                            {committee.myCommitteeMonth &&
                              (inst.monthYear === committee.myCommitteeMonth ||
                                committee.myCommitteeMonth.includes(inst.monthYear)) && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  ⭐ My Payout
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {inst.dueDate}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {formatPKR(inst.amountDue)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600">
                          {formatPKR(inst.amountPaid)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-600">
                          {formatPKR(inst.remainingDue)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isPartial
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {inst.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inst.transactions && inst.transactions.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setSelectedInstallmentHistory(inst)}
                                title="View Payment Transactions"
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onOpenRecordPayment(committee.id, inst.id)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-2xs ${
                                isPaid
                                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isPaid ? 'Edit' : isPartial ? 'Pay Rest' : 'Pay'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Transaction History Sub-modal */}
        {selectedInstallmentHistory && (
          <div className="p-5 border-t border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-blue-600" />
                <span>Transactions for {selectedInstallmentHistory.monthYear}</span>
              </div>
              <button
                onClick={() => setSelectedInstallmentHistory(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>
            <div className="space-y-2">
              {selectedInstallmentHistory.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900">
                      {formatPKR(tx.amount)}
                    </span>
                    <span className="text-slate-400 ml-2">via {tx.paymentMethod || 'Cash'}</span>
                    {tx.notes && <p className="text-[11px] text-slate-500 mt-0.5">{tx.notes}</p>}
                  </div>
                  <div className="text-right text-[11px] text-slate-500 font-medium">
                    {tx.paymentDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};
