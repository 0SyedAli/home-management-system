'use client';

import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { KPICards, DashboardMetrics } from '../components/KPICards';
import { CashFlowSummary } from '../components/CashFlowSummary';
import { RentalManagement, PortionUnit } from '../components/RentalManagement';
import { CommitteeTracker, CommitteeMemberRow } from '../components/CommitteeTracker';
import { InvestmentsTracker, InvestmentItem } from '../components/InvestmentsTracker';
import { ExpensesTracker, TransactionRecord } from '../components/ExpensesTracker';
import { Bell, Search, Calendar, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function HomeDashboardPage() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // 1. Initial State for Metrics
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalMonthlyIncome: 462940, // Salary 350k + Rent 112,940
    salaryIncome: 350000,
    rentalIncome: 112940,
    householdExpenses: 150500, // Groceries 52k, Utilities 41.5k, Education 35k, Maintenance 14k, Medical 8k
    netMonthlySavings: 312440,
    savingsRatio: 67.5,
    activeInvestmentsValuation: 3065000,
    activeInvestmentsGain: 515000,
    committeeReceivable: 80000, // Anabia ki Dadi (70k) + Tehmina Bhabhi (10k)
    committeeCollected: 200000, // Shadia Aunty (50k) + Asma Aunty (110k) + Nono ki Ami (40k)
  });

  // 2. Initial State for Rental Portions
  const [portions, setPortions] = useState<PortionUnit[]>([
    {
      id: 'unit-1',
      portionName: 'Ground Floor (3-Bed Main Portion)',
      unitCode: 'GF-01',
      baseMonthlyRent: 65000,
      isOccupied: true,
      tenant: {
        name: 'Tariq Mahmood',
        phone: '+92 300 1234567',
        securityDeposit: 130000,
        agreementStartDate: '2025-06-01',
      },
      currentBill: {
        month: 'Oct 2026',
        baseRent: 65000,
        electricUnits: 180,
        electricTotal: 8640,
        gasCharge: 1800,
        maintenanceCharge: 2500,
        totalAmount: 77940,
        amountPaid: 77940,
        balanceRemaining: 0,
        status: 'Paid',
        lastReceiptDate: '2026-10-04',
      },
    },
    {
      id: 'unit-2',
      portionName: 'Upper Portion (2-Bed Terrace Unit)',
      unitCode: 'UP-01',
      baseMonthlyRent: 55000,
      isOccupied: true,
      tenant: {
        name: 'Kamran Siddiqui',
        phone: '+92 333 7654321',
        securityDeposit: 110000,
        agreementStartDate: '2026-01-15',
      },
      currentBill: {
        month: 'Oct 2026',
        baseRent: 55000,
        electricUnits: 140,
        electricTotal: 6720,
        gasCharge: 1500,
        maintenanceCharge: 2000,
        totalAmount: 65220,
        amountPaid: 35000,
        balanceRemaining: 30220,
        status: 'Partially Paid',
        lastReceiptDate: '2026-10-07',
      },
    },
    {
      id: 'unit-3',
      portionName: 'Rooftop Studio Penthouse',
      unitCode: 'RT-01',
      baseMonthlyRent: 30000,
      isOccupied: false,
      currentBill: {
        month: 'Oct 2026',
        baseRent: 30000,
        electricUnits: 0,
        electricTotal: 0,
        gasCharge: 0,
        maintenanceCharge: 0,
        totalAmount: 30000,
        amountPaid: 0,
        balanceRemaining: 30000,
        status: 'Pending',
      },
    },
  ]);

  // 3. Initial State for Committee Members (ROSCA Seed Ledger)
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMemberRow[]>([
    {
      id: 'cm-1',
      name: 'Shadia Aunty',
      monthlyInstallment: 50000,
      payoutMonthIndex: 1,
      payoutMonthLabel: 'June 2026',
      isPayoutCompleted: true,
      actualPayoutDate: '2026-06-05',
      currentStatus: 'Paid',
      totalContributed: 250000,
    },
    {
      id: 'cm-2',
      name: 'Asma Aunty',
      monthlyInstallment: 110000,
      payoutMonthIndex: 2,
      payoutMonthLabel: 'July 2026',
      isPayoutCompleted: true,
      actualPayoutDate: '2026-07-05',
      currentStatus: 'Paid',
      totalContributed: 550000,
    },
    {
      id: 'cm-3',
      name: 'Nono ki Ami',
      monthlyInstallment: 40000,
      payoutMonthIndex: 5,
      payoutMonthLabel: 'October 2026',
      isPayoutCompleted: false, // Scheduled for this month
      currentStatus: 'Paid',
      totalContributed: 200000,
    },
    {
      id: 'cm-4',
      name: 'Anabia ki Dadi',
      monthlyInstallment: 70000,
      payoutMonthIndex: 7,
      payoutMonthLabel: 'December 2026',
      isPayoutCompleted: false,
      currentStatus: 'Pending',
      totalContributed: 280000,
    },
    {
      id: 'cm-5',
      name: 'Tehmina Bhabhi',
      monthlyInstallment: 10000,
      payoutMonthIndex: 9,
      payoutMonthLabel: 'February 2027',
      isPayoutCompleted: false,
      currentStatus: 'Pending',
      totalContributed: 40000,
    },
  ]);

  // 4. Initial State for Investments
  const [investments, setInvestments] = useState<InvestmentItem[]>([
    {
      id: 'inv-1',
      assetName: 'Al Meezan Sovereign Islamic Mutual Fund',
      assetType: 'Stocks / Mutual Funds',
      investedCapital: 1200000,
      currentValuation: 1420000,
      returnPercentage: 18.3,
      purchaseDate: '2025-01-10',
      institutionOrBroker: 'Meezan Asset Management',
      notes: 'Monthly dividend reinvestment compounding',
    },
    {
      id: 'inv-2',
      assetName: 'Physical Gold Bars (24K - 3 Tolas)',
      assetType: 'Physical Gold / Silver',
      investedCapital: 850000,
      currentValuation: 1080000,
      returnPercentage: 27.1,
      purchaseDate: '2024-08-15',
      institutionOrBroker: 'ARY Jewellers Vault Safe',
      notes: 'Inflation hedge gold sovereign',
    },
    {
      id: 'inv-3',
      assetName: 'National Savings Certificates (SSC)',
      assetType: 'Fixed Deposit / National Savings',
      investedCapital: 500000,
      currentValuation: 565000,
      returnPercentage: 13.0,
      purchaseDate: '2025-05-20',
      institutionOrBroker: 'Central Directorate of National Savings',
      notes: 'Biannual Shariah profit payout',
    },
  ]);

  // 5. Initial State for Transactions
  const [transactions, setTransactions] = useState<TransactionRecord[]>([
    {
      id: 'tx-1',
      type: 'INCOME',
      category: 'Salary',
      amount: 350000,
      date: '2026-10-01',
      title: 'Monthly Executive Salary',
      paymentMethod: 'Bank Transfer',
    },
    {
      id: 'tx-2',
      type: 'INCOME',
      category: 'Rental Inflow',
      amount: 77940,
      date: '2026-10-04',
      title: 'Rent Collection - Ground Floor (Tariq Mahmood)',
      paymentMethod: 'Bank Transfer',
    },
    {
      id: 'tx-3',
      type: 'INCOME',
      category: 'Rental Inflow',
      amount: 35000,
      date: '2026-10-07',
      title: 'Partial Rent - Upper Portion (Kamran Siddiqui)',
      paymentMethod: 'EasyPaisa',
    },
    {
      id: 'tx-4',
      type: 'EXPENSE',
      category: 'Groceries',
      amount: 52000,
      date: '2026-10-03',
      title: 'Monthly Supermarket Provisions',
      paymentMethod: 'Credit Card',
    },
    {
      id: 'tx-5',
      type: 'EXPENSE',
      category: 'Utilities',
      amount: 41500,
      date: '2026-10-06',
      title: 'Main K-Electric & Gas Invoices',
      paymentMethod: 'Bank Transfer',
    },
    {
      id: 'tx-6',
      type: 'EXPENSE',
      category: 'Education',
      amount: 35000,
      date: '2026-10-02',
      title: 'Children Academy & School Tuition Fees',
      paymentMethod: 'Bank Transfer',
    },
    {
      id: 'tx-7',
      type: 'EXPENSE',
      category: 'Maintenance',
      amount: 14000,
      date: '2026-10-05',
      title: 'Water Booster Pump Overhaul',
      paymentMethod: 'Cash',
    },
  ]);

  // Handler: Collect Rent -> Direct integration into Primary Income
  const handleCollectRent = (data: any) => {
    // 1. Update portion billing status
    setPortions((prev) =>
      prev.map((p) => {
        if (p.id === data.portionId) {
          const newPaid = p.currentBill.amountPaid + data.amountCollected;
          const newBalance = Math.max(0, p.currentBill.totalAmount - newPaid);
          const newStatus = newBalance === 0 ? 'Paid' : 'Partially Paid';

          return {
            ...p,
            currentBill: {
              ...p.currentBill,
              amountPaid: newPaid,
              balanceRemaining: newBalance,
              status: newStatus,
              lastReceiptDate: new Date().toISOString(),
            },
          };
        }
        return p;
      })
    );

    // 2. Direct Integration: Add to Income Transactions
    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      type: 'INCOME',
      category: 'Rental Inflow',
      amount: data.amountCollected,
      date: new Date().toISOString(),
      title: `Rental Inflow: Unit ${data.unitCode} (${data.tenantName})`,
      paymentMethod: data.paymentMethod,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // 3. Update KPI Inflow
    setMetrics((prev) => {
      const newRentalInflow = prev.rentalIncome + data.amountCollected;
      const newTotalInflow = prev.salaryIncome + newRentalInflow;
      const newSavings = newTotalInflow - prev.householdExpenses;
      return {
        ...prev,
        rentalIncome: newRentalInflow,
        totalMonthlyIncome: newTotalInflow,
        netMonthlySavings: newSavings,
        savingsRatio: Math.round((newSavings / newTotalInflow) * 1000) / 10,
      };
    });
  };

  const handleToggleCommitteeStatus = (
    memberId: string,
    newStatus: 'Paid' | 'Pending' | 'Overdue'
  ) => {
    // Update metric totals
    setCommitteeMembers((prev) => {
      const updated = prev.map((m) =>
        m.id === memberId ? { ...m, currentStatus: newStatus } : m
      );
      const collected = updated.reduce(
        (sum, m) => sum + (m.currentStatus === 'Paid' ? m.monthlyInstallment : 0),
        0
      );
      const receivable = updated.reduce(
        (sum, m) => sum + (m.currentStatus !== 'Paid' ? m.monthlyInstallment : 0),
        0
      );

      setMetrics((mPrev) => ({
        ...mPrev,
        committeeCollected: collected,
        committeeReceivable: receivable,
      }));

      return updated;
    });
  };

  const handleToggleCommitteePayout = (memberId: string, isCompleted: boolean) => {
    setCommitteeMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, isPayoutCompleted: isCompleted } : m))
    );
  };

  const handleAddTransaction = (newRecord: any) => {
    const tx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      ...newRecord,
    };
    setTransactions((prev) => [tx, ...prev]);

    setMetrics((prev) => {
      let salary = prev.salaryIncome;
      let rent = prev.rentalIncome;
      let expenses = prev.householdExpenses;

      if (tx.type === 'INCOME') {
        if (tx.category === 'Rental Inflow') rent += tx.amount;
        else salary += tx.amount;
      } else {
        expenses += tx.amount;
      }

      const totalInflow = salary + rent;
      const savings = totalInflow - expenses;
      return {
        ...prev,
        salaryIncome: salary,
        rentalIncome: rent,
        householdExpenses: expenses,
        totalMonthlyIncome: totalInflow,
        netMonthlySavings: savings,
        savingsRatio: Math.round((savings / totalInflow) * 1000) / 10,
      };
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex font-sans antialiased">
      {/* 1. Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Main Viewport Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200/80 bg-white px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-900 capitalize">
              {activeTab === 'dashboard'
                ? 'Household Executive Dashboard'
                : activeTab === 'rental'
                ? 'Portions & Tenancy OS'
                : activeTab === 'committee'
                ? 'ROSCA Kameti Ledger'
                : activeTab === 'investments'
                ? 'Asset Allocation Portfolio'
                : 'Household Cashflow & Expenses'}
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
              <Calendar className="w-3 h-3 text-slate-400" />
              Fiscal Cycle: October 2026
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Portions Synced
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Always display top high-level KPIs when in dashboard overview */}
          {(activeTab === 'dashboard' || activeTab === 'expenses') && (
            <>
              <KPICards metrics={metrics} />
              <CashFlowSummary
                income={metrics.totalMonthlyIncome}
                expenses={metrics.householdExpenses}
                savings={metrics.netMonthlySavings}
                categories={{
                  Groceries: 52000,
                  Utilities: 41500,
                  Education: 35000,
                  Maintenance: 14000,
                  Medical: 8000,
                  Miscellaneous: 0,
                }}
              />
            </>
          )}

          {/* Module 1: Rental Management Portions & Collect Rent Modal */}
          {(activeTab === 'dashboard' || activeTab === 'rental') && (
            <RentalManagement portions={portions} onCollectRent={handleCollectRent} />
          )}

          {/* Module 2: Dedicated Committee (Kameti) Module with EXACT Requested Seed Ledger */}
          {(activeTab === 'dashboard' || activeTab === 'committee') && (
            <CommitteeTracker
              committeeName="Khandan Annual Savings Kameti 2026"
              totalMonthlyPool={280000}
              currentCycleMonth="October 2026 (Month 5)"
              totalMonths={10}
              members={committeeMembers}
              onToggleStatus={handleToggleCommitteeStatus}
              onTogglePayout={handleToggleCommitteePayout}
            />
          )}

          {/* Module 3: Investments Tracker */}
          {(activeTab === 'dashboard' || activeTab === 'investments') && (
            <InvestmentsTracker investments={investments} />
          )}

          {/* Module 4: Categorized Household Expenses & Inflow Ledger */}
          {activeTab === 'expenses' && (
            <ExpensesTracker
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
            />
          )}
        </div>
      </main>
    </div>
  );
}
