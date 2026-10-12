'use client';

import React, { useState } from 'react';
import {
  Users2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Award,
  ArrowRight,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';

export interface CommitteeMemberRow {
  id: string;
  name: string;
  monthlyInstallment: number;
  payoutMonthIndex: number;
  payoutMonthLabel: string;
  isPayoutCompleted: boolean;
  actualPayoutDate?: string;
  currentStatus: 'Paid' | 'Pending' | 'Overdue';
  totalContributed: number;
}

interface CommitteeTrackerProps {
  committeeName?: string;
  totalMonthlyPool?: number;
  currentCycleMonth?: string;
  totalMonths?: number;
  members: CommitteeMemberRow[];
  onToggleStatus: (memberId: string, currentStatus: 'Paid' | 'Pending' | 'Overdue') => void;
  onTogglePayout: (memberId: string, isCompleted: boolean) => void;
}

export const CommitteeTracker: React.FC<CommitteeTrackerProps> = ({
  committeeName = 'Khandan Annual Savings Kameti 2026',
  totalMonthlyPool = 280000,
  currentCycleMonth = 'October 2026 (Month 5)',
  totalMonths = 10,
  members: initialMembers,
  onToggleStatus,
  onTogglePayout,
}) => {
  const [members, setMembers] = useState<CommitteeMemberRow[]>(initialMembers);

  const formatPKR = (amt: number) => `Rs ${amt.toLocaleString()}`;

  const handleStatusClick = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const nextStatus =
            m.currentStatus === 'Paid'
              ? 'Pending'
              : m.currentStatus === 'Pending'
              ? 'Overdue'
              : 'Paid';
          onToggleStatus(memberId, nextStatus);
          return {
            ...m,
            currentStatus: nextStatus,
            totalContributed:
              nextStatus === 'Paid'
                ? m.totalContributed + m.monthlyInstallment
                : m.currentStatus === 'Paid'
                ? m.totalContributed - m.monthlyInstallment
                : m.totalContributed,
          };
        }
        return m;
      })
    );
  };

  const handlePayoutToggle = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const updated = !m.isPayoutCompleted;
          onTogglePayout(memberId, updated);
          return {
            ...m,
            isPayoutCompleted: updated,
            actualPayoutDate: updated ? new Date().toISOString() : undefined,
          };
        }
        return m;
      })
    );
  };

  const totalCollectedSoFar = members.reduce(
    (sum, m) => sum + (m.currentStatus === 'Paid' ? m.monthlyInstallment : 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* Overview Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Users2 className="w-4 h-4" />
              </span>
              <h2 className="text-base font-semibold text-slate-900">{committeeName}</h2>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Active Cycle
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Mutual ROSCA savings pool • Cycle {currentCycleMonth} of {totalMonths} Months
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">
                Monthly Pool
              </span>
              <span className="text-base font-bold text-slate-900 tracking-tight">
                {formatPKR(totalMonthlyPool)}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">
                Lifecycle Total
              </span>
              <span className="text-base font-bold text-slate-900 tracking-tight">
                {formatPKR(totalMonthlyPool * totalMonths)}
              </span>
            </div>
          </div>
        </div>

        {/* Current Month Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <span className="text-[11px] text-slate-500 font-medium">Current Month Realized</span>
            <div className="text-sm font-semibold text-emerald-600 mt-0.5">
              {formatPKR(totalCollectedSoFar)} / {formatPKR(totalMonthlyPool)}
            </div>
          </div>
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <span className="text-[11px] text-slate-500 font-medium">Current Draw Beneficiary</span>
            <div className="text-sm font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Nono ki Ami (Month 5)</span>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <span className="text-[11px] text-slate-500 font-medium">Collection Health</span>
            <div className="text-sm font-semibold text-slate-900 mt-0.5">
              {Math.round((totalCollectedSoFar / totalMonthlyPool) * 100)}% Collected
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Member Contribution Ledger & Payout Schedule
          </h3>
          <span className="text-[11px] text-slate-400">
            Click status chips to instantly toggle contribution
          </span>
        </div>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow className="bg-slate-50/70">
                <TableCell className="text-xs font-semibold text-slate-600 py-3">Member Name</TableCell>
                <TableCell className="text-xs font-semibold text-slate-600 py-3">
                  Monthly Installment
                </TableCell>
                <TableCell className="text-xs font-semibold text-slate-600 py-3">
                  Payout Month (Niklne ka Mahina)
                </TableCell>
                <TableCell className="text-xs font-semibold text-slate-600 py-3">
                  Payout Status
                </TableCell>
                <TableCell className="text-xs font-semibold text-slate-600 py-3 text-center">
                  Oct 2026 Status (Click to Toggle)
                </TableCell>
                <TableCell className="text-xs font-semibold text-slate-600 py-3 text-right">
                  Cumulative Paid
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => {
                const isCurrentBeneficiary = member.name.includes('Nono ki Ami');

                return (
                  <TableRow
                    key={member.id}
                    hover
                    className={`transition-colors ${
                      isCurrentBeneficiary ? 'bg-amber-50/30 font-medium' : ''
                    }`}
                  >
                    <TableCell className="py-3 text-xs font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-700">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span>{member.name}</span>
                          {isCurrentBeneficiary && (
                            <span className="block text-[10px] text-amber-600 font-semibold">
                              ★ Current Month Turn
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-xs font-semibold text-slate-800">
                      {formatPKR(member.monthlyInstallment)}
                    </TableCell>

                    <TableCell className="py-3 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Month {member.payoutMonthIndex} ({member.payoutMonthLabel})
                      </span>
                    </TableCell>

                    <TableCell className="py-3 text-xs">
                      <button
                        onClick={() => handlePayoutToggle(member.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                          member.isPayoutCompleted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {member.isPayoutCompleted ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Disbursed
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-slate-400" />
                            Scheduled
                          </>
                        )}
                      </button>
                    </TableCell>

                    <TableCell className="py-3 text-center">
                      <button
                        onClick={() => handleStatusClick(member.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border shadow-2xs transition-transform active:scale-95 ${
                          member.currentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : member.currentStatus === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}
                      >
                        {member.currentStatus === 'Paid' && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        )}
                        {member.currentStatus === 'Pending' && (
                          <Clock className="w-3 h-3 text-amber-600" />
                        )}
                        {member.currentStatus === 'Overdue' && (
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                        )}
                        {member.currentStatus}
                      </button>
                    </TableCell>

                    <TableCell className="py-3 text-xs font-semibold text-slate-900 text-right">
                      {formatPKR(member.totalContributed)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};
