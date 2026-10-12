import mongoose from 'mongoose';
import { PropertyUnit } from '../models/PropertyUnit';
import { RentPayment } from '../models/RentPayment';
import { Transaction } from '../models/Transaction';
import { Investment } from '../models/Investment';
import { Committee, CommitteeMember } from '../models/Committee';

export const seedDatabase = async () => {
  console.log('Seeding initial data for Home Management System...');

  // Clear existing
  await Promise.all([
    PropertyUnit.deleteMany({}),
    RentPayment.deleteMany({}),
    Transaction.deleteMany({}),
    Investment.deleteMany({}),
    Committee.deleteMany({}),
    CommitteeMember.deleteMany({}),
  ]);

  // 1. Seed Property Units
  const groundFloor = await PropertyUnit.create({
    portionName: 'Ground Floor (3-Bed Main)',
    unitCode: 'GF-01',
    description: 'Independent main ground portion with dedicated entrance and lawn',
    baseMonthlyRent: 65000,
    electricSubMeterReading: 4820,
    gasSubMeterReading: 1150,
    fixedUtilityCharge: 2500,
    isOccupied: true,
    tenant: {
      name: 'Tariq Mahmood',
      phone: '+92 300 1234567',
      email: 'tariq.mahmood@example.com',
      cnicOrId: '42101-1234567-1',
      securityDeposit: 130000,
      agreementStartDate: new Date('2025-06-01'),
      isActive: true,
    },
  });

  const upperPortion = await PropertyUnit.create({
    portionName: 'Upper Portion (2-Bed Luxury)',
    unitCode: 'UP-01',
    description: '1st floor portion with separate terrace and modern kitchen',
    baseMonthlyRent: 55000,
    electricSubMeterReading: 3120,
    gasSubMeterReading: 890,
    fixedUtilityCharge: 2000,
    isOccupied: true,
    tenant: {
      name: 'Kamran Siddiqui',
      phone: '+92 333 7654321',
      email: 'kamran.siddiqui@example.com',
      cnicOrId: '42201-9876543-3',
      securityDeposit: 110000,
      agreementStartDate: new Date('2026-01-15'),
      isActive: true,
    },
  });

  const rooftopStudio = await PropertyUnit.create({
    portionName: 'Rooftop Studio Unit',
    unitCode: 'RT-01',
    description: 'Penthouse studio with open terrace views',
    baseMonthlyRent: 30000,
    electricSubMeterReading: 120,
    gasSubMeterReading: 45,
    fixedUtilityCharge: 1500,
    isOccupied: false,
    tenant: null,
  });

  // 2. Seed Rent Payments for current month (Oct 2026)
  const gfRent = await RentPayment.create({
    unitId: groundFloor._id,
    tenantName: groundFloor.tenant.name,
    month: 10,
    year: 2026,
    dueDate: new Date('2026-10-05'),
    baseRent: 65000,
    utilitySplit: {
      electricUnitsConsumed: 180,
      electricRatePerUnit: 48,
      electricTotal: 8640,
      gasCharge: 1800,
      maintenanceOrWater: 2500,
      otherAdditions: 0,
      notes: 'Sub-meter units calculated for Sept-Oct cycle',
    },
    totalBilledAmount: 77940,
    amountPaid: 77940,
    balanceRemaining: 0,
    status: 'Received',
    paymentDate: new Date('2026-10-04'),
    paymentMethod: 'Bank Transfer',
    notes: 'Cleared via Meezan Bank Online',
  });

  const upRent = await RentPayment.create({
    unitId: upperPortion._id,
    tenantName: upperPortion.tenant.name,
    month: 10,
    year: 2026,
    dueDate: new Date('2026-10-08'),
    baseRent: 55000,
    utilitySplit: {
      electricUnitsConsumed: 140,
      electricRatePerUnit: 48,
      electricTotal: 6720,
      gasCharge: 1500,
      maintenanceOrWater: 2000,
      otherAdditions: 0,
    },
    totalBilledAmount: 65220,
    amountPaid: 35000,
    balanceRemaining: 30220,
    status: 'Partially Paid',
    paymentDate: new Date('2026-10-07'),
    paymentMethod: 'Online/EasyPaisa/JazzCash',
    notes: 'Partial payment paid; remaining 30,220 promised by Oct 15',
  });

  // 3. Transactions (Direct Integration of rent into primary income)
  await Transaction.create([
    {
      type: 'INCOME',
      category: 'Salary',
      amount: 350000,
      date: new Date('2026-10-01'),
      title: 'Monthly Executive Salary',
      paymentMethod: 'Bank Transfer',
      year: 2026,
      month: 10,
    },
    {
      type: 'INCOME',
      category: 'Rental Inflow',
      amount: 77940,
      date: new Date('2026-10-04'),
      title: `Rental Inflow - ${groundFloor.portionName} (${groundFloor.tenant.name})`,
      paymentMethod: 'Bank Transfer',
      referenceModel: 'RentPayment',
      referenceId: gfRent._id,
      year: 2026,
      month: 10,
    },
    {
      type: 'INCOME',
      category: 'Rental Inflow',
      amount: 35000,
      date: new Date('2026-10-07'),
      title: `Partial Rent - ${upperPortion.portionName} (${upperPortion.tenant.name})`,
      paymentMethod: 'Online/EasyPaisa/JazzCash',
      referenceModel: 'RentPayment',
      referenceId: upRent._id,
      year: 2026,
      month: 10,
    },
    // Household Expenses
    {
      type: 'EXPENSE',
      category: 'Groceries',
      amount: 52000,
      date: new Date('2026-10-03'),
      title: 'Monthly Bulk Grocery & Supermarket',
      paymentMethod: 'Credit Card',
      year: 2026,
      month: 10,
    },
    {
      type: 'EXPENSE',
      category: 'Utilities',
      amount: 41500,
      date: new Date('2026-10-06'),
      title: 'Main K-Electric & SSGC Utility Bills',
      paymentMethod: 'Online/EasyPaisa/JazzCash',
      year: 2026,
      month: 10,
    },
    {
      type: 'EXPENSE',
      category: 'Education',
      amount: 35000,
      date: new Date('2026-10-02'),
      title: 'Children School & Academy Tuition Fees',
      paymentMethod: 'Bank Transfer',
      year: 2026,
      month: 10,
    },
    {
      type: 'EXPENSE',
      category: 'Maintenance',
      amount: 14000,
      date: new Date('2026-10-05'),
      title: 'Water Booster Pump Repair & Plumbing',
      paymentMethod: 'Cash',
      year: 2026,
      month: 10,
    },
    {
      type: 'EXPENSE',
      category: 'Medical',
      amount: 8500,
      date: new Date('2026-10-08'),
      title: 'Prescription Medicines & Routine Clinic Checkup',
      paymentMethod: 'Cash',
      year: 2026,
      month: 10,
    },
  ]);

  // 4. Investments
  await Investment.create([
    {
      assetName: 'Al Meezan Sovereign Islamic Mutual Fund',
      assetType: 'Stocks / Mutual Funds',
      investedCapital: 1200000,
      currentValuation: 1420000,
      purchaseDate: new Date('2025-01-10'),
      status: 'Active',
      institutionOrBroker: 'Meezan Asset Management',
      notes: 'Shariah-compliant capital preservation & income fund',
    },
    {
      assetName: 'Physical Gold Bars (24K - 3 Tolas)',
      assetType: 'Physical Gold / Silver',
      investedCapital: 850000,
      currentValuation: 1080000,
      purchaseDate: new Date('2024-08-15'),
      status: 'Active',
      institutionOrBroker: 'Locker ARY Jewelers',
      notes: 'Long-term inflation hedge held in safe locker',
    },
    {
      assetName: 'National Savings Special Savings Certificates',
      assetType: 'Fixed Deposit / National Savings',
      investedCapital: 500000,
      currentValuation: 565000,
      purchaseDate: new Date('2025-05-20'),
      status: 'Active',
      institutionOrBroker: 'Central Directorate of National Savings',
      notes: 'Biannual profit disbursement',
    },
  ]);

  // 5. Dedicated Committee (ROSCA / Kameti) Module with EXACT Requested Seed Ledger
  // Ledger members:
  // - Shadia Aunty: 50,000
  // - Asma Aunty: 110,000
  // - Nono ki Ami: 40,000
  // - Anabia ki Dadi: 70,000
  // - Tehmina Bhabhi: 10,000
  // Total Monthly Pool = 50k + 110k + 40k + 70k + 10k = 280,000 / month
  // Total Months = 10 months -> Lifecycle Pool = 2,800,000

  const committee = await Committee.create({
    name: 'Khandan Annual Savings Kameti 2026',
    description: 'Family high-trust ROSCA committee for pooled capital allocation',
    monthlyPoolTotal: 280000,
    totalPoolLifecycleValue: 2800000,
    startDate: new Date('2026-06-01'),
    endDate: new Date('2027-03-31'),
    totalMonths: 10,
    status: 'Active',
    organizerName: 'Household Mother / Elder',
    notes: 'Monthly draw happens on the 5th of every calendar month',
  });

  const memberLedger = [
    {
      name: 'Shadia Aunty',
      installment: 50000,
      payoutMonth: 1, // June 2026 (Completed)
      payoutDate: new Date('2026-06-05'),
      isCompleted: true,
      actualPayout: new Date('2026-06-05'),
      statusOct: 'Paid' as const,
    },
    {
      name: 'Asma Aunty',
      installment: 110000,
      payoutMonth: 2, // July 2026 (Completed)
      payoutDate: new Date('2026-07-05'),
      isCompleted: true,
      actualPayout: new Date('2026-07-05'),
      statusOct: 'Paid' as const,
    },
    {
      name: 'Nono ki Ami',
      installment: 40000,
      payoutMonth: 5, // October 2026 (Current Active Month Payout!)
      payoutDate: new Date('2026-10-05'),
      isCompleted: false, // Scheduled for this month
      statusOct: 'Paid' as const,
    },
    {
      name: 'Anabia ki Dadi',
      installment: 70000,
      payoutMonth: 7, // December 2026
      payoutDate: new Date('2026-12-05'),
      isCompleted: false,
      statusOct: 'Pending' as const,
    },
    {
      name: 'Tehmina Bhabhi',
      installment: 10000,
      payoutMonth: 9, // February 2027
      payoutDate: new Date('2027-02-05'),
      isCompleted: false,
      statusOct: 'Pending' as const,
    },
  ];

  for (const m of memberLedger) {
    // Generate 5 months of contribution logs (June, July, August, September, October 2026)
    const contributions = [
      {
        monthIndex: 1,
        cycleLabel: 'Jun 2026',
        year: 2026,
        month: 6,
        dueDate: new Date('2026-06-05'),
        paidDate: new Date('2026-06-04'),
        amountDue: m.installment,
        amountPaid: m.installment,
        status: 'Paid' as const,
      },
      {
        monthIndex: 2,
        cycleLabel: 'Jul 2026',
        year: 2026,
        month: 7,
        dueDate: new Date('2026-07-05'),
        paidDate: new Date('2026-07-05'),
        amountDue: m.installment,
        amountPaid: m.installment,
        status: 'Paid' as const,
      },
      {
        monthIndex: 3,
        cycleLabel: 'Aug 2026',
        year: 2026,
        month: 8,
        dueDate: new Date('2026-08-05'),
        paidDate: new Date('2026-08-03'),
        amountDue: m.installment,
        amountPaid: m.installment,
        status: 'Paid' as const,
      },
      {
        monthIndex: 4,
        cycleLabel: 'Sep 2026',
        year: 2026,
        month: 9,
        dueDate: new Date('2026-09-05'),
        paidDate: new Date('2026-09-04'),
        amountDue: m.installment,
        amountPaid: m.installment,
        status: 'Paid' as const,
      },
      {
        monthIndex: 5,
        cycleLabel: 'Oct 2026',
        year: 2026,
        month: 10,
        dueDate: new Date('2026-10-05'),
        paidDate: m.statusOct === 'Paid' ? new Date('2026-10-04') : undefined,
        amountDue: m.installment,
        amountPaid: m.statusOct === 'Paid' ? m.installment : 0,
        status: m.statusOct,
      },
    ];

    const totalPaid = contributions.reduce((acc, c) => acc + c.amountPaid, 0);

    await CommitteeMember.create({
      committeeId: committee._id,
      memberName: m.name,
      monthlyInstallment: m.installment,
      payoutMonthIndex: m.payoutMonth,
      scheduledPayoutDate: m.payoutDate,
      isPayoutCompleted: m.isCompleted,
      actualPayoutDate: m.actualPayout,
      payoutAmount: 280000, // Full monthly pool goes to payout recipient
      contributions,
      totalContributedToDate: totalPaid,
      notes: `Registered member: ${m.name}`,
    });
  }

  console.log('Database seeded successfully with all initial records!');
};
