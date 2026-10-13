'use client';

import React, { useState } from 'react';
import { Portion, TenantLedgerEntry, useFinance } from '../context/FinanceContext';
import {
  X,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ShieldCheck,
  CreditCard,
  Receipt,
} from 'lucide-react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';

interface TenantLedgerModalProps {
  portion: Portion | null;
  open: boolean;
  onClose: () => void;
}

export const TenantLedgerModal: React.FC<TenantLedgerModalProps> = ({
  portion: initialPortion,
  open,
  onClose,
}) => {
  const { addLedgerEntry, portions } = useFinance();
  const portion = initialPortion ? portions.find((p) => p.id === initialPortion.id) || initialPortion : null;
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);

  // New entry form state
  const [newMonthYear, setNewMonthYear] = useState('');
  const [newBaseRent, setNewBaseRent] = useState('');
  const [newElectricBill, setNewElectricBill] = useState('');
  const [newGasBill, setNewGasBill] = useState('');
  const [newPaidAmount, setNewPaidAmount] = useState('');
  const [newPaymentDate, setNewPaymentDate] = useState('');
  const [newPaymentMode, setNewPaymentMode] = useState('Bank Transfer');
  const [newStatus, setNewStatus] = useState<'Paid' | 'Late' | 'Partial' | 'Pending'>('Paid');
  const [newNote, setNewNote] = useState('');

  if (!portion) return null;

  const formatPKR = (amt: number) => `Rs ${amt.toLocaleString()}`;

  const handleOpenAddEntry = () => {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    setNewMonthYear(currentMonthStr);
    setNewBaseRent(portion.monthlyRent.toString());
    setNewElectricBill('');
    setNewGasBill('');
    setNewPaidAmount('');
    setNewPaymentDate(todayStr);
    setNewPaymentMode('Bank Transfer');
    setNewStatus('Paid');
    setNewNote('');
    setIsAddEntryOpen(true);
  };

  const handleSaveEntry = () => {
    if (!newMonthYear.trim()) return;

    let formattedMonthYear = newMonthYear.trim();
    if (/^\d{4}-\d{2}$/.test(formattedMonthYear)) {
      const [year, month] = formattedMonthYear.split('-');
      const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      formattedMonthYear = dateObj.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    }

    let formattedPaymentDate = newPaymentDate || 'Today';
    if (/^\d{4}-\d{2}-\d{2}$/.test(newPaymentDate)) {
      const [y, m, d] = newPaymentDate.split('-');
      const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      formattedPaymentDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    const base = Number(newBaseRent) || portion.monthlyRent;
    const eBill = Number(newElectricBill) || 0;
    const gBill = Number(newGasBill) || 0;
    const util = eBill + gBill;
    const totalDue = base + util;
    const paid = newPaidAmount ? Number(newPaidAmount) : totalDue;

    addLedgerEntry(portion.id, {
      monthYear: formattedMonthYear,
      baseRent: base,
      electricBill: eBill,
      gasBill: gBill,
      utilities: util,
      totalDue,
      paidAmount: paid,
      paymentDate: formattedPaymentDate,
      paymentMode: newPaymentMode,
      status: newStatus,
      receiptNote: newNote,
    });

    setIsAddEntryOpen(false);
  };

  const totalPaidSum = portion.ledgerHistory.reduce((sum, h) => sum + h.paidAmount, 0);

  const getStatusBadge = (status: 'Paid' | 'Late' | 'Partial' | 'Pending') => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Paid
          </span>
        );
      case 'Late':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Late
          </span>
        );
      case 'Partial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="w-3 h-3 text-sky-600" />
            Partial
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending
          </span>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          fontFamily: 'Poppins, sans-serif',
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-slate-800" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Tenant Ledger & Payment Timeline
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {portion.name} • Tenant: <strong className="text-slate-800">{portion.tenantName}</strong> ({portion.tenantContact})
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </DialogTitle>

      <DialogContent className="p-6 pt-5 space-y-5">
        {/* Pass-through info banner */}
        {/* <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 text-xs text-amber-900 leading-relaxed flex items-center justify-between">
          <span>
            <strong>Record Note:</strong> Gas aur Bijli bills income ya expense me add nahi hotay (sirf split hotay hain), lekin kisne kis month kitna dia us ka mukammal record yahan rehta hai.
          </span>
        </div> */}

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
            <span className="text-xs text-slate-500 font-medium">Security Deposit</span>
            <div className="text-base font-bold text-slate-900 mt-1">
              {formatPKR(portion.securityDeposit)}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
            <span className="text-xs text-slate-500 font-medium">Base Monthly Rent</span>
            <div className="text-base font-bold text-slate-900 mt-1">
              {formatPKR(portion.monthlyRent)}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
            <span className="text-xs text-slate-500 font-medium">Total Realized Collection</span>
            <div className="text-base font-bold text-emerald-600 mt-1">
              {formatPKR(totalPaidSum)}
            </div>
          </div>
        </div>

        {/* Ledger History Table with Exact Requested Columns */}
        <div className="border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
          <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Date-wise Rent Records ({portion.ledgerHistory.length} Cycles)
            </span>
            <button
              onClick={handleOpenAddEntry}
              className="text-xs font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Past Month Record
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-white">
                  <th className="py-3 px-4">Month / Year</th>
                  <th className="py-3 px-4">Monthly Rent</th>
                  <th className="py-3 px-4">Bijli Bill</th>
                  <th className="py-3 px-4">Gas Bill</th>
                  <th className="py-3 px-4">Total Paid</th>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4">Remarks</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {portion.ledgerHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* 1. Month / Year */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{entry.monthYear}</span>
                      </div>
                    </td>

                    {/* 2. Monthly Rent */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {formatPKR(entry.baseRent)}
                    </td>

                    {/* 3. Bijli Bill */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {formatPKR(entry.electricBill !== undefined ? entry.electricBill : 0)}
                    </td>

                    {/* 4. Gas Bill */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {formatPKR(entry.gasBill !== undefined ? entry.gasBill : 0)}
                    </td>

                    {/* 5. Total Paid */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-700">
                        {formatPKR(entry.paidAmount)}
                      </div>
                      {entry.totalDue !== entry.paidAmount && (
                        <div className="text-[10px] text-slate-400">
                          Due: {formatPKR(entry.totalDue)}
                        </div>
                      )}
                    </td>

                    {/* 6. Payment Date */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div>{entry.paymentDate}</div>
                      {entry.paymentMode && (
                        <div className="text-[10px] text-slate-400">{entry.paymentMode}</div>
                      )}
                    </td>

                    {/* 7. Remarks */}
                    <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-[140px] truncate">
                      {entry.receiptNote || '—'}
                    </td>

                    {/* 8. Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(entry.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sub-form: Add Past Month Record */}
        {isAddEntryOpen && (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">
                Add Historical Ledger Entry
              </h4>
              <button
                onClick={() => setIsAddEntryOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <TextField
                size="small"
                type="month"
                label="Month / Year"
                InputLabelProps={{ shrink: true }}
                value={newMonthYear}
                onChange={(e) => setNewMonthYear(e.target.value)}
              />
              <TextField
                size="small"
                type="number"
                label="Monthly Rent (PKR)"
                value={newBaseRent}
                onChange={(e) => setNewBaseRent(e.target.value)}
              />
              <TextField
                size="small"
                type="date"
                label="Payment Date"
                InputLabelProps={{ shrink: true }}
                value={newPaymentDate}
                onChange={(e) => setNewPaymentDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <TextField
                size="small"
                type="number"
                label="Bijli Bill (PKR)"
                placeholder="e.g. 3400"
                value={newElectricBill}
                onChange={(e) => setNewElectricBill(e.target.value)}
              />
              <TextField
                size="small"
                type="number"
                label="Gas Bill (PKR)"
                placeholder="e.g. 1800"
                value={newGasBill}
                onChange={(e) => setNewGasBill(e.target.value)}
              />
              <TextField
                size="small"
                type="number"
                label="Total Amount Paid (PKR)"
                placeholder="Leave blank to auto-sum"
                value={newPaidAmount}
                onChange={(e) => setNewPaidAmount(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button
                onClick={handleSaveEntry}
                variant="contained"
                size="small"
                style={{
                  backgroundColor: '#0F172A',
                  color: '#fff',
                  borderRadius: '8px',
                  textTransform: 'none',
                }}
              >
                Save to Ledger
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions className="p-4 px-6 border-t border-slate-100 flex justify-end">
        <Button
          onClick={onClose}
          variant="contained"
          size="small"
          style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            textTransform: 'none',
            borderRadius: '10px',
            padding: '6px 20px',
            fontWeight: 600,
          }}
        >
          Close Ledger
        </Button>
      </DialogActions>
    </Dialog>
  );
};
