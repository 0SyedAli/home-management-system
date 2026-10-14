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

export interface CommitteePaymentRecord {
  monthYear: string; // e.g. "2026-10"
  status: 'Paid' | 'Partial' | 'Pending';
  paidDate?: string;
  amountPaid?: number;
  remainingDue?: number;
  notes?: string;
}

export interface CommitteeMember {
  id: string;
  _id?: string;
  name: string;
  memberName?: string;
  monthlyInstallment: number;
  startDate?: string;
  endDate?: string;
  payoutMonth: string;
  status: 'Paid' | 'Partial' | 'Pending';
  currentMonthPaidAmount?: number;
  currentMonthRemainingDue?: number;
  notes?: string;
  currentMonthYear?: string;
  paymentHistory?: CommitteePaymentRecord[];
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

export type CommitteePaymentStatus = 'Paid' | 'Partially Paid' | 'Pending' | 'Upcoming';

export interface CommitteePaymentTransaction {
  id: string;
  installmentId?: string;
  monthYear: string; // e.g. "Jan 2025"
  amount: number;
  paymentDate: string; // e.g. "2025-01-10"
  paymentMethod?: string;
  notes?: string;
  referenceNo?: string;
  createdAt?: string;
}

export interface ScheduledInstallment {
  id: string;
  monthIndex: number;
  monthYear: string; // e.g. "Jan 2025"
  monthKey: string; // e.g. "2025-01"
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  remainingDue: number;
  status: CommitteePaymentStatus;
  transactions: CommitteePaymentTransaction[];
  lastPaymentDate?: string;
  notes?: string;
}

export interface IndividualCommittee {
  id: string;
  _id?: string;
  locationId: string;
  locationName: string;
  name: string; // e.g. "Committee 1"
  membersCount: number;
  sharePerMember: number;
  monthlyAmount: number;
  startMonth: string; // e.g. "Jan 2025"
  endMonth: string; // e.g. "Aug 2025"
  durationMonths: number;
  totalExpectedAmount: number;
  totalPaidAmount: number;
  paidMonthsCount: number;
  status: 'Completed' | 'Partially Paid' | 'Pending' | 'Active' | 'Upcoming';
  myCommitteeMonth?: string; // e.g. "Oct 2026" (month when payout is scheduled)
  payoutAmount?: number; // expected payout pool
  isMyPayoutReceived?: boolean;
  installments: ScheduledInstallment[];
  notes?: string;
  color?: string;
  createdAt?: string;
}

export interface CommitteeLocation {
  id: string;
  _id?: string;
  name: string; // e.g. "Location 1"
  organizerName?: string;
  phone?: string;
  color: 'blue' | 'green' | 'amber' | 'purple' | 'teal';
  notes?: string;
}

export interface FinanceState {
  householdName: string;
  fiscalMonth: string;
  salary: number;
  portions: Portion[];
  committeeMembers: CommitteeMember[];
  committeeLocations: CommitteeLocation[];
  individualCommittees: IndividualCommittee[];
  expenses: ExpenseItem[];
  investments: InvestmentItem[];
  isLoading: boolean;
  isApiConnected: boolean;
  lastSyncedAt: string | null;
}
