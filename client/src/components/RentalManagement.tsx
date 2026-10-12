'use client';

import React, { useState } from 'react';
import {
  Building2,
  User,
  Phone,
  Zap,
  Flame,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Chip,
} from '@mui/material';

export interface PortionUnit {
  id: string;
  portionName: string;
  unitCode: string;
  baseMonthlyRent: number;
  isOccupied: boolean;
  tenant?: {
    name: string;
    phone: string;
    securityDeposit: number;
    agreementStartDate: string;
  };
  currentBill: {
    month: string;
    baseRent: number;
    electricUnits: number;
    electricTotal: number;
    gasCharge: number;
    maintenanceCharge: number;
    totalAmount: number;
    amountPaid: number;
    balanceRemaining: number;
    status: 'Paid' | 'Partially Paid' | 'Pending';
    lastReceiptDate?: string;
  };
}

interface RentalManagementProps {
  portions: PortionUnit[];
  onCollectRent: (data: any) => void;
}

export const RentalManagement: React.FC<RentalManagementProps> = ({
  portions,
  onCollectRent,
}) => {
  const [selectedPortion, setSelectedPortion] = useState<PortionUnit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Collect Rent Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer');
  const [electricUnits, setElectricUnits] = useState<number>(0);
  const [electricRate, setElectricRate] = useState<number>(48);
  const [gasCharge, setGasCharge] = useState<number>(1500);
  const [maintenance, setMaintenance] = useState<number>(2000);
  const [notes, setNotes] = useState<string>('');

  const handleOpenCollectModal = (portion: PortionUnit) => {
    setSelectedPortion(portion);
    setPaymentAmount(portion.currentBill.balanceRemaining || portion.baseMonthlyRent);
    setElectricUnits(portion.currentBill.electricUnits || 150);
    setGasCharge(portion.currentBill.gasCharge || 1500);
    setMaintenance(portion.currentBill.maintenanceCharge || 2000);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPortion(null);
  };

  const handleSubmitCollection = () => {
    if (!selectedPortion) return;
    const computedElectric = electricUnits * electricRate;
    onCollectRent({
      portionId: selectedPortion.id,
      unitCode: selectedPortion.unitCode,
      tenantName: selectedPortion.tenant?.name,
      amountCollected: Number(paymentAmount),
      paymentMethod,
      electricUnits,
      electricTotal: computedElectric,
      gasCharge,
      maintenance,
      notes,
    });
    handleCloseModal();
  };

  const formatPKR = (amt: number) => `Rs ${amt.toLocaleString()}`;

  const getStatusChip = (status: 'Paid' | 'Partially Paid' | 'Pending') => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Paid
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/60">
            <Clock className="w-3 h-3 text-sky-600" />
            Partially Paid
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            Rental Portions & Unit Management
          </h2>
          <p className="text-xs text-slate-500">
            Sub-meter utility tracking, monthly invoicing, and tenant tenancy status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Add Property Portion
          </button>
        </div>
      </div>

      {/* Grid of Portions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portions.map((portion) => {
          const isVacant = !portion.isOccupied;

          return (
            <div
              key={portion.id}
              className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="p-5">
                {/* Portion Top Bar */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                        {portion.portionName}
                      </h3>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        Unit {portion.unitCode}
                      </span>
                    </div>
                  </div>
                  <div>
                    {isVacant ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        Vacant
                      </span>
                    ) : (
                      getStatusChip(portion.currentBill.status)
                    )}
                  </div>
                </div>

                {/* Tenant & Rent Meta */}
                {isVacant ? (
                  <div className="mt-6 py-6 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                    <p className="text-xs text-slate-500">No active tenant registered</p>
                    <button className="mt-2 text-xs font-semibold text-slate-900 underline hover:text-slate-600">
                      Assign New Tenant
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-800">
                          {portion.tenant?.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {portion.tenant?.phone}
                      </span>
                    </div>

                    {/* Breakdown metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg border border-slate-100 bg-white">
                        <span className="text-[10px] text-slate-400 block font-medium">Base Rent</span>
                        <span className="text-xs font-semibold text-slate-900">
                          {formatPKR(portion.baseMonthlyRent)}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg border border-slate-100 bg-white">
                        <span className="text-[10px] text-slate-400 block font-medium">
                          Electric Sub-meter
                        </span>
                        <span className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-500" />
                          {portion.currentBill.electricUnits} units (
                          {formatPKR(portion.currentBill.electricTotal)})
                        </span>
                      </div>
                    </div>

                    {/* Bill Total & Outstanding */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total Due (Oct 2026)</span>
                        <span className="font-semibold text-slate-900">
                          {formatPKR(portion.currentBill.totalAmount)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Balance Pending</span>
                        <span
                          className={`font-semibold ${
                            portion.currentBill.balanceRemaining > 0
                              ? 'text-rose-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {formatPKR(portion.currentBill.balanceRemaining)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Button */}
              {!isVacant && (
                <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => handleOpenCollectModal(portion)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 transition-colors shadow-xs"
                  >
                    Collect / Record Rent
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* "Collect Rent" Modern Modal Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
          },
        }}
      >
        <DialogTitle className="border-b border-slate-100 font-semibold text-slate-900 text-base">
          Rent Collection & Utility Reconciler
          <span className="block text-xs font-normal text-slate-500 mt-0.5">
            {selectedPortion?.portionName} — Tenant: {selectedPortion?.tenant?.name}
          </span>
        </DialogTitle>

        <DialogContent className="pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Sub-meter Units Consumed
              </label>
              <TextField
                type="number"
                size="small"
                fullWidth
                value={electricUnits}
                onChange={(e) => setElectricUnits(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Rate per Unit (PKR)
              </label>
              <TextField
                type="number"
                size="small"
                fullWidth
                value={electricRate}
                onChange={(e) => setElectricRate(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Gas Bill Split (PKR)
              </label>
              <TextField
                type="number"
                size="small"
                fullWidth
                value={gasCharge}
                onChange={(e) => setGasCharge(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Water / Maintenance (PKR)
              </label>
              <TextField
                type="number"
                size="small"
                fullWidth
                value={maintenance}
                onChange={(e) => setMaintenance(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Calculated Bill Total:</span>
              <p className="text-xs text-slate-400">
                Base Rent ({formatPKR(selectedPortion?.baseMonthlyRent || 0)}) + Utilities
              </p>
            </div>
            <div className="text-sm font-semibold text-slate-900">
              {formatPKR(
                (selectedPortion?.baseMonthlyRent || 0) +
                  electricUnits * electricRate +
                  gasCharge +
                  maintenance
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Amount Received (PKR)
              </label>
              <TextField
                type="number"
                size="small"
                fullWidth
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Payment Method
              </label>
              <TextField
                select
                size="small"
                fullWidth
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer (Meezan / HBL)</MenuItem>
                <MenuItem value="Online/EasyPaisa/JazzCash">EasyPaisa / JazzCash</MenuItem>
                <MenuItem value="Cheque">Cheque</MenuItem>
              </TextField>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Notes / Remarks</label>
            <TextField
              size="small"
              fullWidth
              placeholder="e.g. Received via online transfer, ref #8921"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </DialogContent>

        <DialogActions className="p-4 border-t border-slate-100">
          <Button onClick={handleCloseModal} size="small" style={{ color: '#64748B' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitCollection}
            variant="contained"
            size="small"
            style={{
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
            }}
          >
            Confirm & Feed into Primary Income
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
