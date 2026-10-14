'use client';

import React, { useState } from 'react';
import { useFinance, Portion } from '../context/FinanceContext';
import { TenantLedgerModal } from './TenantLedgerModal';
import {
  Plus,
  Pencil,
  Trash2,
  Receipt,
  Wallet,
  CheckCircle2,
  Clock,
  X,
  Zap,
  Flame,
  Sun,
  Shield,
  Phone,
} from 'lucide-react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Checkbox,
  FormControlLabel,
} from '@mui/material';

export const RentalPortionsView: React.FC = () => {
  const {
    portions,
    totalRentExpected,
    receivedThisMonth,
    pendingThisMonth,
    totalSecuritiesDeposited,
    togglePortionStatus,
    collectRentPayment,
    updatePortion,
    addPortion,
    deletePortion,
  } = useFinance();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [selectedPortion, setSelectedPortion] = useState<Portion | null>(null);

  // Edit Form State (ATTACHED PRE-FILLED VALUES as requested!)
  const [editName, setEditName] = useState('');
  const [editTenantName, setEditTenantName] = useState('');
  const [editTenantContact, setEditTenantContact] = useState('');
  const [editSecurityDeposit, setEditSecurityDeposit] = useState('');
  const [editMonthlyRent, setEditMonthlyRent] = useState('');
  const [editElectricBill, setEditElectricBill] = useState('');
  const [editGasBill, setEditGasBill] = useState('');
  const [editIsElectricIncluded, setEditIsElectricIncluded] = useState(false);
  const [editIsGasIncluded, setEditIsGasIncluded] = useState(false);
  const [editSolarRent, setEditSolarRent] = useState('');

  // Add Form State (EMPTY VALUES for new portion)
  const [addName, setAddName] = useState('');
  const [addTenantName, setAddTenantName] = useState('');
  const [addTenantContact, setAddTenantContact] = useState('');
  const [addSecurityDeposit, setAddSecurityDeposit] = useState('');
  const [addMonthlyRent, setAddMonthlyRent] = useState('');
  const [addElectricBill, setAddElectricBill] = useState('');
  const [addGasBill, setAddGasBill] = useState('');
  const [addIsElectricIncluded, setAddIsElectricIncluded] = useState(false);
  const [addIsGasIncluded, setAddIsGasIncluded] = useState(false);
  const [addSolarRent, setAddSolarRent] = useState('');

  // Collect Rent Modal State (EMPTY FIELDS as requested!)
  const [collectMonthlyRent, setCollectMonthlyRent] = useState('');
  const [collectDate, setCollectDate] = useState('');
  const [collectElectricBill, setCollectElectricBill] = useState('');
  const [collectGasBill, setCollectGasBill] = useState('');
  const [collectRemarks, setCollectRemarks] = useState('');

  const formatPKR = (amt: number) => `Rs ${amt.toLocaleString()}`;

  // Open Edit Modal with ATTACHED EXISTING VALUES
  const handleOpenEdit = (p: Portion) => {
    setSelectedPortion(p);
    setEditName(p.name);
    setEditTenantName(p.tenantName);
    setEditTenantContact(p.tenantContact);
    setEditSecurityDeposit(p.securityDeposit.toString());
    setEditMonthlyRent(p.monthlyRent.toString());
    setEditElectricBill(p.electricBill ? p.electricBill.toString() : '');
    setEditGasBill(p.gasBill ? p.gasBill.toString() : '');
    setEditIsElectricIncluded(Boolean(p.isElectricIncluded));
    setEditIsGasIncluded(Boolean(p.isGasIncluded));
    setEditSolarRent(p.solarRent ? p.solarRent.toString() : '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedPortion) return;

    updatePortion(selectedPortion.id, {
      name: editName.trim() || selectedPortion.name,
      tenantName: editTenantName.trim() || selectedPortion.tenantName,
      tenantContact: editTenantContact.trim() || selectedPortion.tenantContact,
      securityDeposit: editSecurityDeposit ? Number(editSecurityDeposit) : selectedPortion.securityDeposit,
      monthlyRent: editMonthlyRent ? Number(editMonthlyRent) : selectedPortion.monthlyRent,
      electricBill: editElectricBill ? Number(editElectricBill) : selectedPortion.electricBill,
      gasBill: editGasBill ? Number(editGasBill) : selectedPortion.gasBill,
      isElectricIncluded: editIsElectricIncluded,
      isGasIncluded: editIsGasIncluded,
      solarRent: editSolarRent ? Number(editSolarRent) : selectedPortion.solarRent,
    });

    setIsEditModalOpen(false);
  };

  // Open Add Modal (EMPTY FIELDS)
  const handleOpenAdd = () => {
    setAddName('');
    setAddTenantName('');
    setAddTenantContact('');
    setAddSecurityDeposit('');
    setAddMonthlyRent('');
    setAddElectricBill('');
    setAddGasBill('');
    setAddIsElectricIncluded(false);
    setAddIsGasIncluded(false);
    setAddSolarRent('');
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = () => {
    if (!addName.trim()) return;

    addPortion({
      name: addName.trim(),
      tenantName: addTenantName.trim(),
      tenantContact: addTenantContact.trim() || '0300-XXXXXXX',
      securityDeposit: addSecurityDeposit ? Number(addSecurityDeposit) : 0,
      monthlyRent: addMonthlyRent ? Number(addMonthlyRent) : 0,
      electricBill: addElectricBill ? Number(addElectricBill) : 0,
      gasBill: addGasBill ? Number(addGasBill) : 0,
      isElectricIncluded: addIsElectricIncluded,
      isGasIncluded: addIsGasIncluded,
      solarRent: addSolarRent ? Number(addSolarRent) : 0,
      status: 'Pending',
      lastReceivedDate: 'Pending for Oct',
    });

    setIsAddModalOpen(false);
  };

  // Open Collect Modal with monthly rent pre-filled, today's date auto-selected, and gas, bijli, remarks empty
  const handleOpenCollect = (p: Portion) => {
    setSelectedPortion(p);
    setCollectMonthlyRent(p.monthlyRent ? String(p.monthlyRent) : '');
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setCollectDate(todayStr);
    setCollectElectricBill('');
    setCollectGasBill('');
    setCollectRemarks('');
    setIsCollectModalOpen(true);
  };

  const handleConfirmCollect = () => {
    if (!selectedPortion) return;

    collectRentPayment(selectedPortion.id, {
      monthlyRent: collectMonthlyRent ? Number(collectMonthlyRent) : undefined,
      paymentDate: collectDate,
      electricBill: collectElectricBill ? Number(collectElectricBill) : 0,
      gasBill: collectGasBill ? Number(collectGasBill) : 0,
      notes: collectRemarks,
    });

    setIsCollectModalOpen(false);
  };

  // Open Ledger Modal
  const handleOpenLedger = (p: Portion) => {
    setSelectedPortion(p);
    setIsLedgerModalOpen(true);
  };

  const paidCount = portions.filter((p) => p.status === 'Paid').length;
  const pendingCount = portions.filter((p) => p.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* 1. Header with Exact Title & Add Button from Screenshot */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
            Rental Portions (Kiraaye ka Hisab)
          </h1>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200/90 text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4 text-slate-500" />
          <span>Add New Portion/Tenant</span>
        </button>
      </div>

      {/* 2. Top 4 KPI Cards matching Screenshot Exactly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Monthly Rent */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <span className="text-xs font-medium text-slate-500 block">
            Total Monthly Rent
          </span>
          <div className="text-[25px] font-bold tracking-tight text-slate-900 my-1">
            {formatPKR(totalRentExpected)}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {portions.length > 0 ? `${portions.length} Units Total` : '0 Units Added'}
          </div>
        </div>

        {/* Card 2: Received This Month */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <span className="text-xs font-medium text-slate-500 block">
            Received This Month
          </span>
          <div className="text-[25px] font-bold tracking-tight text-slate-900 my-1">
            {formatPKR(receivedThisMonth)}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {paidCount} Portions paid
          </div>
        </div>

        {/* Card 3: Pending This Month */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <span className="text-xs font-medium text-slate-500 block">
            Pending This Month
          </span>
          <div className="text-[25px] font-bold tracking-tight text-slate-900 my-1">
            {formatPKR(pendingThisMonth)}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {pendingCount} {pendingCount === 1 ? 'Portion' : 'Portions'} pending
          </div>
        </div>

        {/* Card 4: Securities Deposited */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <span className="text-xs font-medium text-slate-500 block">
            Securities Deposited
          </span>
          <div className="text-[25px] font-bold tracking-tight text-slate-900 my-1">
            {formatPKR(totalSecuritiesDeposited)}
          </div>
          <div className="text-xs text-emerald-600 font-semibold">
            Security Guarantee Held
          </div>
        </div>
      </div>

      {/* 3. Main Card: Portions & Tenants */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6">
        <h2 className="text-[15px] font-bold text-slate-900 pb-5 border-b border-slate-100">
          Portions & Tenants
        </h2>

        {/* Render each portion section matching screenshot */}
        {portions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-600 font-medium text-sm">No rental portions added yet.</p>
            <p className="text-slate-400 text-xs mt-1">Click "Add New Portion/Tenant" above to add your first portion.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 space-y-6">
            {portions.map((portion) => {
              const isPaid = portion.status === 'Paid';
              const totalUtil = portion.electricBill + portion.gasBill;

              return (
                <div key={portion.id} className="pt-6 first:pt-4">
                  {/* Portion Title Header & Action Icons */}
                  <div className="flex items-center justify-between pb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      {portion.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {/* Pencil Edit button opening attached value modal */}
                      <button
                        onClick={() => handleOpenEdit(portion)}
                        className="text-slate-400 hover:text-slate-800 transition-colors p-1.5 rounded-lg hover:bg-slate-50"
                        title="Edit Portion & Values (Attached pre-filled)"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {/* Delete button */}
                      <button
                        onClick={() => deletePortion(portion.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50"
                        title="Delete Portion"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Portion Table matching screenshot columns */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5 px-3">Tenant</th>
                          <th className="py-2.5 px-3">Security Deposit</th>
                          <th className="py-2.5 px-3">Monthly Rent</th>
                          {/* <th className="py-2.5 px-3">Utilities (Electricity/Gas)</th> */}
                          <th className="py-2.5 px-3 text-center">Payment Status</th>
                          <th className="py-2.5 px-3">Last Received</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs text-slate-700 font-medium">
                        <tr>
                          {/* Tenant Name & Contact */}
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900">
                              Tenant: {portion.tenantName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal">
                              Contact: {portion.tenantContact}
                            </div>
                          </td>

                          {/* Security Deposit */}
                          <td className="py-3 px-3 text-slate-800 font-semibold">
                            {formatPKR(portion.securityDeposit)}
                          </td>

                          {/* Monthly Rent */}
                          <td className="py-3 px-3 text-slate-900 font-bold">
                            {formatPKR(portion.monthlyRent)}
                          </td>

                          {/* Utilities */}
                          {/* <td className="py-3 px-3">
                            <div className="space-y-1">
                              <div>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${portion.isElectricIncluded
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-50 text-slate-700 border-slate-200'
                                    }`}
                                >
                                  Bijli: {portion.isElectricIncluded ? 'Included in Rent' : `Excluded (${formatPKR(portion.electricBill || 0)})`}
                                </span>
                              </div>
                              <div>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${portion.isGasIncluded
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-50 text-slate-700 border-slate-200'
                                    }`}
                                >
                                  Gas: {portion.isGasIncluded ? 'Included in Rent' : `Excluded (${formatPKR(portion.gasBill || 0)})`}
                                </span>
                              </div>
                            </div>
                          </td> */}

                          {/* Payment Status Pill (Clickable) */}
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => togglePortionStatus(portion.id)}
                              title="Click to toggle status"
                              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all border ${isPaid
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                }`}
                            >
                              {portion.status}
                            </button>
                          </td>

                          {/* Last Received */}
                          <td className="py-3 px-3 text-slate-600">
                            {portion.lastReceivedDate}
                          </td>

                          {/* Actions: View Ledger + Collect Rent Button */}
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center gap-2">
                              {/* View Ledger Button */}
                              <button
                                onClick={() => handleOpenLedger(portion)}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs"
                              >
                                View
                              </button>

                              {/* Collect Rent Button */}
                              {!isPaid && (
                                <button
                                  onClick={() => handleOpenCollect(portion)}
                                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
                                >
                                  Collect
                                </button>
                              )}

                              {isPaid && (
                                <button
                                  onClick={() => handleOpenCollect(portion)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
                                >
                                  Record Split
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Edit Modal with Checkboxes for Bijli & Gas Bill (Checked = Included in Rent, Unchecked = Excluded) */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '24px',
            border: '1px solid #E2E8F0',
            fontFamily: 'Poppins, sans-serif',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
          },
        }}
      >
        <DialogTitle className="text-[15px] font-bold text-slate-900 border-b border-slate-100 flex items-center justify-between py-4">
          <span>Edit — {selectedPortion?.name}</span>
          <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </DialogTitle>

        <DialogContent className="pt-4 space-y-3.5">
          <TextField
            size="small"
            fullWidth
            label="Portion Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <TextField
              size="small"
              fullWidth
              label="Tenant Name"
              value={editTenantName}
              onChange={(e) => setEditTenantName(e.target.value)}
            />
            <TextField
              size="small"
              fullWidth
              label="Contact Phone"
              value={editTenantContact}
              onChange={(e) => setEditTenantContact(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextField
              size="small"
              fullWidth
              type="number"
              label="Monthly Rent (PKR)"
              value={editMonthlyRent}
              onChange={(e) => setEditMonthlyRent(e.target.value)}
            />
            <TextField
              size="small"
              fullWidth
              type="number"
              label="Security Deposit"
              value={editSecurityDeposit}
              onChange={(e) => setEditSecurityDeposit(e.target.value)}
            />
          </div>

          {/* Checkboxes: Gas Bill & Bijli Bill (Checked = Included, Unchecked = Excluded) */}
          <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-100 space-y-2">
            {/* <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Utilities in Rent (Checked = Included • Unchecked = Excluded):
            </span> */}
            <div className="grid grid-cols-2 gap-2.5">
              <div
                className={`p-2.5 rounded-xl border transition-all ${editIsElectricIncluded
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-white border-slate-200'
                  }`}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={editIsElectricIncluded}
                      onChange={(e) => setEditIsElectricIncluded(e.target.checked)}
                      sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#059669' }, p: 0.5 }}
                    />
                  }
                  label={
                    <div className="ml-1">
                      <span className="text-xs font-bold text-slate-800 block">Bijli Bill</span>
                      <span
                        className={`text-[10px] font-semibold block ${editIsElectricIncluded ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                      >
                        {editIsElectricIncluded ? '✓ Included in rent' : '✗ Excluded'}
                      </span>
                    </div>
                  }
                  sx={{ m: 0, width: '100%' }}
                />
              </div>

              <div
                className={`p-2.5 rounded-xl border transition-all ${editIsGasIncluded
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-white border-slate-200'
                  }`}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={editIsGasIncluded}
                      onChange={(e) => setEditIsGasIncluded(e.target.checked)}
                      sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#059669' }, p: 0.5 }}
                    />
                  }
                  label={
                    <div className="ml-1">
                      <span className="text-xs font-bold text-slate-800 block">Gas Bill</span>
                      <span
                        className={`text-[10px] font-semibold block ${editIsGasIncluded ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                      >
                        {editIsGasIncluded ? '✓ Included in rent' : '✗ Excluded'}
                      </span>
                    </div>
                  }
                  sx={{ m: 0, width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* <div className="grid grid-cols-2 gap-3">
            <TextField
              size="small"
              fullWidth
              type="number"
              label="Bijli Bill (PKR)"
              placeholder={editIsElectricIncluded ? "Included in rent" : "e.g. 3400"}
              value={editElectricBill}
              onChange={(e) => setEditElectricBill(e.target.value)}
            />
            <TextField
              size="small"
              fullWidth
              type="number"
              label="Gas Bill (PKR)"
              placeholder={editIsGasIncluded ? "Included in rent" : "e.g. 1800"}
              value={editGasBill}
              onChange={(e) => setEditGasBill(e.target.value)}
            />
          </div> */}

          <TextField
            size="small"
            fullWidth
            type="number"
            label="Solar Rent / Charges"
            value={editSolarRent}
            onChange={(e) => setEditSolarRent(e.target.value)}
          />
        </DialogContent>

        <DialogActions className="p-4 border-t border-slate-100 flex justify-end gap-2.5">
          <Button onClick={() => setIsEditModalOpen(false)} style={{ color: '#64748B', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            style={{
              backgroundColor: '#0F172A',
              color: '#fff',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* 5. Add New Portion Modal with Checkboxes for Bijli & Gas Bill (Checked = Included in Rent, Unchecked = Excluded) */}
      <Dialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '24px',
            border: '1px solid #E2E8F0',
            fontFamily: 'Poppins, sans-serif',
          },
        }}
      >
        <DialogTitle className="text-[15px] font-bold text-slate-900 border-b border-slate-100 flex items-center justify-between py-4">
          <span>Add New Portion / Tenant</span>
          <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </DialogTitle>

        <DialogContent className="pt-4 space-y-3.5">
          <TextField
            size="small"
            fullWidth
            label="Portion Name"
            placeholder="e.g. Ground Floor, 2nd Floor"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <TextField
              size="small"
              fullWidth
              label="Tenant Name"
              placeholder="e.g. Naveed Ahmad"
              value={addTenantName}
              onChange={(e) => setAddTenantName(e.target.value)}
            />
            <TextField
              size="small"
              fullWidth
              label="Contact Phone"
              placeholder="e.g. 0300-XXXXXXX"
              value={addTenantContact}
              onChange={(e) => setAddTenantContact(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextField
              size="small"
              fullWidth
              type="number"
              label="Monthly Rent"
              placeholder="e.g. 90000"
              value={addMonthlyRent}
              onChange={(e) => setAddMonthlyRent(e.target.value)}
            />
            <TextField
              size="small"
              fullWidth
              type="number"
              label="Security Deposit"
              placeholder="e.g. 180000"
              value={addSecurityDeposit}
              onChange={(e) => setAddSecurityDeposit(e.target.value)}
            />
          </div>

          {/* Checkboxes: Gas Bill & Bijli Bill in Add Modal (Checked = Included, Unchecked = Excluded) */}
          <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-100 space-y-2">
            {/* <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Utilities in Rent (Checked = Included • Unchecked = Excluded):
            </span> */}
            <div className="grid grid-cols-2 gap-2.5">
              <div
                className={`p-2.5 rounded-xl border transition-all ${addIsElectricIncluded
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-white border-slate-200'
                  }`}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={addIsElectricIncluded}
                      onChange={(e) => setAddIsElectricIncluded(e.target.checked)}
                      sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#059669' }, p: 0.5 }}
                    />
                  }
                  label={
                    <div className="ml-1">
                      <span className="text-xs font-bold text-slate-800 block">Bijli Bill</span>
                      <span
                        className={`text-[10px] font-semibold block ${addIsElectricIncluded ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                      >
                        {addIsElectricIncluded ? '✓ Included in rent' : '✗ Excluded'}
                      </span>
                    </div>
                  }
                  sx={{ m: 0, width: '100%' }}
                />
              </div>

              <div
                className={`p-2.5 rounded-xl border transition-all ${addIsGasIncluded
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-white border-slate-200'
                  }`}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={addIsGasIncluded}
                      onChange={(e) => setAddIsGasIncluded(e.target.checked)}
                      sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#059669' }, p: 0.5 }}
                    />
                  }
                  label={
                    <div className="ml-1">
                      <span className="text-xs font-bold text-slate-800 block">Gas Bill</span>
                      <span
                        className={`text-[10px] font-semibold block ${addIsGasIncluded ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                      >
                        {addIsGasIncluded ? '✓ Included in rent' : '✗ Excluded'}
                      </span>
                    </div>
                  }
                  sx={{ m: 0, width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* <div className="grid grid-cols-2 gap-3">
            <TextField
              size="small"
              fullWidth
              type="number"
              label="Bijli Bill"
              placeholder={addIsElectricIncluded ? "Included in rent" : "e.g. 3400"}
              value={addElectricBill}
              onChange={(e) => setAddElectricBill(e.target.value)}
            />
            <TextField
              size="small"
              fullWidth
              type="number"
              label="Gas Bill"
              placeholder={addIsGasIncluded ? "Included in rent" : "e.g. 1800"}
              value={addGasBill}
              onChange={(e) => setAddGasBill(e.target.value)}
            />
          </div> */}

          <TextField
            size="small"
            fullWidth
            type="number"
            label="Solar Rent"
            placeholder="e.g. 2000"
            value={addSolarRent}
            onChange={(e) => setAddSolarRent(e.target.value)}
          />
        </DialogContent>

        <DialogActions className="p-4 border-t border-slate-100">
          <Button onClick={() => setIsAddModalOpen(false)} style={{ color: '#64748B', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveAdd}
            variant="contained"
            style={{
              backgroundColor: '#0F172A',
              color: '#fff',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Create Portion
          </Button>
        </DialogActions>
      </Dialog>

      {/* 6. Collect Rent Modal (ALL FIELDS EMPTY as requested: Monthly Rent, Collect Date, Bijli bill, Gas bill, remarks) */}
      <Dialog
        open={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '24px',
            border: '1px solid #E2E8F0',
            fontFamily: 'Poppins, sans-serif',
          },
        }}
      >
        <DialogTitle className="text-[15px] font-bold text-slate-900 border-b border-slate-100 flex items-center justify-between py-4">
          <div>
            <span>Collect Rent — {selectedPortion?.name}</span>
            <span className="block text-xs font-normal text-slate-500 mt-0.5">
              Tenant: {selectedPortion?.tenantName}
            </span>
          </div>
          <button onClick={() => setIsCollectModalOpen(false)} className="text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </DialogTitle>

        <DialogContent className="pt-4 space-y-3.5">
          {/* <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
            <strong>Pass-Through Utilities:</strong> Gas aur Bijli bill income ya expense me shamil nahi hote kyun k ye split hote hain, lekin tenant ledger me record rehta hai.
          </div> */}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Monthly Rent (PKR)
            </label>
            <TextField
              size="small"
              fullWidth
              type="number"
              placeholder="Enter monthly rent amount"
              value={collectMonthlyRent}
              onChange={(e) => setCollectMonthlyRent(e.target.value)}
            />
          </div>

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
                value={collectElectricBill}
                onChange={(e) => setCollectElectricBill(e.target.value)}
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
                value={collectGasBill}
                onChange={(e) => setCollectGasBill(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Remarks
            </label>
            <TextField
              size="small"
              fullWidth
              placeholder="e.g. Paid in cash / Meezan bank online"
              value={collectRemarks}
              onChange={(e) => setCollectRemarks(e.target.value)}
            />
          </div>
        </DialogContent>

        <DialogActions className="p-4 border-t border-slate-100 flex justify-end gap-2.5">
          <Button onClick={() => setIsCollectModalOpen(false)} style={{ color: '#64748B', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmCollect}
            variant="contained"
            style={{
              backgroundColor: '#0F172A',
              color: '#fff',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Confirm & Log to Ledger
          </Button>
        </DialogActions>
      </Dialog>

      {/* 7. Dedicated Tenant Ledger / History Modal */}
      <TenantLedgerModal
        portion={selectedPortion}
        open={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
      />
    </div>
  );
};
