'use client';

import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Check } from 'lucide-react';
import { TextField, Button } from '@mui/material';

export const SettingsView: React.FC = () => {
  const {
    householdName,
    setHouseholdName,
    salary,
    setSalary,
    fiscalMonth,
    setFiscalMonth,
    resetToFreshState,
  } = useFinance();

  const [nameInput, setNameInput] = useState(householdName);
  const [salaryInput, setSalaryInput] = useState(salary ? salary.toString() : '');
  const [monthInput, setMonthInput] = useState(fiscalMonth);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSave = () => {
    if (nameInput.trim()) setHouseholdName(nameInput.trim());
    if (salaryInput.trim() && !isNaN(Number(salaryInput))) {
      setSalary(Number(salaryInput));
    }
    if (monthInput.trim()) setFiscalMonth(monthInput.trim());

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear all data and start completely fresh?')) {
      resetToFreshState();
      setNameInput('Bait-ul-Maal');
      setSalaryInput('0');
      setMonthInput('October 2026');
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="pb-3 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Household & Fiscal Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Configure household title, primary salary, and active calendar cycle
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Household Title / Name
          </label>
          <TextField
            size="small"
            fullWidth
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g. Bait-ul-Maal / My Home Finances"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Primary Monthly Salary (PKR)
          </label>
          <TextField
            size="small"
            fullWidth
            type="number"
            value={salaryInput}
            onChange={(e) => setSalaryInput(e.target.value)}
            placeholder="e.g. 150000"
          />
          <p className="text-xs text-slate-400 mt-1">
            Used to compute Total Income (Salary + Portions Rent).
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Active Fiscal Cycle Month
          </label>
          <TextField
            size="small"
            fullWidth
            value={monthInput}
            onChange={(e) => setMonthInput(e.target.value)}
            placeholder="e.g. October 2026"
          />
        </div>

        <div className="pt-3 flex items-center justify-between border-t border-slate-100">
          <Button
            onClick={handleSave}
            variant="contained"
            style={{
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '10px',
              padding: '8px 20px',
              fontSize: '13px',
            }}
          >
            Save Settings
          </Button>

          {savedSuccess && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Changes saved successfully!
            </span>
          )}
        </div>
      </div>

      {/* Fresh Reset Section */}
      <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
        <h3 className="text-sm font-bold text-rose-900">
          Clear Data & Fresh App
        </h3>
        <p className="text-xs text-slate-600">
          Agar aap tamam dummy ya purana data saaf karke bilkul fresh start karna chahte hain, to neeche button dabayein:
        </p>
        <div className="pt-2 flex items-center gap-4">
          <Button
            onClick={handleReset}
            variant="outlined"
            color="error"
            style={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '10px',
              fontSize: '13px',
            }}
          >
            Reset All Data to Fresh State
          </Button>
          {resetSuccess && (
            <span className="text-xs text-rose-600 font-semibold">
              ✓ All data cleared! Fresh state active.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
