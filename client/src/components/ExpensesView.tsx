'use client';

import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, deleteExpense, totalExpenses } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Household');
  const [amount, setAmount] = useState('');

  const handleOpenAdd = () => {
    setTitle('');
    setCategory('Household');
    setAmount('');
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = () => {
    if (!title.trim() || !amount.trim()) return;
    addExpense({
      title: title.trim(),
      category,
      amount: Number(amount),
    });
    setIsAddModalOpen(false);
  };

  const formatPKR = (amt: number) => `Rs ${amt.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Household Expenses Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Total monthly outflow: <span className="font-semibold text-slate-900">{formatPKR(totalExpenses)}</span>
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {expenses.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            No household expenses recorded yet. Click "+ Add Expense" above to record an expense.
          </div>
        ) : (
          <div className="divide-y divide-slate-100/90">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    {exp.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                    <span className="text-slate-600">{exp.category}</span>
                    {exp.date && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span>{exp.date}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-900">
                    (Rs {exp.amount.toLocaleString()})
                  </span>
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50"
                    title="Delete Expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Add Expense (EMPTY FIELDS) */}
      <Dialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ style: { borderRadius: '20px', fontFamily: 'Poppins, sans-serif' } }}
      >
        <DialogTitle className="text-[15px] font-bold text-slate-900 border-b border-slate-100 flex items-center justify-between py-4">
          <span>Add Household Expense</span>
          <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </DialogTitle>
        <DialogContent className="pt-4 space-y-3.5">
          <p className="text-xs text-slate-500">Tamam fields khali hain:</p>
          <TextField
            size="small"
            fullWidth
            label="Expense Title"
            placeholder="e.g. Groceries, School Fees"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            select
            size="small"
            fullWidth
            label="Category"
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
          <TextField
            size="small"
            fullWidth
            type="number"
            label="Amount (PKR)"
            placeholder="e.g. 15000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
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
            Save Expense
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
