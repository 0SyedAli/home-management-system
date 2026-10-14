import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Portion,
  CommitteeMember,
  CommitteePaymentRecord,
  ExpenseItem,
  InvestmentItem,
  TenantLedgerEntry,
  FinanceState,
  CommitteeLocation,
  IndividualCommittee,
  CommitteePaymentTransaction,
} from './types';
import {
  DEFAULT_LOCATIONS,
  createDefaultCommittees,
  recalculateCommittee,
  generateInstallments,
  calculateEndMonth,
} from '../utils/committeeHelpers';

const STORAGE_KEY = 'home_finance_state_v3';

const defaultPortions: Portion[] = [];
const defaultCommitteeMembers: CommitteeMember[] = [];
const defaultExpenses: ExpenseItem[] = [];
const defaultInvestments: InvestmentItem[] = [];

// Helper to save state to localStorage
const saveToLocalStorage = (state: FinanceState) => {
  if (typeof window !== 'undefined') {
    try {
      const serialized = JSON.stringify({
        householdName: state.householdName,
        fiscalMonth: state.fiscalMonth,
        salary: state.salary,
        portions: state.portions,
        committeeMembers: state.committeeMembers,
        committeeLocations: state.committeeLocations,
        individualCommittees: state.individualCommittees,
        expenses: state.expenses,
        investments: state.investments,
        lastSyncedAt: state.lastSyncedAt,
      });
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }
};

const defaultState: FinanceState = {
  householdName: 'Bait-ul-Maal',
  fiscalMonth: 'October 2026',
  salary: 0,
  portions: defaultPortions,
  committeeMembers: defaultCommitteeMembers,
  committeeLocations: DEFAULT_LOCATIONS,
  individualCommittees: createDefaultCommittees(),
  expenses: defaultExpenses,
  investments: defaultInvestments,
  isLoading: false,
  isApiConnected: false,
  lastSyncedAt: null,
};

export const financeSlice = createSlice({
  name: 'finance',
  initialState: defaultState,
  reducers: {
    rehydrateFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        try {
          // Clear any legacy dummy data stored under previous keys
          if (localStorage.getItem('home_finance_state_v1')) {
            localStorage.removeItem('home_finance_state_v1');
          }
          if (localStorage.getItem('home_finance_state_v2')) {
            localStorage.removeItem('home_finance_state_v2');
          }

          const cached = localStorage.getItem(STORAGE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.householdName) state.householdName = parsed.householdName;
            if (parsed.fiscalMonth) state.fiscalMonth = parsed.fiscalMonth;
            if (parsed.salary !== undefined) state.salary = parsed.salary;
            if (parsed.portions && Array.isArray(parsed.portions)) {
              state.portions = parsed.portions;
            }
            if (parsed.committeeMembers && Array.isArray(parsed.committeeMembers)) {
              const now = new Date();
              const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
              state.committeeMembers = parsed.committeeMembers.map((m: CommitteeMember) => {
                const history = m.paymentHistory || [];
                const currentRecord = history.find((p) => p.monthYear === currentMonthYear);
                return {
                  ...m,
                  status: currentRecord ? currentRecord.status : 'Pending',
                  paymentHistory: history,
                };
              });
            }
            if (parsed.committeeLocations && Array.isArray(parsed.committeeLocations)) {
              state.committeeLocations = parsed.committeeLocations;
            }
            if (parsed.individualCommittees && Array.isArray(parsed.individualCommittees)) {
              state.individualCommittees = parsed.individualCommittees;
            }
            if (parsed.expenses && Array.isArray(parsed.expenses)) {
              state.expenses = parsed.expenses;
            }
            if (parsed.investments && Array.isArray(parsed.investments)) {
              state.investments = parsed.investments;
            }
            if (parsed.lastSyncedAt) state.lastSyncedAt = parsed.lastSyncedAt;
          }
        } catch (e) {
          console.warn('Failed to parse cached finance state:', e);
        }
      }
    },
    resetToFreshState: (state) => {
      state.householdName = 'Bait-ul-Maal';
      state.fiscalMonth = 'October 2026';
      state.salary = 0;
      state.portions = [];
      state.committeeMembers = [];
      state.committeeLocations = DEFAULT_LOCATIONS;
      state.individualCommittees = createDefaultCommittees();
      state.expenses = [];
      state.investments = [];
      state.lastSyncedAt = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('home_finance_state_v1');
      }
    },
    setHouseholdName: (state, action: PayloadAction<string>) => {
      state.householdName = action.payload;
      saveToLocalStorage(state);
    },
    setFiscalMonth: (state, action: PayloadAction<string>) => {
      state.fiscalMonth = action.payload;
      saveToLocalStorage(state);
    },
    setSalary: (state, action: PayloadAction<number>) => {
      state.salary = action.payload;
      saveToLocalStorage(state);
    },

    // Portions
    togglePortionStatus: (state, action: PayloadAction<string>) => {
      const portionId = action.payload;
      const portion = state.portions.find((p) => p.id === portionId);
      if (portion) {
        const nextStatus = portion.status === 'Paid' ? 'Pending' : 'Paid';
        portion.status = nextStatus;
        portion.lastReceivedDate = nextStatus === 'Paid' ? 'Today' : 'Pending for Oct';

        if (portion.ledgerHistory.length > 0) {
          portion.ledgerHistory[0].status = nextStatus;
          portion.ledgerHistory[0].paidAmount = nextStatus === 'Paid' ? portion.ledgerHistory[0].totalDue : 0;
          portion.ledgerHistory[0].paymentDate = nextStatus === 'Paid' ? 'Today' : '—';
        }
      }
      saveToLocalStorage(state);
    },

    collectRentPayment: (
      state,
      action: PayloadAction<{
        portionId: string;
        monthlyRent?: number;
        amountCollected?: number;
        paymentMode?: string;
        paymentDate?: string;
        electricBill?: number;
        gasBill?: number;
        solarRent?: number;
        notes?: string;
      }>
    ) => {
      const { portionId, ...data } = action.payload;
      const portion = state.portions.find((p) => p.id === portionId);
      if (portion) {
        const rent = data.monthlyRent !== undefined && data.monthlyRent > 0 ? data.monthlyRent : portion.monthlyRent;
        const eBill = data.electricBill !== undefined ? data.electricBill : portion.electricBill;
        const gBill = data.gasBill !== undefined ? data.gasBill : portion.gasBill;
        const totalUtil = eBill + gBill;
        const totalDue = rent + totalUtil;
        const paidAmount = data.amountCollected !== undefined ? data.amountCollected : totalDue;
        const isFullPaid = paidAmount >= totalDue || rent > 0;

        let cycleLabel = 'Oct 2026';
        if (data.paymentDate && data.paymentDate !== 'Today') {
          try {
            const d = new Date(data.paymentDate);
            if (!isNaN(d.getTime())) {
              cycleLabel = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
            }
          } catch (_) {}
        }

        const newLedgerEntry: TenantLedgerEntry = {
          id: `lh-${Date.now()}`,
          monthYear: cycleLabel,
          baseRent: rent,
          electricBill: eBill,
          gasBill: gBill,
          utilities: totalUtil,
          totalDue,
          paidAmount,
          paymentDate: data.paymentDate || 'Today',
          paymentMode: data.paymentMode || 'Cash',
          status: isFullPaid ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Pending',
          receiptNote: data.notes,
        };

        const remainingLedger = portion.ledgerHistory.filter(
          (lh) => lh.monthYear.toLowerCase() !== cycleLabel.toLowerCase()
        );

        portion.status = isFullPaid ? 'Paid' : 'Pending';
        portion.monthlyRent = rent;
        portion.lastReceivedDate = data.paymentDate || 'Today';
        portion.electricBill = eBill;
        portion.gasBill = gBill;
        if (data.solarRent !== undefined) portion.solarRent = data.solarRent;
        portion.ledgerHistory = [newLedgerEntry, ...remainingLedger];
      }
      saveToLocalStorage(state);
    },

    updatePortion: (state, action: PayloadAction<{ id: string; data: Partial<Portion> }>) => {
      const index = state.portions.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.portions[index] = { ...state.portions[index], ...action.payload.data };
      }
      saveToLocalStorage(state);
    },

    addPortion: (state, action: PayloadAction<Omit<Portion, 'id' | 'ledgerHistory'>>) => {
      const newPortion = action.payload;
      const totalUtil = (newPortion.electricBill || 0) + (newPortion.gasBill || 0);
      const item: Portion = {
        ...newPortion,
        id: `p-${Date.now()}`,
        ledgerHistory: [
          {
            id: `lh-${Date.now()}`,
            monthYear: 'Oct 2026',
            baseRent: newPortion.monthlyRent,
            electricBill: newPortion.electricBill || 0,
            gasBill: newPortion.gasBill || 0,
            utilities: totalUtil,
            totalDue: newPortion.monthlyRent + totalUtil,
            paidAmount: newPortion.status === 'Paid' ? newPortion.monthlyRent + totalUtil : 0,
            paymentDate: newPortion.status === 'Paid' ? 'Today' : '—',
            paymentMode: newPortion.status === 'Paid' ? 'Cash' : 'Pending',
            status: newPortion.status,
          },
        ],
      };
      state.portions.push(item);
      saveToLocalStorage(state);
    },

    deletePortion: (state, action: PayloadAction<string>) => {
      state.portions = state.portions.filter((p) => p.id !== action.payload);
      saveToLocalStorage(state);
    },

    addLedgerEntry: (state, action: PayloadAction<{ portionId: string; entry: Omit<TenantLedgerEntry, 'id'> }>) => {
      const portion = state.portions.find((p) => p.id === action.payload.portionId);
      if (portion) {
        portion.ledgerHistory.unshift({
          ...action.payload.entry,
          id: `lh-${Date.now()}`,
        });
      }
      saveToLocalStorage(state);
    },

    // Committee Members
    toggleCommitteeStatus: (state, action: PayloadAction<string>) => {
      const member = state.committeeMembers.find((m) => m.id === action.payload || m._id === action.payload);
      if (member) {
        const nextStatus = member.status === 'Paid' ? 'Pending' : 'Paid';
        member.status = nextStatus;
        const paidAmt = nextStatus === 'Paid' ? member.monthlyInstallment : 0;
        const remDue = nextStatus === 'Paid' ? 0 : member.monthlyInstallment;
        member.currentMonthPaidAmount = paidAmt;
        member.currentMonthRemainingDue = remDue;

        const now = new Date();
        const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        if (!member.paymentHistory) {
          member.paymentHistory = [];
        }
        const recordIndex = member.paymentHistory.findIndex((p) => p.monthYear === currentMonthYear);
        if (recordIndex !== -1) {
          member.paymentHistory[recordIndex].status = nextStatus;
          member.paymentHistory[recordIndex].paidDate = nextStatus === 'Paid' ? now.toISOString().split('T')[0] : undefined;
          member.paymentHistory[recordIndex].amountPaid = paidAmt;
          member.paymentHistory[recordIndex].remainingDue = remDue;
        } else {
          member.paymentHistory.push({
            monthYear: currentMonthYear,
            status: nextStatus,
            paidDate: nextStatus === 'Paid' ? now.toISOString().split('T')[0] : undefined,
            amountPaid: paidAmt,
            remainingDue: remDue,
          });
        }
      }
      saveToLocalStorage(state);
    },

    recordCommitteePayment: (
      state,
      action: PayloadAction<{
        id: string;
        status?: 'Paid' | 'Partial' | 'Pending';
        amountPaid?: number;
        monthYear?: string;
        notes?: string;
      }>
    ) => {
      const { id, status, amountPaid, monthYear, notes } = action.payload;
      const member = state.committeeMembers.find((m) => m.id === id || m._id === id);
      if (member) {
        const now = new Date();
        const currentMonthYear = monthYear || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        let nextStatus: 'Paid' | 'Partial' | 'Pending' = 'Pending';
        let paidAmt = 0;
        let remDue = member.monthlyInstallment;

        if (amountPaid !== undefined) {
          paidAmt = Number(amountPaid) || 0;
          if (paidAmt >= member.monthlyInstallment) {
            nextStatus = 'Paid';
            paidAmt = member.monthlyInstallment;
            remDue = 0;
          } else if (paidAmt > 0) {
            nextStatus = 'Partial';
            remDue = Math.max(0, member.monthlyInstallment - paidAmt);
          } else {
            nextStatus = 'Pending';
            paidAmt = 0;
            remDue = member.monthlyInstallment;
          }
        } else if (status) {
          nextStatus = status;
          if (nextStatus === 'Paid') {
            paidAmt = member.monthlyInstallment;
            remDue = 0;
          } else if (nextStatus === 'Partial') {
            paidAmt = member.currentMonthPaidAmount || Math.round(member.monthlyInstallment / 2);
            remDue = Math.max(0, member.monthlyInstallment - paidAmt);
          } else {
            paidAmt = 0;
            remDue = member.monthlyInstallment;
          }
        } else {
          nextStatus = member.status === 'Paid' ? 'Pending' : 'Paid';
          paidAmt = nextStatus === 'Paid' ? member.monthlyInstallment : 0;
          remDue = nextStatus === 'Paid' ? 0 : member.monthlyInstallment;
        }

        member.status = nextStatus;
        member.currentMonthPaidAmount = paidAmt;
        member.currentMonthRemainingDue = remDue;
        if (notes !== undefined) member.notes = notes;

        if (!member.paymentHistory) {
          member.paymentHistory = [];
        }

        const recordIndex = member.paymentHistory.findIndex((p) => p.monthYear === currentMonthYear);
        const newRecord: CommitteePaymentRecord = {
          monthYear: currentMonthYear,
          status: nextStatus,
          paidDate: nextStatus !== 'Pending' ? now.toISOString().split('T')[0] : undefined,
          amountPaid: paidAmt,
          remainingDue: remDue,
          notes: notes !== undefined ? notes : (recordIndex !== -1 ? member.paymentHistory[recordIndex].notes : ''),
        };

        if (recordIndex !== -1) {
          member.paymentHistory[recordIndex] = newRecord;
        } else {
          member.paymentHistory.push(newRecord);
        }
      }
      saveToLocalStorage(state);
    },

    updateCommitteeMember: (state, action: PayloadAction<{ id: string; data: Partial<CommitteeMember> }>) => {
      const index = state.committeeMembers.findIndex((m) => m.id === action.payload.id || m._id === action.payload.id);
      if (index !== -1) {
        state.committeeMembers[index] = { ...state.committeeMembers[index], ...action.payload.data };
      }
      saveToLocalStorage(state);
    },

    addCommitteeMember: (state, action: PayloadAction<Omit<CommitteeMember, 'id'>>) => {
      const now = new Date();
      const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const newMember: CommitteeMember = {
        ...action.payload,
        id: `cm-${Date.now()}`,
        status: action.payload.status || 'Pending',
        currentMonthPaidAmount: action.payload.status === 'Paid' ? action.payload.monthlyInstallment : 0,
        currentMonthRemainingDue: action.payload.status === 'Paid' ? 0 : action.payload.monthlyInstallment,
        paymentHistory: action.payload.paymentHistory || [
          {
            monthYear: currentMonthYear,
            status: action.payload.status || 'Pending',
            amountPaid: action.payload.status === 'Paid' ? action.payload.monthlyInstallment : 0,
            remainingDue: action.payload.status === 'Paid' ? 0 : action.payload.monthlyInstallment,
          },
        ],
      };
      state.committeeMembers.push(newMember);
      saveToLocalStorage(state);
    },

    deleteCommitteeMember: (state, action: PayloadAction<string>) => {
      state.committeeMembers = state.committeeMembers.filter((m) => m.id !== action.payload && m._id !== action.payload);
      saveToLocalStorage(state);
    },

    // Committee Locations Management
    addCommitteeLocation: (state, action: PayloadAction<Omit<CommitteeLocation, 'id'>>) => {
      const newLoc: CommitteeLocation = {
        ...action.payload,
        id: `loc-${Date.now()}`,
      };
      state.committeeLocations.push(newLoc);
      saveToLocalStorage(state);
    },

    updateCommitteeLocation: (state, action: PayloadAction<{ id: string; data: Partial<CommitteeLocation> }>) => {
      const idx = state.committeeLocations.findIndex((l) => l.id === action.payload.id || l._id === action.payload.id);
      if (idx !== -1) {
        state.committeeLocations[idx] = { ...state.committeeLocations[idx], ...action.payload.data };
        if (action.payload.data.name) {
          state.individualCommittees.forEach((c) => {
            if (c.locationId === action.payload.id) {
              c.locationName = action.payload.data.name!;
            }
          });
        }
      }
      saveToLocalStorage(state);
    },

    deleteCommitteeLocation: (state, action: PayloadAction<string>) => {
      state.committeeLocations = state.committeeLocations.filter(
        (l) => l.id !== action.payload && l._id !== action.payload
      );
      state.individualCommittees = state.individualCommittees.filter(
        (c) => c.locationId !== action.payload
      );
      saveToLocalStorage(state);
    },

    // Individual Committees Management
    addIndividualCommittee: (
      state,
      action: PayloadAction<{
        locationId: string;
        locationName: string;
        name: string;
        membersCount: number;
        sharePerMember?: number;
        monthlyAmount: number;
        startMonth: string;
        durationMonths: number;
        endMonth?: string;
        notes?: string;
        color?: string;
        myCommitteeMonth?: string;
        payoutAmount?: number;
      }>
    ) => {
      const {
        locationId,
        locationName,
        name,
        membersCount,
        sharePerMember,
        monthlyAmount,
        startMonth,
        durationMonths,
        notes,
        color,
        myCommitteeMonth,
        payoutAmount,
      } = action.payload;

      const newId = `c-${Date.now()}`;
      const endMonth = calculateEndMonth(startMonth, durationMonths);
      const installments = generateInstallments(newId, startMonth, durationMonths, monthlyAmount);

      const committee: IndividualCommittee = {
        id: newId,
        locationId,
        locationName,
        name,
        membersCount: membersCount || 20,
        sharePerMember: sharePerMember || Math.round(monthlyAmount / (membersCount || 20)),
        monthlyAmount,
        startMonth,
        endMonth,
        durationMonths,
        totalExpectedAmount: monthlyAmount * durationMonths,
        totalPaidAmount: 0,
        paidMonthsCount: 0,
        status: 'Pending',
        myCommitteeMonth,
        payoutAmount: payoutAmount || (monthlyAmount * durationMonths),
        isMyPayoutReceived: false,
        installments,
        notes,
        color: color || 'blue',
        createdAt: new Date().toISOString(),
      };

      state.individualCommittees.push(committee);
      saveToLocalStorage(state);
    },

    updateIndividualCommittee: (
      state,
      action: PayloadAction<{ id: string; data: Partial<IndividualCommittee> }>
    ) => {
      const idx = state.individualCommittees.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) {
        const current = state.individualCommittees[idx];
        const updated = { ...current, ...action.payload.data };

        if (
          (action.payload.data.durationMonths && action.payload.data.durationMonths !== current.durationMonths) ||
          (action.payload.data.startMonth && action.payload.data.startMonth !== current.startMonth) ||
          (action.payload.data.monthlyAmount && action.payload.data.monthlyAmount !== current.monthlyAmount)
        ) {
          const newStart = updated.startMonth;
          const newDuration = updated.durationMonths;
          const newAmount = updated.monthlyAmount;
          updated.endMonth = calculateEndMonth(newStart, newDuration);

          const newInstallments = generateInstallments(current.id, newStart, newDuration, newAmount);
          newInstallments.forEach((newInst) => {
            const oldInst = current.installments.find((oi) => oi.monthKey === newInst.monthKey);
            if (oldInst) {
              newInst.amountPaid = oldInst.amountPaid;
              newInst.remainingDue = Math.max(0, newAmount - oldInst.amountPaid);
              newInst.status =
                newInst.amountPaid >= newAmount
                  ? 'Paid'
                  : newInst.amountPaid > 0
                  ? 'Partially Paid'
                  : 'Pending';
              newInst.transactions = oldInst.transactions;
              newInst.lastPaymentDate = oldInst.lastPaymentDate;
              newInst.notes = oldInst.notes;
            }
          });
          updated.installments = newInstallments;
        }

        state.individualCommittees[idx] = recalculateCommittee(updated);
      }
      saveToLocalStorage(state);
    },

    deleteIndividualCommittee: (state, action: PayloadAction<string>) => {
      state.individualCommittees = state.individualCommittees.filter((c) => c.id !== action.payload);
      saveToLocalStorage(state);
    },

    // Record Payment on an Installment (Supports Full, Partial, Multiple Installments)
    recordInstallmentPayment: (
      state,
      action: PayloadAction<{
        committeeId: string;
        installmentId?: string;
        monthKey?: string;
        monthYear?: string;
        amount: number;
        paymentDate?: string;
        paymentMethod?: string;
        notes?: string;
        referenceNo?: string;
        isOverride?: boolean;
      }>
    ) => {
      const {
        committeeId,
        installmentId,
        monthKey,
        monthYear,
        amount,
        paymentDate,
        paymentMethod,
        notes,
        referenceNo,
        isOverride,
      } = action.payload;

      const cIdx = state.individualCommittees.findIndex((c) => c.id === committeeId);
      if (cIdx === -1) return;

      const committee = state.individualCommittees[cIdx];
      const instIndex = committee.installments.findIndex(
        (inst) =>
          (installmentId && inst.id === installmentId) ||
          (monthKey && inst.monthKey === monthKey) ||
          (monthYear && inst.monthYear.toLowerCase() === monthYear.toLowerCase())
      );

      if (instIndex === -1) return;

      const inst = committee.installments[instIndex];
      const today = paymentDate || new Date().toISOString().split('T')[0];

      if (amount <= 0 && isOverride) {
        inst.amountPaid = 0;
        inst.remainingDue = inst.amountDue;
        inst.status = 'Pending';
        inst.transactions = [];
        inst.lastPaymentDate = undefined;
      } else if (amount > 0) {
        const tx: CommitteePaymentTransaction = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          installmentId: inst.id,
          monthYear: inst.monthYear,
          amount,
          paymentDate: today,
          paymentMethod: paymentMethod || 'Cash',
          notes: notes || '',
          referenceNo: referenceNo || '',
          createdAt: new Date().toISOString(),
        };

        if (isOverride) {
          inst.transactions = [tx];
          inst.amountPaid = Math.min(inst.amountDue, amount);
        } else {
          inst.transactions.push(tx);
          inst.amountPaid = Math.min(inst.amountDue, inst.amountPaid + amount);
        }

        inst.remainingDue = Math.max(0, inst.amountDue - inst.amountPaid);
        inst.lastPaymentDate = today;

        if (inst.amountPaid >= inst.amountDue) {
          inst.status = 'Paid';
        } else if (inst.amountPaid > 0) {
          inst.status = 'Partially Paid';
        } else {
          inst.status = 'Pending';
        }
      }

      state.individualCommittees[cIdx] = recalculateCommittee(committee);
      saveToLocalStorage(state);
    },

    bulkPayLocationCurrentMonth: (
      state,
      action: PayloadAction<{ locationId: string; monthKey?: string; paymentDate?: string }>
    ) => {
      const { locationId, monthKey, paymentDate } = action.payload;
      const today = paymentDate || new Date().toISOString().split('T')[0];
      const now = new Date();
      const targetMonthKey = monthKey || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      state.individualCommittees.forEach((committee, idx) => {
        if (committee.locationId === locationId) {
          // Strictly target the installment for targetMonthKey (no arbitrary fallback)
          const inst = committee.installments.find((i) => i.monthKey === targetMonthKey);

          if (inst && inst.remainingDue > 0) {
            const amountToPay = inst.remainingDue;
            inst.amountPaid += amountToPay;
            inst.remainingDue = 0;
            inst.status = 'Paid';
            inst.lastPaymentDate = today;
            inst.transactions.push({
              id: `tx-bulk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              installmentId: inst.id,
              monthYear: inst.monthYear,
              amount: amountToPay,
              paymentDate: today,
              paymentMethod: 'Bank Transfer',
              notes: `Bulk payment for ${inst.monthYear}`,
              createdAt: new Date().toISOString(),
            });
          }
          state.individualCommittees[idx] = recalculateCommittee(committee, targetMonthKey);
        }
      });

      saveToLocalStorage(state);
    },

    // Expenses
    addExpense: (state, action: PayloadAction<Omit<ExpenseItem, 'id'>>) => {
      state.expenses.unshift({
        ...action.payload,
        id: `exp-${Date.now()}`,
        date: action.payload.date || new Date().toISOString().split('T')[0],
      });
      saveToLocalStorage(state);
    },

    deleteExpense: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload);
      saveToLocalStorage(state);
    },

    // Investments
    addInvestment: (state, action: PayloadAction<Omit<InvestmentItem, 'id'>>) => {
      state.investments.unshift({
        ...action.payload,
        id: `inv-${Date.now()}`,
      });
      saveToLocalStorage(state);
    },

    deleteInvestment: (state, action: PayloadAction<string>) => {
      state.investments = state.investments.filter((i) => i.id !== action.payload);
      saveToLocalStorage(state);
    },

    // Server Hydration & API sync status
    hydrateFromServer: (state, action: PayloadAction<Partial<FinanceState>>) => {
      if (action.payload.portions) state.portions = action.payload.portions;
      if (action.payload.expenses) state.expenses = action.payload.expenses;
      if (action.payload.investments) state.investments = action.payload.investments;
      if (action.payload.committeeMembers) state.committeeMembers = action.payload.committeeMembers;
      state.lastSyncedAt = new Date().toISOString();
      state.isApiConnected = true;
      saveToLocalStorage(state);
    },

    setApiStatus: (state, action: PayloadAction<{ connected: boolean }>) => {
      state.isApiConnected = action.payload.connected;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  rehydrateFromStorage,
  resetToFreshState,
  setHouseholdName,
  setFiscalMonth,
  setSalary,
  togglePortionStatus,
  collectRentPayment,
  updatePortion,
  addPortion,
  deletePortion,
  addLedgerEntry,
  toggleCommitteeStatus,
  recordCommitteePayment,
  updateCommitteeMember,
  addCommitteeMember,
  deleteCommitteeMember,
  addExpense,
  deleteExpense,
  addInvestment,
  deleteInvestment,
  addCommitteeLocation,
  updateCommitteeLocation,
  deleteCommitteeLocation,
  addIndividualCommittee,
  updateIndividualCommittee,
  deleteIndividualCommittee,
  recordInstallmentPayment,
  bulkPayLocationCurrentMonth,
  hydrateFromServer,
  setApiStatus,
  setLoading,
} = financeSlice.actions;

export default financeSlice.reducer;
