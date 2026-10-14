import {
  CommitteeLocation,
  IndividualCommittee,
  ScheduledInstallment,
  CommitteePaymentStatus,
  CommitteePaymentTransaction,
} from '../redux/types';

// Month names list
export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Parses a month string like "Jan 2025", "January 2025", or "2025-01" into { year, monthIndex (0-11) }
 */
export const parseMonthYear = (val: string): { year: number; month: number } => {
  if (!val) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }

  // Handle YYYY-MM
  if (/^\d{4}-\d{2}$/.test(val)) {
    const [y, m] = val.split('-');
    return { year: parseInt(y, 10), month: parseInt(m, 10) - 1 };
  }

  // Handle "Jan 2025" or "January 2025"
  const parts = val.trim().split(/\s+/);
  if (parts.length >= 2) {
    const mStr = parts[0].toLowerCase();
    const y = parseInt(parts[1], 10);
    const mIdx = MONTH_NAMES.findIndex(
      (m) => m.toLowerCase() === mStr || FULL_MONTH_NAMES.findIndex((fm) => fm.toLowerCase() === mStr) !== -1
    );
    const resolvedMonth = mIdx !== -1 ? mIdx : 0;
    return { year: isNaN(y) ? 2026 : y, month: resolvedMonth };
  }

  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return { year: d.getFullYear(), month: d.getMonth() };
  }

  return { year: 2026, month: 0 };
};

/**
 * Formats year and monthIndex (0-11) into "Jan 2025"
 */
export const formatShortMonth = (year: number, month: number): string => {
  const m = MONTH_NAMES[((month % 12) + 12) % 12];
  return `${m} ${year}`;
};

/**
 * Formats year and monthIndex (0-11) into "2025-01"
 */
export const formatMonthKey = (year: number, month: number): string => {
  const mStr = String(month + 1).padStart(2, '0');
  return `${year}-${mStr}`;
};

/**
 * Calculates End Month given Start Month and Duration (in months)
 * e.g. Start "Jan 2026" (month 0) + 8 months => End is month 7 => "Aug 2026"
 */
export const calculateEndMonth = (startMonthStr: string, durationMonths: number): string => {
  const { year, month } = parseMonthYear(startMonthStr);
  const totalMonths = Math.max(1, durationMonths);
  const endTotalMonth = month + totalMonths - 1;
  const endYear = year + Math.floor(endTotalMonth / 12);
  const endMonth = endTotalMonth % 12;
  return formatShortMonth(endYear, endMonth);
};

/**
 * Generates an array of scheduled installments for a committee
 */
export const generateInstallments = (
  committeeId: string,
  startMonthStr: string,
  durationMonths: number,
  monthlyAmount: number,
  paidCount: number = 0,
  partialPaidCount: number = 0,
  partialAmount: number = 0
): ScheduledInstallment[] => {
  const { year, month } = parseMonthYear(startMonthStr);
  const installments: ScheduledInstallment[] = [];

  for (let i = 0; i < durationMonths; i++) {
    const curTotalMonth = month + i;
    const curYear = year + Math.floor(curTotalMonth / 12);
    const curMonth = curTotalMonth % 12;

    const monthYear = formatShortMonth(curYear, curMonth);
    const monthKey = formatMonthKey(curYear, curMonth);
    const dueDate = `${monthKey}-05`;

    let status: CommitteePaymentStatus = 'Pending';
    let amountPaid = 0;
    const transactions: CommitteePaymentTransaction[] = [];

    if (i < paidCount) {
      status = 'Paid';
      amountPaid = monthlyAmount;
      transactions.push({
        id: `tx-${committeeId}-${i}-1`,
        monthYear,
        amount: monthlyAmount,
        paymentDate: `${curYear}-${String(curMonth + 1).padStart(2, '0')}-05`,
        paymentMethod: 'Bank Transfer',
        notes: 'Monthly installment paid',
        createdAt: new Date().toISOString(),
      });
    } else if (i === paidCount && partialPaidCount > 0 && partialAmount > 0) {
      status = 'Partially Paid';
      amountPaid = partialAmount;
      transactions.push({
        id: `tx-${committeeId}-${i}-1`,
        monthYear,
        amount: partialAmount,
        paymentDate: `${curYear}-${String(curMonth + 1).padStart(2, '0')}-05`,
        paymentMethod: 'Cash',
        notes: `Partial payment: Rs ${partialAmount.toLocaleString()}`,
        createdAt: new Date().toISOString(),
      });
    }

    const remainingDue = Math.max(0, monthlyAmount - amountPaid);

    installments.push({
      id: `inst-${committeeId}-${i + 1}`,
      monthIndex: i + 1,
      monthYear,
      monthKey,
      dueDate,
      amountDue: monthlyAmount,
      amountPaid,
      remainingDue,
      status,
      transactions,
      lastPaymentDate: transactions.length > 0 ? transactions[0].paymentDate : undefined,
    });
  }

  return installments;
};

/**
 * Determines current month status of a committee based on payment of active installment
 * Status is 'Completed' when the current month installment is paid (or all installments paid)
 */
export const getCommitteeCurrentMonthStatus = (
  committee: IndividualCommittee,
  targetMonthKey?: string
): 'Completed' | 'Partially Paid' | 'Pending' | 'Upcoming' => {
  // If whole committee lifecycle is fully paid:
  if (committee.paidMonthsCount === committee.durationMonths && committee.durationMonths > 0) {
    return 'Completed';
  }

  const now = new Date();
  const currentKey = targetMonthKey || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Find installment for current month
  const currentInst = committee.installments.find((i) => i.monthKey === currentKey);
  if (currentInst) {
    if (currentInst.status === 'Paid') return 'Completed';
    if (currentInst.status === 'Partially Paid') return 'Partially Paid';
    return 'Pending';
  }

  // If current month is past the end of the committee
  const lastInst = committee.installments[committee.installments.length - 1];
  if (lastInst && currentKey > lastInst.monthKey) {
    return committee.paidMonthsCount === committee.durationMonths ? 'Completed' : 'Pending';
  }

  // If current month is before the start
  const firstInst = committee.installments[0];
  if (firstInst && currentKey < firstInst.monthKey) {
    return 'Upcoming';
  }

  // Default to the first unpaid installment status
  const unpaidInst = committee.installments.find((i) => i.status !== 'Paid');
  if (unpaidInst) {
    return unpaidInst.status === 'Partially Paid' ? 'Partially Paid' : 'Pending';
  }

  return 'Completed';
};

/**
 * Re-evaluates a committee's computed properties from its installments
 */
export const recalculateCommittee = (
  committee: IndividualCommittee,
  targetMonthKey?: string
): IndividualCommittee => {
  const totalPaid = committee.installments.reduce((sum, inst) => sum + (inst.amountPaid || 0), 0);
  const fullyPaidCount = committee.installments.filter((inst) => inst.status === 'Paid').length;

  const currentStatus = getCommitteeCurrentMonthStatus(
    {
      ...committee,
      paidMonthsCount: fullyPaidCount,
    },
    targetMonthKey
  );

  return {
    ...committee,
    totalExpectedAmount: committee.monthlyAmount * committee.durationMonths,
    totalPaidAmount: totalPaid,
    paidMonthsCount: fullyPaidCount,
    status: currentStatus,
  };
};

/**
 * Clean empty initial locations and committees (all dummy data removed)
 */
export const DEFAULT_LOCATIONS: CommitteeLocation[] = [];

export const createDefaultCommittees = (): IndividualCommittee[] => [];
