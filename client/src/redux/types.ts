export interface TenantLedgerEntry {
  id: string;
  monthYear: string;
  baseRent: number;
  electricBill?: number;
  gasBill?: number;
  utilities: number;
  totalDue: number;
  paidAmount: number;
  paymentDate: string;
  paymentMode?: string;
  status: 'Paid' | 'Late' | 'Partial' | 'Pending';
  receiptNote?: string;
}

export interface Portion {
  id: string;
  _id?: string; // MongoDB ObjectId if synced
  name: string;
  tenantName: string;
  tenantContact: string;
  securityDeposit: number;
  monthlyRent: number;
  electricBill: number;
  gasBill: number;
  isElectricIncluded?: boolean;
  isGasIncluded?: boolean;
  solarRent: number;
  status: 'Paid' | 'Pending';
  lastReceivedDate: string;
  ledgerHistory: TenantLedgerEntry[];
}

export interface CommitteeMember {
  id: string;
  _id?: string;
  name: string;
  monthlyInstallment: number;
  payoutMonth?: string;
  status: 'Paid' | 'Pending';
}

export interface ExpenseItem {
  id: string;
  _id?: string;
  title: string;
  category: string;
  amount: number;
  date?: string;
}

export interface InvestmentItem {
  id: string;
  _id?: string;
  name: string;
  type: string;
  investedCapital: number;
  currentValuation: number;
}

export interface FinanceState {
  householdName: string;
  fiscalMonth: string;
  salary: number;
  portions: Portion[];
  committeeMembers: CommitteeMember[];
  expenses: ExpenseItem[];
  investments: InvestmentItem[];
  isLoading: boolean;
  isApiConnected: boolean;
  lastSyncedAt: string | null;
}
