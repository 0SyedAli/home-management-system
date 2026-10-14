'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';
import {
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Receipt,
  Info,
} from 'lucide-react';
import { IndividualCommittee, ScheduledInstallment } from '../../redux/types';

interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
  committees: IndividualCommittee[];
  selectedCommitteeId?: string;
  selectedInstallmentId?: string;
  onSavePayment: (data: {
    committeeId: string;
    installmentId?: string;
    monthKey?: string;
    monthYear?: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    notes?: string;
    referenceNo?: string;
    isOverride?: boolean;
  }) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  open,
  onClose,
  committees,
  selectedCommitteeId,
  selectedInstallmentId,
  onSavePayment,
}) => {
  const [committeeId, setCommitteeId] = useState<string>('');
  const [installmentId, setInstallmentId] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'full' | 'partial' | 'pending' | 'custom'>('full');
  const [amountInput, setAmountInput] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Initial selection setup
  useEffect(() => {
    if (open) {
      const activeCommId = selectedCommitteeId || (committees[0]?.id ?? '');
      setCommitteeId(activeCommId);

      const comm = committees.find((c) => c.id === activeCommId);
      const activeInst =
        comm?.installments.find((i) => i.id === selectedInstallmentId) ||
        comm?.installments.find((i) => i.status !== 'Paid') ||
        comm?.installments[0];

      const instId = activeInst ? activeInst.id : '';
      setInstallmentId(instId);

      const remaining = activeInst ? activeInst.remainingDue : 20000;
      setAmountInput(String(remaining));
      setPaymentType(remaining > 0 ? 'full' : 'pending');

      const today = new Date().toISOString().split('T')[0];
      setPaymentDate(today);
      setPaymentMethod('Bank Transfer');
      setReferenceNo('');
      setNotes('');
      setError('');
    }
  }, [open, selectedCommitteeId, selectedInstallmentId, committees]);

  const currentCommittee = useMemo(() => {
    return committees.find((c) => c.id === committeeId) || committees[0];
  }, [committees, committeeId]);

  const currentInstallment = useMemo(() => {
    if (!currentCommittee) return null;
    return (
      currentCommittee.installments.find((i) => i.id === installmentId) ||
      currentCommittee.installments[0] ||
      null
    );
  }, [currentCommittee, installmentId]);

  // When committee changes, update installment list
  const handleCommitteeChange = (newCommId: string) => {
    setCommitteeId(newCommId);
    const comm = committees.find((c) => c.id === newCommId);
    if (comm && comm.installments.length > 0) {
      const pendingInst = comm.installments.find((i) => i.status !== 'Paid') || comm.installments[0];
      setInstallmentId(pendingInst.id);
      setAmountInput(String(pendingInst.remainingDue));
    }
  };

  // When installment changes, update amount input
  const handleInstallmentChange = (newInstId: string) => {
    setInstallmentId(newInstId);
    if (currentCommittee) {
      const inst = currentCommittee.installments.find((i) => i.id === newInstId);
      if (inst) {
        setAmountInput(String(inst.remainingDue));
      }
    }
  };

  const dueAmount = currentInstallment?.amountDue || 0;
  const alreadyPaid = currentInstallment?.amountPaid || 0;
  const remainingDue = currentInstallment?.remainingDue || 0;
  const numEnteredAmount = Number(amountInput) || 0;

  // Real-time calculation of new totals
  const projectedPaid = alreadyPaid + numEnteredAmount;
  const projectedRemaining = Math.max(0, dueAmount - projectedPaid);

  const projectedStatus = useMemo(() => {
    if (numEnteredAmount <= 0) return alreadyPaid > 0 ? (alreadyPaid >= dueAmount ? 'Paid' : 'Partially Paid') : 'Pending';
    if (projectedPaid >= dueAmount) return 'Paid';
    return 'Partially Paid';
  }, [numEnteredAmount, projectedPaid, dueAmount, alreadyPaid]);

  const handleSelectPaymentPreset = (type: 'full' | 'partial' | 'pending') => {
    setPaymentType(type);
    setError('');
    if (type === 'full') {
      setAmountInput(String(remainingDue > 0 ? remainingDue : dueAmount));
    } else if (type === 'partial') {
      const half = Math.round(remainingDue / 2) || Math.round(dueAmount / 2);
      setAmountInput(String(half));
    } else if (type === 'pending') {
      setAmountInput('0');
    }
  };

  const handleSubmit = () => {
    setError('');
    if (!currentCommittee || !currentInstallment) {
      setError('Please select a committee and scheduled installment.');
      return;
    }

    if (numEnteredAmount < 0) {
      setError('Amount cannot be negative.');
      return;
    }

    if (numEnteredAmount > remainingDue && remainingDue > 0) {
      // Prompt user or clamp
      setError(`Entered amount (Rs ${numEnteredAmount.toLocaleString()}) exceeds the remaining due balance of Rs ${remainingDue.toLocaleString()}.`);
      return;
    }

    onSavePayment({
      committeeId: currentCommittee.id,
      installmentId: currentInstallment.id,
      monthKey: currentInstallment.monthKey,
      monthYear: currentInstallment.monthYear,
      amount: numEnteredAmount,
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod,
      notes: notes.trim(),
      referenceNo: referenceNo.trim(),
      isOverride: numEnteredAmount === 0 && paymentType === 'pending',
    });

    onClose();
  };

  const formatPKR = (amt: number) => `Rs ${amt.toLocaleString()}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '24px',
          fontFamily: 'Poppins, sans-serif',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle className="text-base font-bold text-slate-900 border-b border-slate-100 flex items-center justify-between py-4 px-6">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-blue-600" />
          <span>Record Committee Payment</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </DialogTitle>

      <DialogContent className="p-6 space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Committee & Installment Month Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Select Committee
            </label>
            <TextField
              select
              size="small"
              fullWidth
              value={committeeId}
              onChange={(e) => handleCommitteeChange(e.target.value)}
            >
              {committees.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} ({c.locationName})
                </MenuItem>
              ))}
            </TextField>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Scheduled Month / Installment
            </label>
            <TextField
              select
              size="small"
              fullWidth
              value={installmentId}
              onChange={(e) => handleInstallmentChange(e.target.value)}
            >
              {currentCommittee?.installments.map((inst) => (
                <MenuItem key={inst.id} value={inst.id}>
                  Month {inst.monthIndex}: {inst.monthYear} ({inst.status})
                </MenuItem>
              ))}
            </TextField>
          </div>
        </div>

        {/* Installment Snapshot Cards */}
        {currentInstallment && (
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Total Monthly Due</span>
              <span className="text-sm font-bold text-slate-900">{formatPKR(dueAmount)}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Already Paid</span>
              <span className="text-sm font-bold text-emerald-600">{formatPKR(alreadyPaid)}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Current Balance</span>
              <span className="text-sm font-bold text-amber-600">{formatPKR(remainingDue)}</span>
            </div>
          </div>
        )}

        {/* Payment Presets Tabs */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Quick Payment Preset
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleSelectPaymentPreset('full')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                paymentType === 'full'
                  ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    paymentType === 'full' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Scenario A</span>
              </div>
              <div className="text-xs font-bold text-slate-900">Pay Full Due</div>
              <div className="text-[11px] text-slate-500">{formatPKR(remainingDue)}</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPaymentPreset('partial')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                paymentType === 'partial'
                  ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Info
                  className={`w-4 h-4 ${
                    paymentType === 'partial' ? 'text-amber-600' : 'text-slate-400'
                  }`}
                />
                <span className="text-[10px] font-bold text-amber-700 uppercase">Scenario B/C</span>
              </div>
              <div className="text-xs font-bold text-slate-900">Partial Payment</div>
              <div className="text-[11px] text-slate-500">Pay in Installments</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPaymentPreset('pending')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                paymentType === 'pending'
                  ? 'border-slate-500 bg-slate-100 ring-2 ring-slate-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Clock
                  className={`w-4 h-4 ${
                    paymentType === 'pending' ? 'text-slate-600' : 'text-slate-400'
                  }`}
                />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Scenario D</span>
              </div>
              <div className="text-xs font-bold text-slate-900">Mark Pending</div>
              <div className="text-[11px] text-slate-500">Unpaid Rs 0</div>
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Payment Amount to Record (PKR) <span className="text-rose-500">*</span>
          </label>
          <TextField
            size="small"
            fullWidth
            type="number"
            placeholder="e.g. 20000"
            value={amountInput}
            onChange={(e) => {
              setAmountInput(e.target.value);
              setPaymentType('custom');
            }}
          />
        </div>

        {/* Real-time Calculation Summary Card */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-700">
            <span>Cumulative Paid After This:</span>
            <span className="font-bold text-emerald-700">{formatPKR(projectedPaid)} / {formatPKR(dueAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Remaining Unpaid Balance:</span>
            <span className="font-bold text-amber-700">{formatPKR(projectedRemaining)}</span>
          </div>
          <div className="flex justify-between text-slate-700 pt-1 border-t border-blue-200/70 font-semibold">
            <span>Resulting Status:</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                projectedStatus === 'Paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : projectedStatus === 'Partially Paid'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {projectedStatus}
            </span>
          </div>
        </div>

        {/* Payment Date & Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Payment Date
            </label>
            <TextField
              size="small"
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Payment Method
            </label>
            <TextField
              select
              size="small"
              fullWidth
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Online">Online Banking</MenuItem>
              <MenuItem value="EasyPaisa">EasyPaisa</MenuItem>
              <MenuItem value="JazzCash">JazzCash</MenuItem>
              <MenuItem value="Cheque">Cheque</MenuItem>
            </TextField>
          </div>
        </div>

        {/* Reference & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Reference / Tx ID (Optional)
            </label>
            <TextField
              size="small"
              fullWidth
              placeholder="e.g. TRX-98124"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Notes / Remarks (Optional)
            </label>
            <TextField
              size="small"
              fullWidth
              placeholder="e.g. 1st installment paid"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
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
          className="text-xs normal-case rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-none px-6 py-2 font-semibold"
        >
          Save Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};
