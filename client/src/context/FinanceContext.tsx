'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ReduxProvider } from '../redux/ReduxProvider';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  setHouseholdName as setHouseholdNameAction,
  setFiscalMonth as setFiscalMonthAction,
  setSalary as setSalaryAction,
  togglePortionStatus as togglePortionStatusAction,
  collectRentPayment as collectRentPaymentAction,
  updatePortion as updatePortionAction,
  addPortion as addPortionAction,
  deletePortion as deletePortionAction,
  addLedgerEntry as addLedgerEntryAction,
  toggleCommitteeStatus as toggleCommitteeStatusAction,
  recordCommitteePayment as recordCommitteePaymentAction,
  updateCommitteeMember as updateCommitteeMemberAction,
  addCommitteeMember as addCommitteeMemberAction,
  deleteCommitteeMember as deleteCommitteeMemberAction,
  addExpense as addExpenseAction,
  deleteExpense as deleteExpenseAction,
  addInvestment as addInvestmentAction,
  deleteInvestment as deleteInvestmentAction,
  addCommitteeLocation as addCommitteeLocationAction,
  updateCommitteeLocation as updateCommitteeLocationAction,
  deleteCommitteeLocation as deleteCommitteeLocationAction,
  addIndividualCommittee as addIndividualCommitteeAction,
  updateIndividualCommittee as updateIndividualCommitteeAction,
  deleteIndividualCommittee as deleteIndividualCommitteeAction,
  recordInstallmentPayment as recordInstallmentPaymentAction,
  bulkPayLocationCurrentMonth as bulkPayLocationCurrentMonthAction,
  hydrateFromServer,
  rehydrateFromStorage,
  resetToFreshState as resetToFreshStateAction,
  setApiStatus,
} from '../redux/financeSlice';
import {
  Portion,
  TenantLedgerEntry,
  CommitteeMember,
  ExpenseItem,
  InvestmentItem,
  CommitteeLocation,
  IndividualCommittee,
  ScheduledInstallment,
  CommitteePaymentTransaction,
} from '../redux/types';
import { api } from '../redux/api';

export type {
  Portion,
  TenantLedgerEntry,
  CommitteeMember,
  ExpenseItem,
  InvestmentItem,
  CommitteeLocation,
  IndividualCommittee,
  ScheduledInstallment,
  CommitteePaymentTransaction,
};

interface FinanceContextType {
  householdName: string;
  setHouseholdName: (name: string) => void;
  fiscalMonth: string;
  setFiscalMonth: (month: string) => void;
  salary: number;
  setSalary: (salary: number) => void;

  // Portions
  portions: Portion[];
  togglePortionStatus: (portionId: string) => void;
  collectRentPayment: (
    portionId: string,
    data: {
      monthlyRent?: number;
      amountCollected?: number;
      paymentMode?: string;
      paymentDate?: string;
      electricBill?: number;
      gasBill?: number;
      solarRent?: number;
      notes?: string;
    }
  ) => void;
  updatePortion: (portionId: string, data: Partial<Portion>) => void;
  addPortion: (portion: Omit<Portion, 'id' | 'ledgerHistory'>) => void;
  deletePortion: (portionId: string) => void;
  addLedgerEntry: (portionId: string, entry: Omit<TenantLedgerEntry, 'id'>) => void;

  // Committee
  committeeMembers: CommitteeMember[];
  toggleCommitteeStatus: (memberId: string) => void;
  recordCommitteePayment: (
    memberId: string,
    status?: 'Paid' | 'Partial' | 'Pending',
    amountPaid?: number,
    notes?: string
  ) => void;
  updateCommitteeMember: (memberId: string, data: Partial<CommitteeMember>) => void;
  addCommitteeMember: (member: Omit<CommitteeMember, 'id'>) => void;
  deleteCommitteeMember: (memberId: string) => void;

  // Committee Locations & Individual Committees Module
  committeeLocations: CommitteeLocation[];
  individualCommittees: IndividualCommittee[];
  addCommitteeLocation: (loc: Omit<CommitteeLocation, 'id'>) => void;
  updateCommitteeLocation: (id: string, data: Partial<CommitteeLocation>) => void;
  deleteCommitteeLocation: (id: string) => void;
  addIndividualCommittee: (committee: {
    locationId: string;
    locationName: string;
    name: string;
    membersCount: number;
    sharePerMember?: number;
    monthlyAmount: number;
    startMonth: string;
    durationMonths: number;
    notes?: string;
    color?: string;
  }) => void;
  updateIndividualCommittee: (id: string, data: Partial<IndividualCommittee>) => void;
  deleteIndividualCommittee: (id: string) => void;
  recordInstallmentPayment: (params: {
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
  }) => void;
  bulkPayLocationCurrentMonth: (params: {
    locationId: string;
    monthKey?: string;
    paymentDate?: string;
  }) => void;

  // Additional Computed Metrics for Committee Module
  totalLocationsCount: number;
  totalIndividualCommitteesCount: number;
  totalActiveCommitteesCount: number;
  totalAllCommitteesLifecycleValue: number;
  totalMonthlyCommitteesPool: number;

  // Expenses
  expenses: ExpenseItem[];
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  deleteExpense: (expenseId: string) => void;

  // Investments
  investments: InvestmentItem[];
  addInvestment: (investment: Omit<InvestmentItem, 'id'>) => void;
  deleteInvestment: (investmentId: string) => void;

  // Computed totals
  totalRentExpected: number;
  receivedThisMonth: number;
  pendingThisMonth: number;
  totalSecuritiesDeposited: number;
  totalIncome: number;
  totalExpenses: number;
  totalInvestments: number;
  totalCommitteePool: number;
  totalCommitteeCollected: number;
  totalUtilitiesElectricGas: number;
  totalSolarRent: number;

  // Sync & Reset
  isApiConnected: boolean;
  lastSyncedAt: string | null;
  resetToFreshState: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const FinanceProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const financeState = useAppSelector((state) => state.finance);

  // Background API connection check and hydration
  useEffect(() => {
    // Rehydrate local storage on mount after initial hydration
    dispatch(rehydrateFromStorage());

    let isMounted = true;

    const checkAndSync = async () => {
      const health = await api.checkHealth();
      if (!isMounted) return;

      const healthData = health.data as any;
      if (healthData?.status === 'online') {
        dispatch(setApiStatus({ connected: true }));

        // Attempt background pull from backend
        try {
          const [propRes, txRes, commRes, invRes] = await Promise.all([
            api.getProperties(),
            api.getTransactions('EXPENSE'),
            api.getCommittees(),
            api.getInvestments(),
          ]);

          const propData = propRes.data as any;
          if (propData && Array.isArray(propData) && propData.length > 0) {
            // Map MongoDB properties to frontend Portion schema if available
            const mappedPortions: Portion[] = propData.map((p: any) => ({
              id: p._id || p.id,
              _id: p._id,
              name: p.portionName || p.name,
              tenantName: p.tenant?.name || p.tenantName || 'Unassigned',
              tenantContact: p.tenant?.phone || p.tenantContact || '—',
              securityDeposit: p.tenant?.securityDeposit || p.securityDeposit || 0,
              monthlyRent: p.baseMonthlyRent || p.monthlyRent || 0,
              electricBill: p.electricSubMeterReading || p.electricBill || 0,
              gasBill: p.gasSubMeterReading || p.gasBill || 0,
              isElectricIncluded: Boolean(p.isElectricIncluded),
              isGasIncluded: Boolean(p.isGasIncluded),
              solarRent: p.fixedUtilityCharge || p.solarRent || 0,
              status: (p.rentStatus || (p.isOccupied ? 'Paid' : 'Pending')) as 'Paid' | 'Pending',
              lastReceivedDate: p.lastReceivedDate || (p.rentStatus === 'Paid' ? 'Today' : 'Pending for Oct'),
              ledgerHistory: p.ledgerHistory || [],
            }));

            dispatch(hydrateFromServer({ portions: mappedPortions }));
          }

          const txData = txRes.data as any;
          if (txData && Array.isArray(txData) && txData.length > 0) {
            const mappedExpenses: ExpenseItem[] = txData.map((tx: any) => ({
              id: tx._id || tx.id,
              _id: tx._id,
              title: tx.title || 'Expense',
              category: tx.category || 'Household',
              amount: tx.amount || 0,
              date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : undefined,
            }));
            dispatch(hydrateFromServer({ expenses: mappedExpenses }));
          }

          const invData = invRes.data as any;
          if (invData?.items && Array.isArray(invData.items) && invData.items.length > 0) {
            const mappedInvestments: InvestmentItem[] = invData.items.map((i: any) => ({
              id: i._id || i.id,
              _id: i._id,
              name: i.assetName || i.name,
              type: i.assetType || i.type,
              investedCapital: i.investedCapital || 0,
              currentValuation: i.currentValuation || 0,
            }));
            dispatch(hydrateFromServer({ investments: mappedInvestments }));
          }

          const commResData = (commRes.data as any)?.data || commRes.data;
          if (commResData && Array.isArray(commResData) && commResData.length > 0) {
            const now = new Date();
            const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const mappedMembers: CommitteeMember[] = commResData.map((m: any) => {
              const history = m.paymentHistory || [];
              const currentRecord = history.find((p: any) => p.monthYear === currentMonthYear);
              return {
                id: m._id || m.id,
                _id: m._id,
                name: m.memberName || m.name,
                monthlyInstallment: m.monthlyInstallment || 0,
                startDate: m.startDate,
                endDate: m.endDate,
                payoutMonth: m.payoutMonth || 'Not Specified',
                status: currentRecord ? currentRecord.status : (m.status || 'Pending'),
                paymentHistory: history,
              };
            });
            dispatch(hydrateFromServer({ committeeMembers: mappedMembers }));
          }
        } catch (e) {
          console.log('Background server sync paused; using local cached state');
        }
      } else {
        dispatch(setApiStatus({ connected: false }));
      }
    };

    checkAndSync();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // Actions wrapped with Redux dispatch and asynchronous backend sync
  const setHouseholdName = (name: string) => {
    dispatch(setHouseholdNameAction(name));
  };

  const setFiscalMonth = (month: string) => {
    dispatch(setFiscalMonthAction(month));
  };

  const setSalary = (salary: number) => {
    dispatch(setSalaryAction(salary));
  };

  const togglePortionStatus = (portionId: string) => {
    const portion = financeState.portions.find((p) => p.id === portionId);
    const nextStatus = portion?.status === 'Paid' ? 'Pending' : 'Paid';
    const lastDate = nextStatus === 'Paid' ? 'Today' : 'Pending for Oct';

    // 1. Instant Redux + LocalStorage update (0ms UI latency)
    dispatch(togglePortionStatusAction(portionId));

    // 2. Background sync to MongoDB API
    const targetId = portion?._id || portionId;
    api.updatePortionStatus(targetId, nextStatus, lastDate).catch((err) => {
      console.warn('Status sync to API failed:', err);
    });
  };

  const collectRentPayment = (
    portionId: string,
    data: {
      monthlyRent?: number;
      amountCollected?: number;
      paymentMode?: string;
      paymentDate?: string;
      electricBill?: number;
      gasBill?: number;
      solarRent?: number;
      notes?: string;
    }
  ) => {
    const portion = financeState.portions.find((p) => p.id === portionId);
    const targetId = portion?._id || portionId;
    const now = new Date();

    // 1. Instant Redux + LocalStorage update (0ms UI latency)
    dispatch(collectRentPaymentAction({ portionId, ...data }));

    // 2. Background sync to Express backend
    api.collectRent({
      unitId: targetId,
      amountReceived: data.monthlyRent || data.amountCollected || 0,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMode || 'Cash',
      notes: data.notes,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }).catch(() => {
      // Graceful offline fallback
    });

    // Also update portion status directly on MongoDB
    api.updatePortionStatus(targetId, 'Paid', data.paymentDate || 'Today').catch(() => {});
  };

  const updatePortion = (portionId: string, data: Partial<Portion>) => {
    const portion = financeState.portions.find((p) => p.id === portionId);
    const targetId = portion?._id || portionId;

    // 1. Instant Redux + LocalStorage update
    dispatch(updatePortionAction({ id: portionId, data }));

    // 2. Background sync
    api.updateProperty(targetId, {
      portionName: data.name,
      baseMonthlyRent: data.monthlyRent,
      electricSubMeterReading: data.electricBill,
      gasSubMeterReading: data.gasBill,
      fixedUtilityCharge: data.solarRent,
      isElectricIncluded: data.isElectricIncluded,
      isGasIncluded: data.isGasIncluded,
      rentStatus: data.status,
      lastReceivedDate: data.lastReceivedDate,
      tenant: data.tenantName ? {
        name: data.tenantName,
        phone: data.tenantContact || '',
        securityDeposit: data.securityDeposit || 0,
        agreementStartDate: new Date(),
        isActive: true,
      } : undefined,
    }).catch(() => {});
  };

  const addPortion = (portion: Omit<Portion, 'id' | 'ledgerHistory'>) => {
    const tempId = `p-${Date.now()}`;
    // 1. Instant Redux + LocalStorage update
    dispatch(addPortionAction(portion));

    // 2. Background sync
    api.createProperty({
      portionName: portion.name,
      unitCode: `P-${Date.now().toString().slice(-4)}`,
      baseMonthlyRent: portion.monthlyRent,
      electricSubMeterReading: portion.electricBill,
      gasSubMeterReading: portion.gasBill,
      fixedUtilityCharge: portion.solarRent,
      isElectricIncluded: portion.isElectricIncluded,
      isGasIncluded: portion.isGasIncluded,
      rentStatus: portion.status,
      tenant: portion.tenantName ? {
        name: portion.tenantName,
        phone: portion.tenantContact || '',
        securityDeposit: portion.securityDeposit || 0,
        agreementStartDate: new Date(),
        isActive: true,
      } : null,
    }).then((res) => {
      const created = res.data as any;
      if (created?._id) {
        dispatch(updatePortionAction({ id: tempId, data: { _id: created._id, id: created._id } }));
      }
    }).catch(() => {});
  };

  const deletePortion = (portionId: string) => {
    const portion = financeState.portions.find((p) => p.id === portionId);
    const targetId = portion?._id || portionId;
    dispatch(deletePortionAction(portionId));
    api.deleteProperty(targetId).catch(() => {});
  };

  const addLedgerEntry = (portionId: string, entry: Omit<TenantLedgerEntry, 'id'>) => {
    dispatch(addLedgerEntryAction({ portionId, entry }));
    const portion = financeState.portions.find((p) => p.id === portionId);
    const targetId = portion?._id || portionId;
    api.updatePortionStatus(targetId, portion?.status || 'Paid', undefined, entry).catch(() => {});
  };

  // Committee
  const toggleCommitteeStatus = (memberId: string) => {
    dispatch(toggleCommitteeStatusAction(memberId));
    const member = financeState.committeeMembers.find((m) => m.id === memberId || m._id === memberId);
    const targetId = member?._id || memberId;
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const nextStatus = member?.status === 'Paid' ? 'Pending' : 'Paid';
    api.updateCommitteeMemberStatus(targetId, nextStatus, currentMonthYear).catch(() => {});
  };

  const recordCommitteePayment = (
    memberId: string,
    status?: 'Paid' | 'Partial' | 'Pending',
    amountPaid?: number,
    notes?: string
  ) => {
    dispatch(recordCommitteePaymentAction({ id: memberId, status, amountPaid, notes }));
    const member = financeState.committeeMembers.find((m) => m.id === memberId || m._id === memberId);
    const targetId = member?._id || memberId;
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    api.updateCommitteeMemberStatus(targetId, status, currentMonthYear, amountPaid, notes).catch(() => {});
  };

  const updateCommitteeMember = (memberId: string, data: Partial<CommitteeMember>) => {
    dispatch(updateCommitteeMemberAction({ id: memberId, data }));
    const member = financeState.committeeMembers.find((m) => m.id === memberId || m._id === memberId);
    const targetId = member?._id || memberId;
    api.updateCommitteeMember(targetId, {
      name: data.name,
      memberName: data.name,
      monthlyInstallment: data.monthlyInstallment,
      startDate: data.startDate,
      endDate: data.endDate,
      payoutMonth: data.payoutMonth,
      notes: data.notes,
    }).catch(() => {});
  };

  const addCommitteeMember = (member: Omit<CommitteeMember, 'id'>) => {
    dispatch(addCommitteeMemberAction(member));
    api.createCommitteeMember({
      name: member.name,
      monthlyInstallment: member.monthlyInstallment,
      startDate: member.startDate,
      endDate: member.endDate,
      payoutMonth: member.payoutMonth,
    }).catch(() => {});
  };

  const deleteCommitteeMember = (memberId: string) => {
    const member = financeState.committeeMembers.find((m) => m.id === memberId || m._id === memberId);
    const targetId = member?._id || memberId;
    dispatch(deleteCommitteeMemberAction(memberId));
    api.deleteCommitteeMember(targetId).catch(() => {});
  };

  // Committee Locations & Individual Committees Module Handlers
  const addCommitteeLocation = (loc: Omit<CommitteeLocation, 'id'>) => {
    dispatch(addCommitteeLocationAction(loc));
  };

  const updateCommitteeLocation = (id: string, data: Partial<CommitteeLocation>) => {
    dispatch(updateCommitteeLocationAction({ id, data }));
  };

  const deleteCommitteeLocation = (id: string) => {
    dispatch(deleteCommitteeLocationAction(id));
  };

  const addIndividualCommittee = (committee: {
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
  }) => {
    dispatch(addIndividualCommitteeAction(committee));
  };

  const updateIndividualCommittee = (id: string, data: Partial<IndividualCommittee>) => {
    dispatch(updateIndividualCommitteeAction({ id, data }));
  };

  const deleteIndividualCommittee = (id: string) => {
    dispatch(deleteIndividualCommitteeAction(id));
  };

  const recordInstallmentPayment = (params: {
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
  }) => {
    dispatch(recordInstallmentPaymentAction(params));
  };

  const bulkPayLocationCurrentMonth = (params: {
    locationId: string;
    monthKey?: string;
    paymentDate?: string;
  }) => {
    dispatch(bulkPayLocationCurrentMonthAction(params));
  };

  // Expenses
  const addExpense = (expense: Omit<ExpenseItem, 'id'>) => {
    dispatch(addExpenseAction(expense));
    api.createTransaction({
      type: 'EXPENSE',
      category: expense.category,
      amount: expense.amount,
      title: expense.title,
      date: expense.date || new Date(),
    }).catch(() => {});
  };

  const deleteExpense = (expenseId: string) => {
    dispatch(deleteExpenseAction(expenseId));
    api.deleteTransaction(expenseId).catch(() => {});
  };

  // Investments
  const addInvestment = (inv: Omit<InvestmentItem, 'id'>) => {
    dispatch(addInvestmentAction(inv));
    api.createInvestment({
      assetName: inv.name,
      assetType: inv.type,
      investedCapital: inv.investedCapital,
      currentValuation: inv.currentValuation,
    }).catch(() => {});
  };

  const deleteInvestment = (invId: string) => {
    dispatch(deleteInvestmentAction(invId));
    api.deleteInvestment(invId).catch(() => {});
  };

  const resetToFreshState = () => {
    dispatch(resetToFreshStateAction());
  };

  // Computed Totals (High Performance with useMemo)
  const { portions, committeeMembers, committeeLocations, individualCommittees, expenses, investments, salary } = financeState;

  const totalRentExpected = useMemo(() => {
    return portions.reduce((sum, p) => sum + (p.monthlyRent || 0), 0);
  }, [portions]);

  const receivedThisMonth = useMemo(() => {
    return portions
      .filter((p) => p.status === 'Paid')
      .reduce((sum, p) => sum + (p.monthlyRent || 0), 0);
  }, [portions]);

  const pendingThisMonth = useMemo(() => {
    return portions
      .filter((p) => p.status === 'Pending')
      .reduce((sum, p) => sum + (p.monthlyRent || 0), 0);
  }, [portions]);

  const totalSecuritiesDeposited = useMemo(() => {
    return portions.reduce((sum, p) => sum + (p.securityDeposit || 0), 0);
  }, [portions]);

  // Income: Salary + Base Rent (Pass-through gas and electric bills are NOT income!)
  const totalIncome = useMemo(() => {
    return salary + totalRentExpected;
  }, [salary, totalRentExpected]);

  // Expenses: Actual household expenses (Pass-through bills are NOT household expenses!)
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  const totalInvestments = useMemo(() => {
    return investments.reduce((sum, i) => sum + (i.currentValuation || 0), 0);
  }, [investments]);

  const totalCommitteePool = useMemo(() => {
    return committeeMembers.reduce((sum, m) => sum + (m.monthlyInstallment || 0), 0);
  }, [committeeMembers]);

  const totalCommitteeCollected = useMemo(() => {
    return committeeMembers.reduce((sum, m) => {
      if (m.currentMonthPaidAmount !== undefined) {
        return sum + (m.currentMonthPaidAmount || 0);
      }
      return sum + (m.status === 'Paid' ? (m.monthlyInstallment || 0) : 0);
    }, 0);
  }, [committeeMembers]);

  const totalUtilitiesElectricGas = useMemo(() => {
    return portions.reduce((sum, p) => sum + (p.electricBill || 0) + (p.gasBill || 0), 0);
  }, [portions]);

  const totalSolarRent = useMemo(() => {
    return portions.reduce((sum, p) => sum + (p.solarRent || 0), 0);
  }, [portions]);

  // Committee Module Computed Metrics
  const totalLocationsCount = useMemo(() => {
    return committeeLocations.length;
  }, [committeeLocations]);

  const totalIndividualCommitteesCount = useMemo(() => {
    return individualCommittees.length;
  }, [individualCommittees]);

  const totalActiveCommitteesCount = useMemo(() => {
    return individualCommittees.filter((c) => c.status !== 'Completed').length;
  }, [individualCommittees]);

  const totalAllCommitteesLifecycleValue = useMemo(() => {
    return individualCommittees.reduce((sum, c) => sum + (c.totalExpectedAmount || 0), 0);
  }, [individualCommittees]);

  const totalMonthlyCommitteesPool = useMemo(() => {
    return individualCommittees.reduce((sum, c) => sum + (c.monthlyAmount || 0), 0);
  }, [individualCommittees]);

  return (
    <FinanceContext.Provider
      value={{
        householdName: financeState.householdName,
        setHouseholdName,
        fiscalMonth: financeState.fiscalMonth,
        setFiscalMonth,
        salary: financeState.salary,
        setSalary,
        portions,
        togglePortionStatus,
        collectRentPayment,
        updatePortion,
        addPortion,
        deletePortion,
        addLedgerEntry,
        committeeMembers,
        toggleCommitteeStatus,
        recordCommitteePayment,
        updateCommitteeMember,
        addCommitteeMember,
        deleteCommitteeMember,
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
        totalActiveCommitteesCount,
        totalAllCommitteesLifecycleValue,
        totalMonthlyCommitteesPool,
        expenses,
        addExpense,
        deleteExpense,
        investments,
        addInvestment,
        deleteInvestment,
        totalRentExpected,
        receivedThisMonth,
        pendingThisMonth,
        totalSecuritiesDeposited,
        totalIncome,
        totalExpenses,
        totalInvestments,
        totalCommitteePool,
        totalCommitteeCollected,
        totalUtilitiesElectricGas,
        totalSolarRent,
        isApiConnected: financeState.isApiConnected,
        lastSyncedAt: financeState.lastSyncedAt,
        resetToFreshState,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReduxProvider>
      <FinanceProviderInner>{children}</FinanceProviderInner>
    </ReduxProvider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
