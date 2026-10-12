'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  Calendar,
  CreditCard,
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

export interface TransactionRecord {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  date: string;
  title: string;
  paymentMethod: string;
  sourceOrPayee?: string;
}

interface ExpensesTrackerProps {
  transactions: TransactionRecord[];
  onAddTransaction: (data: any) => void;
}

export const ExpensesTracker: React.FC<ExpensesTrackerProps> = ({
  transactions,
  onAddTransaction,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Form State
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [category, setCategory] = useState<string>('Groceries');
  const [amount, setAmount] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');

  const formatPKR = (amt: number) => `Rs ${amt.toLocaleString()}`;

  const handleSubmit = () => {
    if (!title || !amount) return;
    onAddTransaction({
      type,
      category,
      amount: Number(amount),
      title,
      paymentMethod,
      date: new Date().toISOString(),
    });
    setIsModalOpen(false);
    setTitle('');
    setAmount(0);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            Household Cashflow Ledger
          </h2>
          <p className="text-xs text-slate-400">
            Categorized groceries, utilities, educational fees, and integrated rental inflows
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            {['ALL', 'EXPENSE', 'INCOME'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  filterType === tab
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'ALL' ? 'All Records' : tab === 'EXPENSE' ? 'Expenses' : 'Incomes'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Transaction Records List */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100">
          {filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'INCOME';

            return (
              <div
                key={tx.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isIncome
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                      {tx.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-medium text-slate-600">{tx.category}</span>
                      <span>•</span>
                      <span>{new Date(tx.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{tx.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-semibold tracking-tight ${
                      isIncome ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {isIncome ? `+${formatPKR(tx.amount)}` : `-${formatPKR(tx.amount)}`}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Reconciled</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
          },
        }}
      >
        <DialogTitle className="text-base font-semibold text-slate-900 border-b border-slate-100">
          Record Household Transaction
        </DialogTitle>
        <DialogContent className="pt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`py-2 text-xs font-semibold rounded-lg border ${
                type === 'EXPENSE'
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`py-2 text-xs font-semibold rounded-lg border ${
                type === 'INCOME'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Title / Details</label>
            <TextField
              size="small"
              fullWidth
              placeholder="e.g. Monthly Supermarket Grocery"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Category</label>
              <TextField
                select
                size="small"
                fullWidth
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {type === 'EXPENSE' ? (
                  [
                    'Groceries',
                    'Utilities',
                    'Maintenance',
                    'Medical',
                    'Education',
                    'Transportation',
                    'Miscellaneous',
                  ].map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))
                ) : (
                  ['Salary', 'Rental Inflow', 'Business / Freelance', 'Other Income'].map(
                    (cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    )
                  )
                )}
              </TextField>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Amount (PKR)</label>
              <TextField
                type="number"
                size="small"
                fullWidth
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Payment Method</label>
            <TextField
              select
              size="small"
              fullWidth
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              <MenuItem value="Credit Card">Credit Card</MenuItem>
              <MenuItem value="Online/EasyPaisa/JazzCash">EasyPaisa / JazzCash</MenuItem>
            </TextField>
          </div>
        </DialogContent>
        <DialogActions className="p-4 border-t border-slate-100">
          <Button onClick={() => setIsModalOpen(false)} size="small" style={{ color: '#64748B' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="small"
            style={{
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              textTransform: 'none',
              borderRadius: '8px',
            }}
          >
            Save Record
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
