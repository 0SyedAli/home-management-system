'use client';

import React, { useState } from 'react';
import { useFinance, Portion } from '../context/FinanceContext';
import { Wallet, Check, X, Calendar, CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';

export const RentCollectionCard: React.FC = () => {
  const {
    portions,
    togglePortionStatus,
    collectRentPayment,
    totalUtilitiesElectricGas,
    totalSolarRent,
  } = useFinance();

  const [selectedPortion, setSelectedPortion] = useState<Portion | null>(null);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);

  // Collection modal state (ALL FIELDS EMPTY initially as requested)
  const [monthlyRent, setMonthlyRent] = useState<string>('');
  const [collectDate, setCollectDate] = useState<string>('');
  const [electricBill, setElectricBill] = useState<string>('');
  const [gasBill, setGasBill] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  // Open modal with monthly rent pre-filled, today's date auto-selected, and gas, bijli, remarks empty
  const handleOpenCollectModal = (portion: Portion) => {
    setSelectedPortion(portion);
    setMonthlyRent(portion.monthlyRent ? String(portion.monthlyRent) : '');
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setCollectDate(todayStr);
    setElectricBill('');
    setGasBill('');
    setRemarks('');
    setIsCollectModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCollectModalOpen(false);
    setSelectedPortion(null);
  };

  const handleConfirmCollection = () => {
    if (!selectedPortion) return;

    collectRentPayment(selectedPortion.id, {
      monthlyRent: monthlyRent ? Number(monthlyRent) : undefined,
      paymentDate: collectDate,
      electricBill: electricBill ? Number(electricBill) : 0,
      gasBill: gasBill ? Number(gasBill) : 0,
      notes: remarks,
    });

    handleCloseModal();
  };

  const formatPKR = (amt: number) => `Rs ${amt.toLocaleString()}`;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] mb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-50">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight">
            Rent Collection (Portions)
          </h2>
          <span className="text-[11px] text-slate-400 font-normal">
            Monthly rental collection tracker
          </span>
        </div>
      </div>

      {/* Table */}
      {portions.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 font-medium">
          No rental portions added yet. Go to <a href="/rental" className="text-emerald-600 font-semibold underline">Rental Portions</a> to add your units.
        </div>
      ) : (
        <div className="divide-y divide-slate-100/90">
          {portions.map((portion) => {
            const isPaid = portion.status === 'Paid';

            return (
              <div
                key={portion.id}
                className="py-4 flex items-center justify-between first:pt-2 last:pb-1"
              >
                {/* Property & Tenant */}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 leading-snug">
                    {portion.name}
                  </div>
                  <div className="text-xs text-slate-500 font-normal mt-0.5">
                    Tenant: {portion.tenantName || 'Unassigned'}
                  </div>
                </div>

                {/* Amount */}
                <div className="px-5 text-right">
                  <div className="text-sm font-semibold text-slate-900">
                    {formatPKR(portion.monthlyRent)}
                  </div>
                </div>

                {/* Action Buttons: Dedicated "Collect Rent" Button + Status Pill */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenCollectModal(portion)}
                    title="Collect / Record Monthly Rent"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-2xs ${isPaid
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Collect Rent</span>
                  </button>

                  {/* 1-Click Status Pill (Paid <-> Pending) */}
                  <button
                    type="button"
                    onClick={() => togglePortionStatus(portion.id)}
                    title="Click to toggle status (Paid / Pending)"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-150 active:scale-95 border ${isPaid
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                      }`}
                  >
                    {portion.status}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subtext Bottom Note */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 text-xs text-slate-500 font-medium flex items-center justify-between">
        <span>
          Utilities Split (Electricity/Gas): {formatPKR(totalUtilitiesElectricGas)} (Pass-through • Excluded from Income/Expenses)
        </span>
      </div>

      {/* Rent Collection Modal with ALL FIELDS EMPTY: Monthly Rent, Collect Date, Bijli bill, Gas bill, remarks */}
      <Dialog
        open={isCollectModalOpen}
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
          <div>
            <span>Rent Collection — {selectedPortion?.name}</span>
            <span className="block text-xs font-normal text-slate-500 mt-0.5">
              Tenant: {selectedPortion?.tenantName}
            </span>
          </div>
          <button
            onClick={handleCloseModal}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogTitle>

        <DialogContent className="pt-4 space-y-3.5">
          {/* Note explaining gas & electric bills are pass-through */}
          {/* <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/70 text-xs text-amber-900 leading-relaxed">
            <strong>Pass-Through Utilities:</strong> Gas aur Bijli bills income ya expense me shamil nahi hotay (ye just divide hotay hain), lekin record me rehtay hain taake hisab mehfooz rahe.
          </div> */}

          {/* 1. Monthly Rent */}
          <div className='pt-4'>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Monthly Rent (PKR)
            </label>
            <TextField
              size="small"
              fullWidth
              type="number"
              placeholder="Enter monthly rent"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
            />
          </div>

          {/* 2. Collect Date (date field) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Collect Date
            </label>
            <TextField
              size="small"
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              value={collectDate}
              onChange={(e) => setCollectDate(e.target.value)}
            />
          </div>

          {/* 3. Bijli bill & 4. Gas bill */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Bijli bill (PKR)
              </label>
              <TextField
                size="small"
                fullWidth
                type="number"
                placeholder="Enter bijli bill"
                value={electricBill}
                onChange={(e) => setElectricBill(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Gas bill (PKR)
              </label>
              <TextField
                size="small"
                fullWidth
                type="number"
                placeholder="Enter gas bill"
                value={gasBill}
                onChange={(e) => setGasBill(e.target.value)}
              />
            </div>
          </div>

          {/* 5. Remarks */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Remarks
            </label>
            <TextField
              size="small"
              fullWidth
              placeholder="e.g. Paid in cash / online transfer"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
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
            onClick={handleConfirmCollection}
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
            Record & Update Ledger
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
