'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { X, AlertCircle, MapPin } from 'lucide-react';
import { CommitteeLocation } from '../../redux/types';

interface AddLocationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<CommitteeLocation, 'id'>) => void;
}

export const AddLocationModal: React.FC<AddLocationModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [phone, setPhone] = useState('');
  const [color, setColor] = useState<'blue' | 'green' | 'amber' | 'purple' | 'teal'>('blue');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    if (!name.trim()) {
      setError('Location / Group Name is required.');
      return;
    }

    onSave({
      name: name.trim(),
      organizerName: organizerName.trim() || undefined,
      phone: phone.trim() || undefined,
      color,
      notes: notes.trim() || undefined,
    });

    setName('');
    setOrganizerName('');
    setPhone('');
    setNotes('');
    setColor('blue');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
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
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Add New Location / Group</span>
        </div>
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

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Location Name <span className="text-rose-500">*</span>
          </label>
          <TextField
            size="small"
            fullWidth
            placeholder="e.g. Location 6 or Gulshan Committee"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Organizer / Contact Person
          </label>
          <TextField
            size="small"
            fullWidth
            placeholder="e.g. Haji Sb / Uncle Tariq"
            value={organizerName}
            onChange={(e) => setOrganizerName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Phone Number
          </label>
          <TextField
            size="small"
            fullWidth
            placeholder="e.g. 0300-1234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Color Theme */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Card Theme Color
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
                onClick={() => setColor(c.id as any)}
                className={`w-7 h-7 rounded-full ${c.bg} transition-all cursor-pointer flex items-center justify-center ${
                  color === c.id ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-80'
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Notes (Optional)
          </label>
          <TextField
            size="small"
            fullWidth
            placeholder="Address or special rules"
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
          Save Location
        </Button>
      </DialogActions>
    </Dialog>
  );
};
