'use client';

import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2, TrendingUp, X } from 'lucide-react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

export const InvestmentsView: React.FC = () => {
  const { investments, addInvestment, deleteInvestment, totalInvestments } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [investedCapital, setInvestedCapital] = useState('');
  const [currentValuation, setCurrentValuation] = useState('');

  const handleOpenAdd = () => {
    setName('');
    setType('');
    setInvestedCapital('');
    setCurrentValuation('');
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = () => {
    if (!name.trim()) return;
    addInvestment({
      name: name.trim(),
      type: type.trim() || 'Investment',
      investedCapital: investedCapital ? Number(investedCapital) : 0,
      currentValuation: currentValuation ? Number(currentValuation) : Number(investedCapital || 0),
    });
    setIsAddModalOpen(false);
  };

  const formatPKR = (amt: number) => `Rs ${amt.toLocaleString()}`;

  const totalCost = investments.reduce((sum, i) => sum + i.investedCapital, 0);
  const totalGain = totalInvestments - totalCost;

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Active Investments Portfolio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Mutual funds, gold bullion, and long term capital assets
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Investment
        </button>
      </div>

      {/* Top Portfolio Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <span className="text-xs text-slate-500 font-medium">Invested Capital</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatPKR(totalCost)}
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <span className="text-xs text-slate-500 font-medium">Current Valuation</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatPKR(totalInvestments)}
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <span className="text-xs text-slate-500 font-medium">Total Unrealized Gains</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            +{formatPKR(totalGain)}
          </div>
        </div>
      </div>

      {/* Asset Cards Grid */}
      {investments.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400 text-xs font-medium shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          No investments added yet. Click "+ Add Investment" above to record your assets.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {investments.map((inv) => (
            <div
              key={inv.id}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-slate-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 leading-snug">{inv.name}</h3>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mt-0.5">
                      {inv.type}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteInvestment(inv.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Cost Basis:</span>
                    <span className="text-slate-700 font-semibold">{formatPKR(inv.investedCapital)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Current Value:</span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatPKR(inv.currentValuation)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Investment (EMPTY FIELDS) */}
      <Dialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ style: { borderRadius: '20px', fontFamily: 'Poppins, sans-serif' } }}
      >
        <DialogTitle className="text-[15px] font-bold text-slate-900 border-b border-slate-100 flex items-center justify-between py-4">
          <span>Add Investment Asset</span>
          <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </DialogTitle>
        <DialogContent className="pt-4 space-y-3.5">
          <p className="text-xs text-slate-500">Tamam fields khali hain:</p>
          <TextField
            size="small"
            fullWidth
            label="Asset / Position Name"
            placeholder="e.g. Al Meezan Mutual Fund"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            size="small"
            fullWidth
            label="Asset Type"
            placeholder="e.g. Gold, Mutual Funds, Real Estate"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
          <TextField
            size="small"
            fullWidth
            type="number"
            label="Invested Capital (PKR)"
            placeholder="e.g. 500000"
            value={investedCapital}
            onChange={(e) => setInvestedCapital(e.target.value)}
          />
          <TextField
            size="small"
            fullWidth
            type="number"
            label="Current Valuation (PKR)"
            placeholder="e.g. 620000"
            value={currentValuation}
            onChange={(e) => setCurrentValuation(e.target.value)}
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
            Add Asset
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
