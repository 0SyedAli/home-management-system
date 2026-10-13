'use client';

import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2, Users, CheckCircle2, Clock, X } from 'lucide-react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

export const CommitteeView: React.FC = () => {
  const {
    committeeMembers,
    toggleCommitteeStatus,
    addCommitteeMember,
    deleteCommitteeMember,
    totalCommitteePool,
    totalCommitteeCollected,
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [monthlyInstallment, setMonthlyInstallment] = useState('');

  const handleOpenAdd = () => {
    setName('');
    setMonthlyInstallment('');
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = () => {
    if (!name.trim()) return;
    addCommitteeMember({
      name: name.trim(),
      monthlyInstallment: monthlyInstallment ? Number(monthlyInstallment) : 0,
      status: 'Pending',
    });
    setIsAddModalOpen(false);
  };

  const formatPKR = (amt: number) => `Rs ${amt.toLocaleString()}`;

  const pendingAmount = totalCommitteePool - totalCommitteeCollected;

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Committee (Kameti) Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Mutual ROSCA savings pool with monthly collection status
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Top Pool Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <span className="text-xs text-slate-500 font-medium">Total Monthly Pool</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatPKR(totalCommitteePool)}
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <span className="text-xs text-slate-500 font-medium">Realized to Date (Paid)</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {formatPKR(totalCommitteeCollected)}
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <span className="text-xs text-slate-500 font-medium">Pending Dues</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {formatPKR(pendingAmount)}
          </div>
        </div>
      </div>

      {/* Members List Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Kameti Participants ({committeeMembers.length} Members)
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Click status to toggle Paid / Pending
          </span>
        </div>

        {committeeMembers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            No committee members added yet. Click "+ Add Member" above to add participants.
          </div>
        ) : (
          <div className="divide-y divide-slate-100/90">
            {committeeMembers.map((member) => {
              const isPaid = member.status === 'Paid';

              return (
                <div
                  key={member.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xs font-semibold text-slate-700">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {member.name}
                      </div>
                      <div className="text-xs text-slate-500 font-normal">
                        Monthly Contribution
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-sm font-bold text-slate-900">
                      {formatPKR(member.monthlyInstallment)}
                    </div>

                    <button
                      onClick={() => toggleCommitteeStatus(member.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {member.status}
                    </button>

                    <button
                      onClick={() => deleteCommitteeMember(member.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Add Member (EMPTY FIELDS) */}
      <Dialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ style: { borderRadius: '20px', fontFamily: 'Poppins, sans-serif' } }}
      >
        <DialogTitle className="text-[15px] font-bold text-slate-900 border-b border-slate-100 flex items-center justify-between py-4">
          <span>Add Kameti Member</span>
          <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </DialogTitle>
        <DialogContent className="pt-4 space-y-3.5">
          <p className="text-xs text-slate-500">Tamam fields khali hain:</p>
          <TextField
            size="small"
            fullWidth
            label="Member Name"
            placeholder="e.g. Asma Aunty"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            size="small"
            fullWidth
            type="number"
            label="Monthly Installment (PKR)"
            placeholder="e.g. 50000"
            value={monthlyInstallment}
            onChange={(e) => setMonthlyInstallment(e.target.value)}
          />
        </DialogContent>
        <DialogActions className="p-4 border-t border-slate-100">
          <Button onClick={() => setIsAddModalOpen(false)} style={{ color: '#64748B', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveAdd}
            variant="contained"
            style={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '10px', textTransform: 'none' }}
          >
            Add Member
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
