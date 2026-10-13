'use client';

import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';

export const RecentHouseholdExpensesCard: React.FC = () => {
  const { expenses, addExpense } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form fields MUST BE EMPTY as requested
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('Household');
  const [amount, setAmount] = useState<string>('');

  const handleOpenModal = () => {
    setTitle('');
    setCategory('Household');
    setAmount('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    if (!title.trim() || !amount.trim()) return;

    addExpense({
      title: title.trim(),
      category,
      amount: Number(amount),
    });

    handleCloseModal();
  };

  const formatPKR = (amt: number) => `(Rs ${amt.toLocaleString()})`;

  const displayedExpenses = expenses.slice(0, 4);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-50">
        <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight">
          Recent Household Expenses
        </h2>
        <button
          type="button"
          onClick={handleOpenModal}
          className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg hover:bg-slate-50"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Expense
        </button>
      </div>

      {/* Table */}
      {displayedExpenses.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 font-medium">
          No expenses recorded yet. Click "+ Add Expense" above to add.
        </div>
      ) : (
        <div className="divide-y divide-slate-100/90">
          {displayedExpenses.map((exp) => (
            <div
              key={exp.id}
              className="py-3.5 flex items-center justify-between first:pt-2 last:pb-1"
            >
              <div className="text-sm font-medium text-slate-800">
                {exp.title}
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {formatPKR(exp.amount)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Expense Modal with EMPTY FIELDS */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 16px 32px -8px rgba(0, 0, 0, 0.08)',
            fontFamily: 'Poppins, sans-serif',
          },
        }}
      >
        <DialogTitle className="text-[15px] font-bold text-slate-900 border-b border-slate-100 flex items-center justify-between py-4">
          <span>Add Household Expense</span>
          <button
            onClick={handleCloseModal}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogTitle>

        <DialogContent className="pt-4 space-y-4">
          <p className="text-xs text-slate-500 mt-1 mb-2">
            Naya kharcha add karein (tamam fields khali hain):
          </p>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Expense Title / Detail
            </label>
            <TextField
              size="small"
              fullWidth
              placeholder="e.g. Groceries or Electric Bill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Amount (PKR)
              </label>
              <TextField
                size="small"
                fullWidth
                type="number"
                placeholder="e.g. 18500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Category
              </label>
              <TextField
                select
                size="small"
                fullWidth
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="Household">Household</MenuItem>
                <MenuItem value="Utilities">Utilities</MenuItem>
                <MenuItem value="Education">Education</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Medical">Medical</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </div>
          </div>
        </DialogContent>

        <DialogActions className="p-4 border-t border-slate-100 flex justify-end gap-2.5">
          <Button
            onClick={handleCloseModal}
            size="small"
            style={{ color: '#64748B', textTransform: 'none', fontWeight: 500 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            size="small"
            style={{
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '10px',
            }}
          >
            Save Expense
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
