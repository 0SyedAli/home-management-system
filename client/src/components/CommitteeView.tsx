'use client';

import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Users,
  Plus,
  Coins,
  Calendar,
  Receipt,
  MapPin,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Info,
  MoreVertical,
  Search,
  Filter,
  Trash2,
  Edit2,
  CreditCard,
  Building2,
  Check,
  CalendarDays,
  History,
  TrendingUp,
  AlertCircle,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { Menu, MenuItem, IconButton, Tooltip } from '@mui/material';
import { AddEditCommitteeModal } from './CommitteeManagement/AddEditCommitteeModal';
import { AddLocationModal } from './CommitteeManagement/AddLocationModal';
import { RecordPaymentModal } from './CommitteeManagement/RecordPaymentModal';
import { CommitteeDetailDrawer } from './CommitteeManagement/CommitteeDetailDrawer';
import { IndividualCommittee, ScheduledInstallment, CommitteePaymentStatus } from '../redux/types';
import { MONTH_NAMES, formatShortMonth, getCommitteeCurrentMonthStatus } from '../utils/committeeHelpers';

export const CommitteeView: React.FC = () => {
  const {
    committeeLocations,
    individualCommittees,
    addCommitteeLocation,
    updateCommitteeLocation,
    deleteCommitteeLocation,
    addIndividualCommittee,
    updateIndividualCommittee,
    deleteIndividualCommittee,
    recordInstallmentPayment,
    bulkPayLocationCurrentMonth,
    totalLocationsCount,
    totalIndividualCommitteesCount,
    totalMonthlyCommitteesPool,
    totalAllCommitteesLifecycleValue,
  } = useFinance();

  // Active calendar month representation
  const currentMonthYear = useMemo(() => {
    const d = new Date();
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
    };
  }, []);

  // Active / Selected Location (safely handles empty locations)
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    committeeLocations[0]?.id || ''
  );

  // Sync selected location when locations change or load
  React.useEffect(() => {
    if (committeeLocations.length > 0) {
      if (!selectedLocationId || !committeeLocations.some((l) => l.id === selectedLocationId)) {
        setSelectedLocationId(committeeLocations[0].id);
      }
    } else {
      setSelectedLocationId('');
    }
  }, [committeeLocations, selectedLocationId]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Month selector for Section 9: Monthly Overview Dashboard (defaults to current month)
  const now = new Date();
  const [overviewYear, setOverviewYear] = useState<number>(now.getFullYear());
  const [overviewMonthIdx, setOverviewMonthIdx] = useState<number>(now.getMonth());

  const overviewMonthKey = `${overviewYear}-${String(overviewMonthIdx + 1).padStart(2, '0')}`;
  const overviewMonthLabel = formatShortMonth(overviewYear, overviewMonthIdx);

  const handlePrevMonth = () => {
    if (overviewMonthIdx === 0) {
      setOverviewMonthIdx(11);
      setOverviewYear((y) => y - 1);
    } else {
      setOverviewMonthIdx((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (overviewMonthIdx === 11) {
      setOverviewMonthIdx(0);
      setOverviewYear((y) => y + 1);
    } else {
      setOverviewMonthIdx((m) => m + 1);
    }
  };

  // Quick filter for Section 10: Recent Activity
  const [activityStatusFilter, setActivityStatusFilter] = useState<'All' | 'Paid' | 'Partially Paid' | 'Pending'>('All');
  const [activityPage, setActivityPage] = useState<number>(1);
  const [activityPageSize, setActivityPageSize] = useState<number>(5);

  const handleActivityFilterChange = (filter: 'All' | 'Paid' | 'Partially Paid' | 'Pending') => {
    setActivityStatusFilter(filter);
    setActivityPage(1);
  };

  // Modals & Drawer State
  const [isAddCommitteeOpen, setIsAddCommitteeOpen] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<IndividualCommittee | null>(null);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTargetCommitteeId, setPaymentTargetCommitteeId] = useState<string>('');
  const [paymentTargetInstallmentId, setPaymentTargetInstallmentId] = useState<string>('');
  const [detailDrawerCommittee, setDetailDrawerCommittee] = useState<IndividualCommittee | null>(null);

  // Action Menu State for Table Row
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuCommittee, setActiveMenuCommittee] = useState<IndividualCommittee | null>(null);

  const formatPKR = (amt: number) => `Rs. ${amt.toLocaleString()}`;

  // Currently Selected Location Object (null if 0 locations)
  const selectedLocation = useMemo(() => {
    if (committeeLocations.length === 0) return null;
    return (
      committeeLocations.find((l) => l.id === selectedLocationId) ||
      committeeLocations[0]
    );
  }, [committeeLocations, selectedLocationId]);

  // Committees belonging to the selected location
  const locationCommittees = useMemo(() => {
    if (!selectedLocation) return [];
    return individualCommittees.filter((c) => c.locationId === selectedLocation.id);
  }, [individualCommittees, selectedLocation]);

  // Location Stats
  const locationMonthlyTotal = useMemo(() => {
    return locationCommittees.reduce((sum, c) => sum + (c.monthlyAmount || 0), 0);
  }, [locationCommittees]);

  const locationPaidCommitteesCount = useMemo(() => {
    return locationCommittees.filter((c) => {
      const activeInst = c.installments.find((i) => i.monthKey === currentMonthYear.key);
      return activeInst ? activeInst.status === 'Paid' : c.status === 'Completed';
    }).length;
  }, [locationCommittees, currentMonthYear.key]);

  const locationPendingCommitteesCount = locationCommittees.length - locationPaidCommitteesCount;

  const locationTotalPaidThisCycle = useMemo(() => {
    // Sum of paid amounts in location's latest active installments (matches Rs. 60,000 in screenshot)
    return locationCommittees.reduce((sum, c) => {
      const activeInst = c.installments.find((i) => i.status === 'Paid') || c.installments[0];
      return sum + (activeInst?.amountPaid || 0);
    }, 0);
  }, [locationCommittees]);

  const locationPendingThisCycle = Math.max(0, locationMonthlyTotal - locationTotalPaidThisCycle);

  const locationProgressPercent = locationCommittees.length > 0
    ? Math.round((locationPaidCommitteesCount / locationCommittees.length) * 100)
    : 0;

  // Filtered committees for table
  const displayedCommittees = useMemo(() => {
    return locationCommittees.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.locationName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'All' || c.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [locationCommittees, searchQuery, statusFilter]);

  // Section 9: Active installments strictly for the selected month
  const overviewMonthInstallments = useMemo(() => {
    const list: Array<{
      committee: IndividualCommittee;
      installment: ScheduledInstallment;
    }> = [];

    individualCommittees.forEach((comm) => {
      const inst = comm.installments.find(
        (i) => i.monthKey === overviewMonthKey || i.monthYear.toLowerCase() === overviewMonthLabel.toLowerCase()
      );
      if (inst) {
        list.push({ committee: comm, installment: inst });
      }
    });

    return list;
  }, [individualCommittees, overviewMonthKey, overviewMonthLabel]);

  const monthTotalDue = useMemo(() => {
    return overviewMonthInstallments.reduce((sum, item) => sum + item.installment.amountDue, 0);
  }, [overviewMonthInstallments]);

  const monthTotalPaid = useMemo(() => {
    return overviewMonthInstallments.reduce((sum, item) => sum + item.installment.amountPaid, 0);
  }, [overviewMonthInstallments]);

  const monthTotalOutstanding = Math.max(0, monthTotalDue - monthTotalPaid);

  const monthFullyPaidCount = useMemo(() => {
    return overviewMonthInstallments.filter((item) => item.installment.status === 'Paid').length;
  }, [overviewMonthInstallments]);

  const monthPartiallyPaidCount = useMemo(() => {
    return overviewMonthInstallments.filter((item) => item.installment.status === 'Partially Paid').length;
  }, [overviewMonthInstallments]);

  const monthPendingCount = useMemo(() => {
    return overviewMonthInstallments.filter((item) => item.installment.status === 'Pending').length;
  }, [overviewMonthInstallments]);

  const monthPaymentProgressPercent = monthTotalDue > 0
    ? Math.min(100, Math.round((monthTotalPaid / monthTotalDue) * 100))
    : 0;

  // Section 10: Recent Activity list with sorting & filtering
  const recentActivities = useMemo(() => {
    const list: Array<{
      id: string;
      committeeId: string;
      committeeName: string;
      locationName: string;
      monthYear: string;
      amountPaid: number;
      paymentDate: string;
      paymentMethod: string;
      notes?: string;
      remainingDue: number;
      status: CommitteePaymentStatus;
    }> = [];

    individualCommittees.forEach((comm) => {
      comm.installments.forEach((inst) => {
        if (inst.transactions && inst.transactions.length > 0) {
          inst.transactions.forEach((tx) => {
            list.push({
              id: tx.id,
              committeeId: comm.id,
              committeeName: comm.name,
              locationName: comm.locationName,
              monthYear: inst.monthYear,
              amountPaid: tx.amount,
              paymentDate: tx.paymentDate,
              paymentMethod: tx.paymentMethod || 'Cash',
              notes: tx.notes,
              remainingDue: inst.remainingDue,
              status: inst.status,
            });
          });
        }
      });
    });

    const sorted = list.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    if (activityStatusFilter === 'All') return sorted;
    return sorted.filter((item) => item.status === activityStatusFilter);
  }, [individualCommittees, activityStatusFilter]);

  // Paginated activities for Section 10
  const paginatedActivities = useMemo(() => {
    const start = (activityPage - 1) * activityPageSize;
    return recentActivities.slice(start, start + activityPageSize);
  }, [recentActivities, activityPage, activityPageSize]);

  const totalActivityPages = Math.max(1, Math.ceil(recentActivities.length / activityPageSize));

  // Helpers for table row colors
  const getBadgeColor = (colorId?: string) => {
    switch (colorId) {
      case 'green':
        return 'bg-emerald-500 text-white';
      case 'amber':
        return 'bg-amber-500 text-white';
      case 'purple':
        return 'bg-purple-500 text-white';
      case 'teal':
        return 'bg-teal-500 text-white';
      case 'blue':
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getLocationPinColor = (colorId?: string) => {
    switch (colorId) {
      case 'green':
        return 'text-emerald-500 bg-emerald-50';
      case 'amber':
        return 'text-amber-500 bg-amber-50';
      case 'purple':
        return 'text-purple-500 bg-purple-50';
      case 'teal':
        return 'text-teal-500 bg-teal-50';
      case 'blue':
      default:
        return 'text-blue-500 bg-blue-50';
    }
  };

  // Row Menu handlers
  const handleOpenRowMenu = (event: React.MouseEvent<HTMLElement>, comm: IndividualCommittee) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveMenuCommittee(comm);
  };

  const handleCloseRowMenu = () => {
    setMenuAnchorEl(null);
    setActiveMenuCommittee(null);
  };

  const handleRowMenuRecordPayment = () => {
    if (activeMenuCommittee) {
      setPaymentTargetCommitteeId(activeMenuCommittee.id);
      setPaymentTargetInstallmentId('');
      setIsPaymentModalOpen(true);
    }
    handleCloseRowMenu();
  };

  const handleRowMenuEdit = () => {
    if (activeMenuCommittee) {
      setEditingCommittee(activeMenuCommittee);
      setIsAddCommitteeOpen(true);
    }
    handleCloseRowMenu();
  };

  const handleRowMenuDelete = () => {
    if (activeMenuCommittee) {
      if (confirm(`Are you sure you want to delete ${activeMenuCommittee.name}?`)) {
        deleteIndividualCommittee(activeMenuCommittee.id);
      }
    }
    handleCloseRowMenu();
  };

  const handleBulkPayLocation = () => {
    if (!selectedLocation) return;
    if (
      confirm(
        `Mark all committees in "${selectedLocation.name}" as Completed/Paid for the current month (${currentMonthYear.label})?`
      )
    ) {
      bulkPayLocationCurrentMonth({
        locationId: selectedLocation.id,
        monthKey: currentMonthYear.key,
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Committee Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
              Manage your committees, track payments and keep everything organized across all locations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAddLocationOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>+ Add Location</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingCommittee(null);
              setIsAddCommitteeOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Committee</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Summary Cards (Exact Layout & Colors matching Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Locations */}
        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100/70 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Total Locations</span>
            <div className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              {totalLocationsCount}
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              Different places / groups
            </span>
          </div>
        </div>

        {/* Card 2: Total Committees */}
        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/70 flex items-center justify-center text-emerald-600 shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Total Committees</span>
            <div className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              {totalIndividualCommitteesCount}
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              Across all locations
            </span>
          </div>
        </div>

        {/* Card 3: Total Monthly Contribution */}
        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100/70 flex items-center justify-center text-amber-600 shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Total Monthly Contribution</span>
            <div className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              {formatPKR(totalMonthlyCommitteesPool)}
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              Per month commitment
            </span>
          </div>
        </div>

        {/* Card 4: Total Amount (All Committees) */}
        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100/70 flex items-center justify-center text-rose-500 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Total Expected Value</span>
            <div className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              {formatPKR(totalAllCommitteesLifecycleValue)}
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              (Pending + Paid lifecycle)
            </span>
          </div>
        </div>
      </div>

      {/* 3. All Locations Section */}
      <div className="bg-white border border-slate-100/90 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              All Locations ({committeeLocations.length})
            </h2>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              Click on a location to view its committees and details.
            </p>
          </div>
          {committeeLocations.length > 0 && (
            <button
              type="button"
              onClick={() => setIsAddLocationOpen(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              + Add Another Location
            </button>
          )}
        </div>

        {/* Location Cards Grid / Empty State */}
        {committeeLocations.length === 0 ? (
          <div className="py-10 px-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">No Locations Registered Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-0.5">
                Organize your committees by locations, organizers or groups (e.g., Office, Mohalla, Family).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddLocationOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Location</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {committeeLocations.map((loc) => {
              const isSelected = selectedLocation?.id === loc.id;
              const locComms = individualCommittees.filter((c) => c.locationId === loc.id);
              const locMonthly = locComms.reduce((sum, c) => sum + (c.monthlyAmount || 0), 0);
              const pinColorClasses = getLocationPinColor(loc.color);

              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocationId(loc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative select-none ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/25 ring-2 ring-blue-500/10 shadow-xs'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-xs'
                  }`}
                >
                  {/* Top: Pin Icon & Name & Arrow */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${pinColorClasses}`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">{loc.name}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`} />
                  </div>

                  {/* Number of Committees */}
                  <div className="text-[11px] text-slate-500 font-medium pl-9">
                    {locComms.length} Committees
                  </div>

                  {/* Monthly Contribution */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mt-2.5 pl-9">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatPKR(locMonthly)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Location Details and Individual Committees Section */}
      <div className="bg-white border border-slate-100/90 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
        {!selectedLocation ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Committee Locations Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              To get started, create a location (e.g. Organizer name, Family circle, or Area) and then add committees to it.
            </p>
            <button
              type="button"
              onClick={() => setIsAddLocationOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Location</span>
            </button>
          </div>
        ) : (
          <>
            {/* Location Header Row with Highlight Yellow Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {selectedLocation.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    {locationCommittees.length} Committees • Total Amount: {formatPKR(locationMonthlyTotal)}
                  </p>
                </div>
              </div>

              {/* Yellow Highlight Button as requested in Screenshot */}
              <div className="self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleBulkPayLocation}
                  title="Quickly record full payment for all committees in this location for current month"
                  className="px-4 py-2 rounded-xl bg-amber-300 hover:bg-amber-400 text-slate-900 text-xs font-bold border border-amber-400/90 shadow-2xs transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>All Paid (for this location)</span>
                </button>
              </div>
            </div>

            {/* 4 Location KPI Cards (Matching Image) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tile 1: Total Committees */}
              <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-2xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Total Committees</span>
                  <span className="text-xl font-bold text-slate-900">{locationCommittees.length}</span>
                </div>
              </div>

              {/* Tile 2: Total Paid */}
              <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-2xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Total Paid</span>
                  <div className="text-lg font-bold text-blue-700">
                    {formatPKR(locationTotalPaidThisCycle)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    ({locationPaidCommitteesCount} committees)
                  </span>
                </div>
              </div>

              {/* Tile 3: Pending */}
              <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-2xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Pending</span>
                  <div className="text-lg font-bold text-amber-600">
                    {formatPKR(locationPendingThisCycle)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    ({locationPendingCommitteesCount} committees)
                  </span>
                </div>
              </div>

              {/* Tile 4: Payment Progress */}
              <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[11px] font-medium text-slate-400">Payment Progress</span>
                  <span className="text-xs font-bold text-slate-800">{locationProgressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${locationProgressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1.5 text-right block">
                  ({locationPaidCommitteesCount} / {locationCommittees.length} paid)
                </span>
              </div>
            </div>

            {/* 5. Individual Committee Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold text-[11px] tracking-wide">
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4">Committee Name</th>
                    <th className="py-3 px-4">Monthly Amount</th>
                    <th className="py-3 px-4">Start Month</th>
                    <th className="py-3 px-4">End Month</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Paid / Total</th>
                    <th className="py-3 px-4">My Payout Month</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/90 text-slate-700">
                  {displayedCommittees.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-xs text-slate-400 font-medium">
                        No committees found in this location. Click "+ Add Committee" above to create one.
                      </td>
                    </tr>
                  ) : (
                    displayedCommittees.map((comm, idx) => {
                      const circleColorClass = getBadgeColor(comm.color);
                      const currentMonthStatus = getCommitteeCurrentMonthStatus(comm, currentMonthYear.key);
                      const isCompleted = currentMonthStatus === 'Completed';
                      const isPartial = currentMonthStatus === 'Partially Paid';
                      const isPending = currentMonthStatus === 'Pending';

                      return (
                        <tr
                          key={comm.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          {/* # Number Circle */}
                          <td className="py-4 px-4">
                            <div
                              className={`w-7 h-7 rounded-full ${circleColorClass} flex items-center justify-center font-bold text-xs shadow-2xs`}
                            >
                              {idx + 1}
                            </div>
                          </td>

                          {/* Committee Name */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-900 text-xs sm:text-[13px]">
                              {comm.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                              ({comm.membersCount} Members)
                            </div>
                          </td>

                          {/* Monthly Amount */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-900 text-xs sm:text-[13px]">
                              {formatPKR(comm.monthlyAmount)}
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                              ({comm.membersCount} × {comm.sharePerMember.toLocaleString()})
                            </div>
                          </td>

                          {/* Start Month */}
                          <td className="py-4 px-4 font-semibold text-slate-700">
                            {comm.startMonth}
                          </td>

                          {/* End Month */}
                          <td className="py-4 px-4 font-semibold text-slate-700">
                            {comm.endMonth}
                          </td>

                          {/* Duration */}
                          <td className="py-4 px-4 text-slate-600 font-medium">
                            {comm.durationMonths} months
                          </td>

                          {/* Paid / Total */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-900 text-xs">
                              {comm.paidMonthsCount} / {comm.durationMonths}
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                              (Rs. {comm.totalPaidAmount.toLocaleString()} / {comm.totalExpectedAmount.toLocaleString()})
                            </div>
                          </td>

                          {/* My Payout Month */}
                          <td className="py-4 px-4 font-semibold text-slate-700">
                            {comm.myCommitteeMonth ? (
                              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md text-[11px] font-bold">
                                <span>⭐ {comm.myCommitteeMonth}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </td>

                          {/* Status Badge (Completed when current month is paid) */}
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border ${
                                isCompleted
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : isPartial
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-600 border-rose-200'
                              }`}
                            >
                              {currentMonthStatus}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setDetailDrawerCommittee(comm)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                              >
                                View
                              </button>

                              <IconButton
                                size="small"
                                onClick={(e) => handleOpenRowMenu(e, comm)}
                                className="text-slate-400 hover:text-slate-700"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </IconButton>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 6. Info Callout Note (Exact sentence from Screenshot) */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center gap-2.5 text-xs text-blue-900 font-normal">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Note:</strong> Each committee can have its own start and end month. Payments are tracked individually for each committee, not by location.
              </span>
            </div>
          </>
        )}
      </div>

      {/* 5. Section 9: Monthly Overview Dashboard & Schedule Inspector */}
      <div className="bg-white border border-slate-100/90 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
        {/* Header with Month Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Monthly Overview Dashboard
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Inspect scheduled installments, track dues and spot pending payments for any selected month.
              </p>
            </div>
          </div>

          {/* Month Selector Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 p-1.5 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 py-1 bg-white rounded-lg border border-slate-200/60 text-xs font-bold text-slate-800 shadow-2xs min-w-[110px] text-center">
              {overviewMonthLabel}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setOverviewYear(now.getFullYear());
                setOverviewMonthIdx(now.getMonth());
              }}
              className="ml-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>

        {/* 4 Monthly KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Due */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Total Due ({overviewMonthLabel})</span>
              <div className="text-lg font-bold text-slate-900">{formatPKR(monthTotalDue)}</div>
              <span className="text-[10px] text-slate-400 font-medium block">
                {overviewMonthInstallments.length} active scheduled
              </span>
            </div>
          </div>

          {/* Card 2: Total Paid */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Total Paid</span>
              <div className="text-lg font-bold text-emerald-600">{formatPKR(monthTotalPaid)}</div>
              <span className="text-[10px] text-slate-400 font-medium block">
                {monthFullyPaidCount} fully paid committees
              </span>
            </div>
          </div>

          {/* Card 3: Total Outstanding */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Outstanding Balance</span>
              <div className="text-lg font-bold text-rose-600">{formatPKR(monthTotalOutstanding)}</div>
              <span className="text-[10px] text-slate-400 font-medium block">
                {monthPendingCount} pending • {monthPartiallyPaidCount} partial
              </span>
            </div>
          </div>

          {/* Card 4: Progress & Distribution */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[11px] font-medium text-slate-400">Month Progress</span>
              <span className="text-xs font-bold text-slate-800">{monthPaymentProgressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${monthPaymentProgressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mt-1.5">
              <span className="text-emerald-600 font-semibold">{monthFullyPaidCount} Paid</span>
              <span className="text-amber-600 font-semibold">{monthPartiallyPaidCount} Partial</span>
              <span className="text-rose-600 font-semibold">{monthPendingCount} Due</span>
            </div>
          </div>
        </div>

        {/* Scheduled Installments Table for Selected Month */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Scheduled Installments for {overviewMonthLabel} ({overviewMonthInstallments.length})
            </h4>
            <span className="text-[11px] text-slate-400">
              Only includes committees active during {overviewMonthLabel}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold text-[11px] tracking-wide">
                  <th className="py-3 px-4">Committee Name</th>
                  <th className="py-3 px-4">Location / Organizer</th>
                  <th className="py-3 px-4">Monthly Due</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Remaining Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/90 text-slate-700">
                {overviewMonthInstallments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-slate-400 font-medium">
                      No active committee installments scheduled for {overviewMonthLabel}.
                    </td>
                  </tr>
                ) : (
                  overviewMonthInstallments.map(({ committee, installment }) => {
                    const isPaid = installment.status === 'Paid';
                    const isPartial = installment.status === 'Partially Paid';

                    return (
                      <tr key={`${committee.id}-${installment.id}`} className="hover:bg-slate-50/70 transition-colors">
                        {/* Committee Name */}
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {committee.name}
                          <span className="block text-[11px] text-slate-400 font-normal">
                            Month {installment.monthIndex} of {committee.durationMonths}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px]">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {committee.locationName}
                          </span>
                        </td>

                        {/* Due */}
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {formatPKR(installment.amountDue)}
                        </td>

                        {/* Paid */}
                        <td className="py-3.5 px-4 font-semibold text-emerald-600">
                          {formatPKR(installment.amountPaid)}
                        </td>

                        {/* Remaining */}
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {formatPKR(installment.remainingDue)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isPartial
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-600 border-rose-200'
                            }`}
                          >
                            {installment.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!isPaid && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPaymentTargetCommitteeId(committee.id);
                                  setPaymentTargetInstallmentId(installment.id);
                                  setIsPaymentModalOpen(true);
                                }}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                              >
                                Pay Now
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setDetailDrawerCommittee(committee)}
                              className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. Section 10: Recent Payments & Activity */}
      <div className="bg-white border border-slate-100/90 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Recent Payment Activity
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Audit trail of recent kameti installments, transactions and payments.
              </p>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {(['All', 'Paid', 'Partially Paid', 'Pending'] as const).map((filterOpt) => (
              <button
                key={filterOpt}
                type="button"
                onClick={() => handleActivityFilterChange(filterOpt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activityStatusFilter === filterOpt
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {filterOpt}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold text-[11px] tracking-wide">
                <th className="py-3 px-4">Committee</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Month Covered</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Remaining Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/90 text-slate-700">
              {recentActivities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400 font-medium">
                    No recent payment records found for "{activityStatusFilter}".
                  </td>
                </tr>
              ) : (
                paginatedActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {act.committeeName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {act.locationName}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {act.monthYear}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      {formatPKR(act.amountPaid)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {act.paymentDate}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {formatPKR(act.remainingDue)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          act.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : act.status === 'Partially Paid'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-600 border-rose-200'
                        }`}
                      >
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {recentActivities.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span>
                Showing{' '}
                <strong className="text-slate-800 font-bold">
                  {(activityPage - 1) * activityPageSize + 1}
                </strong>{' '}
                to{' '}
                <strong className="text-slate-800 font-bold">
                  {Math.min(activityPage * activityPageSize, recentActivities.length)}
                </strong>{' '}
                of <strong className="text-slate-800 font-bold">{recentActivities.length}</strong> records
              </span>

              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="text-[11px] text-slate-400">Rows:</span>
                <select
                  value={activityPageSize}
                  onChange={(e) => {
                    setActivityPageSize(Number(e.target.value));
                    setActivityPage(1);
                  }}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                disabled={activityPage <= 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 text-xs font-semibold transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalActivityPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setActivityPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activityPage === pageNum
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActivityPage((p) => Math.min(totalActivityPages, p + 1))}
                disabled={activityPage >= totalActivityPages}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 text-xs font-semibold transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Row Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseRowMenu}
        PaperProps={{
          style: {
            borderRadius: '14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            fontFamily: 'Poppins, sans-serif',
          },
        }}
      >
        <MenuItem onClick={handleRowMenuRecordPayment} className="text-xs font-semibold text-slate-700 py-2">
          <CreditCard className="w-4 h-4 mr-2 text-emerald-600" />
          Record Payment
        </MenuItem>
        <MenuItem onClick={handleRowMenuEdit} className="text-xs font-semibold text-slate-700 py-2">
          <Edit2 className="w-4 h-4 mr-2 text-blue-600" />
          Edit Committee
        </MenuItem>
        <MenuItem onClick={handleRowMenuDelete} className="text-xs font-semibold text-rose-600 py-2">
          <Trash2 className="w-4 h-4 mr-2 text-rose-600" />
          Delete Committee
        </MenuItem>
      </Menu>

      {/* Modals & Drawers */}
      <AddEditCommitteeModal
        open={isAddCommitteeOpen}
        onClose={() => {
          setIsAddCommitteeOpen(false);
          setEditingCommittee(null);
        }}
        locations={committeeLocations}
        initialData={editingCommittee}
        defaultLocationId={selectedLocation ? selectedLocation.id : ''}
        onSave={(data) => {
          if (data.id) {
            updateIndividualCommittee(data.id, data);
          } else {
            addIndividualCommittee(data);
          }
        }}
        onOpenAddLocation={() => {
          setIsAddCommitteeOpen(false);
          setIsAddLocationOpen(true);
        }}
      />

      <AddLocationModal
        open={isAddLocationOpen}
        onClose={() => setIsAddLocationOpen(false)}
        onSave={(loc) => {
          addCommitteeLocation(loc);
        }}
      />

      <RecordPaymentModal
        open={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        committees={individualCommittees}
        selectedCommitteeId={paymentTargetCommitteeId}
        selectedInstallmentId={paymentTargetInstallmentId}
        onSavePayment={(pData) => {
          recordInstallmentPayment(pData);
        }}
      />

      <CommitteeDetailDrawer
        open={Boolean(detailDrawerCommittee)}
        onClose={() => setDetailDrawerCommittee(null)}
        committee={detailDrawerCommittee}
        onOpenRecordPayment={(cId, iId) => {
          setPaymentTargetCommitteeId(cId);
          setPaymentTargetInstallmentId(iId);
          setIsPaymentModalOpen(true);
        }}
        onOpenEditCommittee={(comm) => {
          setDetailDrawerCommittee(null);
          setEditingCommittee(comm);
          setIsAddCommitteeOpen(true);
        }}
      />
    </div>
  );
};
