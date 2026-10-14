'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { X, CheckCircle2, AlertTriangle, Clock, Info } from 'lucide-react';
import { CommitteeMember } from '../redux/types';

interface CommitteePaymentModalProps {
  open: boolean;
  onClose: () => void;
  member: CommitteeMember | null;
  currentCycleMonth?: string;
  onSave: (
    memberId: string,
    status: 'Paid' | 'Partial' | 'Pending',
    amountPaid: number,
    notes?: string
  ) => void;
}

export const CommitteePaymentModal: React.FC<CommitteePaymentModalProps> = ({
  open,
  onClose,
  member,
  currentCycleMonth = 'October 2026',
  onSave,
}) => {
  const [selectedType, setSelectedType] = useState<'Paid' | 'Partial' | 'Pending'>('Paid');
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (member) {
      const currentStatus = member.status || 'Pending';
      setSelectedType(currentStatus);

      if (currentStatus === 'Paid') {
        setAmountPaidInput(String(member.monthlyInstallment));
      } else if (currentStatus === 'Partial') {
        const paid = member.currentMonthPaidAmount !== undefined
          ? member.currentMonthPaidAmount
          : Math.round(member.monthlyInstallment / 2);
        setAmountPaidInput(String(paid));
      } else {
        setAmountPaidInput('0');
      }

      setNotesInput(member.notes || '');
      setError('');
    }
  }, [member, open]);

  if (!member) return null;

  const installment = member.monthlyInstallment || 0;
  const numAmountPaid = Number(amountPaidInput) || 0;
  const remainingDue = Math.max(0, installment - numAmountPaid);

  const formatPKR = (amt: number) => `Rs ${amt.toLocaleString()}`;

  const handleTypeSelect = (type: 'Paid' | 'Partial' | 'Pending') => {
    setSelectedType(type);
    setError('');
    if (type === 'Paid') {
      setAmountPaidInput(String(installment));
    } else if (type === 'Pending') {
      setAmountPaidInput('0');
    } else if (type === 'Partial') {
      if (numAmountPaid === 0 || numAmountPaid >= installment) {
        setAmountPaidInput(String(Math.round(installment / 2)));
      }
    }
  };

  const handleAmountChange = (val: string) => {
    setAmountPaidInput(val);
    const num = Number(val) || 0;
    if (num >= installment) {
      setSelectedType('Paid');
    } else if (num > 0) {
      setSelectedType('Partial');
    } else {
      setSelectedType('Pending');
    }
  };

  const handleSubmit = () => {
    setError('');

    let finalStatus = selectedType;
    let finalPaid = Number(amountPaidInput) || 0;

    if (finalPaid < 0) {
      setError('Amount paid cannot be negative.');
      return;
    }

    if (finalStatus === 'Partial') {
      if (finalPaid <= 0) {
        setError('For partial payment, amount must be greater than Rs 0.');
        return;
      }
      if (finalPaid >= installment) {
        finalStatus = 'Paid';
        finalPaid = installment;
      }
    } else if (finalStatus === 'Paid') {
      finalPaid = installment;
    } else if (finalStatus === 'Pending') {
      finalPaid = 0;
    }

    let finalNotes = notesInput.trim();
    if (finalStatus === 'Partial' && !finalNotes) {
      finalNotes = `${formatPKR(finalPaid)} ada kia. Baaqi ${formatPKR(installment - finalPaid)} agly month add hoga.`;
    }

    onSave(member.id, finalStatus, finalPaid, finalNotes);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '20px',
          fontFamily: 'Poppins, sans-serif',
          overflow: 'hidden',
        },
      }}
    >
      {/* Modal Header */}
      <DialogTitle className="text-base font-bold text-slate-900 border-b border-slate-100 flex items-center justify-between py-4 px-6">
        <div>
          <span>Record / Update Payment</span>
          <span className="block text-xs font-normal text-slate-500 mt-0.5">
            Active Month: <span className="font-semibold text-slate-700">{currentCycleMonth}</span>
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </DialogTitle>

      <DialogContent className="p-6 space-y-5">
        {/* Member Info Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Member Name</span>
            <span className="text-sm font-bold text-slate-900">{member.name}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium block">Monthly Kameti</span>
            <span className="text-sm font-bold text-slate-900">{formatPKR(installment)}</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Payment Type Selection Tabs/Cards */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-2">
            Select Payment Status
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {/* Full Paid Card */}
            <button
              type="button"
              onClick={() => handleTypeSelect('Paid')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedType === 'Paid'
                  ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    selectedType === 'Paid' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Full
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900">Pura Ada Kia</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                {formatPKR(installment)}
              </div>
            </button>

            {/* Partial Payment Card */}
            <button
              type="button"
              onClick={() => handleTypeSelect('Partial')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedType === 'Partial'
                  ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Info
                  className={`w-4 h-4 ${
                    selectedType === 'Partial' ? 'text-amber-600' : 'text-slate-400'
                  }`}
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  Partial
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900">Aadha / Kuch Ada</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                Baaqi agly month
              </div>
            </button>

            {/* Pending Card */}
            <button
              type="button"
              onClick={() => handleTypeSelect('Pending')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedType === 'Pending'
                  ? 'border-slate-500 bg-slate-100 ring-2 ring-slate-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Clock
                  className={`w-4 h-4 ${
                    selectedType === 'Pending' ? 'text-slate-600' : 'text-slate-400'
                  }`}
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Pending
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900">Baaqi Hai</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                Abhi nh dia
              </div>
            </button>
          </div>
        </div>

        {/* Input for Amount Paid */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Amount Paid This Month (PKR)
          </label>
          <TextField
            size="small"
            type="number"
            fullWidth
            value={amountPaidInput}
            onChange={(e) => handleAmountChange(e.target.value)}
            disabled={selectedType === 'Pending'}
            placeholder="e.g. 50000"
            helperText={
              selectedType === 'Partial'
                ? `Total: ${formatPKR(installment)} • Paid: ${formatPKR(numAmountPaid)} • Baaqi: ${formatPKR(remainingDue)}`
                : ''
            }
          />
        </div>

        {/* Partial Payment Calculation Summary Card */}
        {selectedType === 'Partial' && (
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/90 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-600">Kul Installment:</span>
              <span className="font-semibold text-slate-900">{formatPKR(installment)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-emerald-700 font-semibold">Ada Kia (Paid this month):</span>
              <span className="font-bold text-emerald-700">{formatPKR(numAmountPaid)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-amber-200/80">
              <span className="text-amber-800">Baaqi Dues (Agly month add hoga):</span>
              <span className="font-bold text-amber-800 text-sm">{formatPKR(remainingDue)}</span>
            </div>
            <p className="text-[11px] text-amber-700/90 italic pt-1">
              Yeh baaqi raqam ({formatPKR(remainingDue)}) record me note rahegi taa k agly mahine add kar k li jaye.
            </p>
          </div>
        )}

        {/* Notes / Remarks Field */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Remarks / Note (Optional)
          </label>
          <TextField
            size="small"
            fullWidth
            placeholder="e.g. 50 hazar is month de diye, baaqi 50 hazar agly month me add kr k denge"
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
          />
        </div>
      </DialogContent>

      <DialogActions className="p-4 px-6 border-t border-slate-100 flex justify-end gap-2.5">
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          size="small"
          className="text-xs normal-case rounded-xl text-slate-600 border-slate-200"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="small"
          className="text-xs normal-case rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-none px-5 py-2 font-semibold"
        >
          Save Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};
