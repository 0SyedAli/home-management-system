import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Portion, CommitteeMember, ExpenseItem, InvestmentItem, TenantLedgerEntry, FinanceState } from './types';

const STORAGE_KEY = 'home_finance_state_v2';

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
              state.committeeMembers = parsed.committeeMembers;
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
      const member = state.committeeMembers.find((m) => m.id === action.payload);
      if (member) {
        member.status = member.status === 'Paid' ? 'Pending' : 'Paid';
      }
      saveToLocalStorage(state);
    },

    addCommitteeMember: (state, action: PayloadAction<Omit<CommitteeMember, 'id'>>) => {
      state.committeeMembers.push({
        ...action.payload,
        id: `cm-${Date.now()}`,
      });
      saveToLocalStorage(state);
    },

    deleteCommitteeMember: (state, action: PayloadAction<string>) => {
      state.committeeMembers = state.committeeMembers.filter((m) => m.id !== action.payload);
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
  addCommitteeMember,
  deleteCommitteeMember,
  addExpense,
  deleteExpense,
  addInvestment,
  deleteInvestment,
  hydrateFromServer,
  setApiStatus,
  setLoading,
} = financeSlice.actions;

export default financeSlice.reducer;
