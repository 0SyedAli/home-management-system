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
import { X, AlertCircle, Calendar, Plus, Award } from 'lucide-react';
import { CommitteeLocation, IndividualCommittee } from '../../redux/types';
import {
  calculateEndMonth,
  MONTH_NAMES,
  parseMonthYear,
  formatShortMonth,
} from '../../utils/committeeHelpers';

interface AddEditCommitteeModalProps {
  open: boolean;
  onClose: () => void;
  locations: CommitteeLocation[];
  onSave: (data: {
    id?: string;
    locationId: string;
    locationName: string;
    name: string;
    membersCount: number;
    sharePerMember: number;
    monthlyAmount: number;
    startMonth: string;
    durationMonths: number;
    endMonth?: string;
    notes?: string;
    color?: string;
    myCommitteeMonth?: string;
    payoutAmount?: number;
  }) => void;
  initialData?: IndividualCommittee | null;
  defaultLocationId?: string;
  onOpenAddLocation?: () => void;
}

export const AddEditCommitteeModal: React.FC<AddEditCommitteeModalProps> = ({
  open,
  onClose,
  locations,
  onSave,
  initialData,
  defaultLocationId,
  onOpenAddLocation,
}) => {
  const [name, setName] = useState('');
  const [locationId, setLocationId] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('20000');
  const [membersCount, setMembersCount] = useState('20');
  const [sharePerMember, setSharePerMember] = useState('1000');
  const [startMonth, setStartMonth] = useState('Oct 2026');
  const [durationMonths, setDurationMonths] = useState('12');
  const [myCommitteeMonth, setMyCommitteeMonth] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('blue');
  const [error, setError] = useState('');

  // Pre-fill on open or edit
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setLocationId(initialData.locationId);
      setMonthlyAmount(String(initialData.monthlyAmount));
      setMembersCount(String(initialData.membersCount || 20));
      setSharePerMember(String(initialData.sharePerMember || 1000));
      setStartMonth(initialData.startMonth);
      setDurationMonths(String(initialData.durationMonths));
      setMyCommitteeMonth(initialData.myCommitteeMonth || '');
      setPayoutAmount(
        initialData.payoutAmount
          ? String(initialData.payoutAmount)
          : String(initialData.monthlyAmount * initialData.durationMonths)
      );
      setNotes(initialData.notes || '');
      setColor(initialData.color || 'blue');
      setError('');
    } else {
      const now = new Date();
      const currentMonthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
      setName('');
      setLocationId(defaultLocationId || (locations[0]?.id ?? ''));
      setMonthlyAmount('20000');
      setMembersCount('20');
      setSharePerMember('1000');
      setStartMonth(currentMonthLabel);
      setDurationMonths('12');
      setMyCommitteeMonth('');
      setPayoutAmount(String(20000 * 12));
      setNotes('');
      setColor('blue');
      setError('');
    }
  }, [initialData, open, defaultLocationId, locations]);

  // When monthlyAmount or membersCount changes, auto update sharePerMember
  const handleMonthlyAmountChange = (val: string) => {
    setMonthlyAmount(val);
    const amt = Number(val) || 0;
    const mem = Number(membersCount) || 1;
    if (amt > 0 && mem > 0) {
      setSharePerMember(String(Math.round(amt / mem)));
    }
    const dur = Number(durationMonths) || 12;
    if (!payoutAmount || Number(payoutAmount) === amt * dur) {
      setPayoutAmount(String(amt * dur));
    }
  };

  const handleMembersCountChange = (val: string) => {
    setMembersCount(val);
    const amt = Number(monthlyAmount) || 0;
    const mem = Number(val) || 1;
    if (amt > 0 && mem > 0) {
      setSharePerMember(String(Math.round(amt / mem)));
    }
  };

  // Auto-calculated End Month
  const computedEndMonth = useMemo(() => {
    const dur = Number(durationMonths) || 1;
    return calculateEndMonth(startMonth, dur);
  }, [startMonth, durationMonths]);

  // Expected Total Value
  const expectedTotal = useMemo(() => {
    const amt = Number(monthlyAmount) || 0;
    const dur = Number(durationMonths) || 0;
    return amt * dur;
  }, [monthlyAmount, durationMonths]);

  // Dynamic Options for "My Committee Month (Payout Month)" based on schedule
  const payoutMonthOptions = useMemo(() => {
    const list: Array<{ label: string; value: string }> = [
      { label: 'Not Decided Yet', value: '' },
    ];
    const dur = Math.max(1, Math.min(60, Number(durationMonths) || 12));
    const { year, month } = parseMonthYear(startMonth);

    for (let i = 0; i < dur; i++) {
      const curTotal = month + i;
      const curYear = year + Math.floor(curTotal / 12);
      const curM = curTotal % 12;
      const mLabel = formatShortMonth(curYear, curM);
      list.push({
        label: `Month ${i + 1} (${mLabel})`,
        value: mLabel,
      });
    }

    return list;
  }, [startMonth, durationMonths]);

  const handleSubmit = () => {
    setError('');

    if (!name.trim()) {
      setError('Committee Name is required.');
      return;
    }
    if (!locationId) {
      setError('Please select or create a Location.');
      return;
    }
    const numAmount = Number(monthlyAmount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid monthly contribution amount.');
      return;
    }
    const numDuration = Number(durationMonths);
    if (!numDuration || numDuration <= 0) {
      setError('Duration in months must be greater than 0.');
      return;
    }

    const selectedLoc = locations.find((l) => l.id === locationId);
    const locName = selectedLoc ? selectedLoc.name : 'Location';

    onSave({
      id: initialData?.id,
      locationId,
      locationName: locName,
      name: name.trim(),
      membersCount: Number(membersCount) || 20,
      sharePerMember: Number(sharePerMember) || Math.round(numAmount / 20),
      monthlyAmount: numAmount,
      startMonth,
      durationMonths: numDuration,
      endMonth: computedEndMonth,
      notes: notes.trim(),
      color,
      myCommitteeMonth: myCommitteeMonth || undefined,
      payoutAmount: Number(payoutAmount) || (numAmount * numDuration),
    });

    onClose();
  };

  // Helper options for start months (2024 to 2030)
  const monthOptions = useMemo(() => {
    const options: string[] = [];
    const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
    years.forEach((y) => {
      MONTH_NAMES.forEach((m) => {
        options.push(`${m} ${y}`);
      });
    });
    return options;
  }, []);

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
        <span>{initialData ? 'Edit Committee Details' : 'Add New Committee'}</span>
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

        {/* Empty Locations Warning */}
        {locations.length === 0 && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
            <div>
              <strong>No locations found!</strong> You must create a location group first.
            </div>
            {onOpenAddLocation && (
              <button
                type="button"
                onClick={onOpenAddLocation}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-2xs cursor-pointer"
              >
                + Add Location Now
              </button>
            )}
          </div>
        )}

        {/* Committee Name & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Committee Name <span className="text-rose-500">*</span>
            </label>
            <TextField
              size="small"
              fullWidth
              placeholder="e.g. Committee 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Location / Group <span className="text-rose-500">*</span>
              </label>
              {onOpenAddLocation && (
                <button
                  type="button"
                  onClick={onOpenAddLocation}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  New Location
                </button>
              )}
            </div>
            <TextField
              select
              size="small"
              fullWidth
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
            >
              {locations.length === 0 ? (
                <MenuItem value="" disabled>
                  No locations available
                </MenuItem>
              ) : (
                locations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name} {loc.organizerName ? `(${loc.organizerName})` : ''}
                  </MenuItem>
                ))
              )}
            </TextField>
          </div>
        </div>

        {/* Monthly Contribution Amount & Members count */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Monthly Amount (PKR) <span className="text-rose-500">*</span>
            </label>
            <TextField
              size="small"
              fullWidth
              type="number"
              placeholder="e.g. 20000"
              value={monthlyAmount}
              onChange={(e) => handleMonthlyAmountChange(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Total Members
            </label>
            <TextField
              size="small"
              fullWidth
              type="number"
              placeholder="e.g. 20"
              value={membersCount}
              onChange={(e) => handleMembersCountChange(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Share / Member
            </label>
            <TextField
              size="small"
              fullWidth
              type="number"
              placeholder="e.g. 1000"
              value={sharePerMember}
              onChange={(e) => setSharePerMember(e.target.value)}
            />
          </div>
        </div>

        {/* Start Month, Duration & Auto-calculated End Month */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Start Month <span className="text-rose-500">*</span>
            </label>
            <TextField
              select
              size="small"
              fullWidth
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
            >
              {monthOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Duration (Months) <span className="text-rose-500">*</span>
            </label>
            <TextField
              size="small"
              fullWidth
              type="number"
              placeholder="e.g. 25"
              value={durationMonths}
              onChange={(e) => {
                setDurationMonths(e.target.value);
                const dur = Number(e.target.value) || 0;
                const amt = Number(monthlyAmount) || 0;
                setPayoutAmount(String(amt * dur));
              }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              End Month (Auto)
            </label>
            <div className="h-10 px-3.5 bg-slate-50 border border-slate-200/90 rounded-lg flex items-center text-xs font-semibold text-slate-700">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              <span>{computedEndMonth}</span>
            </div>
          </div>
        </div>

        {/* My Committee Month (Payout Month) & Expected Payout Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-gradient-to-r from-amber-50/70 to-orange-50/70 border border-amber-200/80 rounded-xl">
          <div>
            <label className="text-xs font-bold text-amber-900 block mb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>My Committee Month (Payout Turn)</span>
            </label>
            <TextField
              select
              size="small"
              fullWidth
              value={myCommitteeMonth}
              onChange={(e) => {
                setMyCommitteeMonth(e.target.value);
                if (!payoutAmount) {
                  setPayoutAmount(String(expectedTotal));
                }
              }}
            >
              {payoutMonthOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <span className="text-[10px] text-amber-700/90 block mt-1">
              Kis month aapki kameti khulegi / payout milega
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-amber-900 block mb-1">
              Expected Payout Amount (PKR)
            </label>
            <TextField
              size="small"
              fullWidth
              type="number"
              placeholder={`e.g. ${expectedTotal}`}
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
            />
            <span className="text-[10px] text-amber-700/90 block mt-1">
              Full committee pool payout amount
            </span>
          </div>
        </div>

        {/* Expected Total Value Card */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-900 font-medium block">
              Total Expected Contribution Value:
            </span>
            <span className="text-[11px] text-blue-700">
              Monthly Rs {Number(monthlyAmount || 0).toLocaleString()} × {durationMonths || 0} Months
            </span>
          </div>
          <div className="text-base font-bold text-blue-700">
            Rs. {expectedTotal.toLocaleString()}
          </div>
        </div>

        {/* Color / Theme Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Badge / Icon Color
          </label>
          <div className="flex items-center gap-3">
            {[
              { id: 'blue', label: 'Blue', bg: 'bg-blue-500' },
              { id: 'green', label: 'Green', bg: 'bg-emerald-500' },
              { id: 'amber', label: 'Amber', bg: 'bg-amber-500' },
              { id: 'purple', label: 'Purple', bg: 'bg-purple-500' },
              { id: 'teal', label: 'Teal', bg: 'bg-teal-500' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.id)}
                className={`w-7 h-7 rounded-full ${c.bg} transition-all cursor-pointer flex items-center justify-center ${
                  color === c.id ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-80'
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Notes / Remarks (Optional)
          </label>
          <TextField
            size="small"
            fullWidth
            placeholder="e.g. Organizer contact, payout rules, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
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
          className="text-xs normal-case rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-none px-5 py-2 font-semibold"
        >
          {initialData ? 'Update Committee' : 'Add Committee'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
