"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Transaction_1 = require("../models/Transaction");
const Investment_1 = require("../models/Investment");
const Committee_1 = require("../models/Committee");
const PropertyUnit_1 = require("../models/PropertyUnit");
const RentPayment_1 = require("../models/RentPayment");
const router = (0, express_1.Router)();
router.get('/metrics', async (req, res) => {
    try {
        const year = Number(req.query.year) || new Date().getFullYear();
        const month = Number(req.query.month) || new Date().getMonth() + 1;
        // 1. Transactions for current month
        const monthlyTransactions = await Transaction_1.Transaction.find({ year, month });
        let salaryIncome = 0;
        let rentalIncome = 0;
        let otherIncome = 0;
        let householdExpenses = 0;
        const expenseCategoryMap = {
            Groceries: 0,
            Utilities: 0,
            Maintenance: 0,
            Medical: 0,
            Education: 0,
            Miscellaneous: 0,
        };
        for (const tx of monthlyTransactions) {
            if (tx.type === 'INCOME') {
                if (tx.category === 'Salary') {
                    salaryIncome += tx.amount;
                }
                else if (tx.category === 'Rental Inflow') {
                    rentalIncome += tx.amount;
                }
                else {
                    otherIncome += tx.amount;
                }
            }
            else {
                householdExpenses += tx.amount;
                if (expenseCategoryMap[tx.category] !== undefined) {
                    expenseCategoryMap[tx.category] += tx.amount;
                }
                else {
                    expenseCategoryMap['Miscellaneous'] = (expenseCategoryMap['Miscellaneous'] || 0) + tx.amount;
                }
            }
        }
        const totalMonthlyIncome = salaryIncome + rentalIncome + otherIncome;
        const netMonthlySavings = totalMonthlyIncome - householdExpenses;
        const savingsRatio = totalMonthlyIncome > 0 ? (netMonthlySavings / totalMonthlyIncome) * 100 : 0;
        // 2. Active Investments
        const investments = await Investment_1.Investment.find({ status: 'Active' });
        const totalInvestmentsValuation = investments.reduce((acc, inv) => acc + inv.currentValuation, 0);
        const totalInvestedCapital = investments.reduce((acc, inv) => acc + inv.investedCapital, 0);
        const unrealizedGains = totalInvestmentsValuation - totalInvestedCapital;
        // 3. Committee Dues (Receivable / Payable)
        // Find all committee members contributions for this month & year
        const allMembers = await Committee_1.CommitteeMember.find();
        let committeeReceivableFromMembers = 0;
        let committeeCollectedThisMonth = 0;
        let upcomingPayoutForHousehold = 0;
        for (const member of allMembers) {
            const currentMonthContrib = member.contributions.find((c) => c.year === year && c.month === month);
            if (currentMonthContrib) {
                if (currentMonthContrib.status === 'Pending' || currentMonthContrib.status === 'Overdue') {
                    committeeReceivableFromMembers += currentMonthContrib.amountDue;
                }
                else if (currentMonthContrib.status === 'Paid') {
                    committeeCollectedThisMonth += currentMonthContrib.amountPaid;
                }
            }
            // Check if scheduled payout this month
            if (member.payoutMonthIndex === month && !member.isPayoutCompleted) {
                upcomingPayoutForHousehold += member.payoutAmount;
            }
        }
        // 4. Rental Portions Status Overview
        const totalUnits = await PropertyUnit_1.PropertyUnit.countDocuments();
        const occupiedUnits = await PropertyUnit_1.PropertyUnit.countDocuments({ isOccupied: true });
        const currentMonthRentRecords = await RentPayment_1.RentPayment.find({ year, month });
        const rentReceivedThisMonth = currentMonthRentRecords.reduce((acc, r) => acc + r.amountPaid, 0);
        const rentPendingThisMonth = currentMonthRentRecords.reduce((acc, r) => acc + (r.balanceRemaining || 0), 0);
        res.json({
            success: true,
            data: {
                cycle: { year, month },
                kpis: {
                    totalMonthlyIncome,
                    incomeBreakdown: {
                        salary: salaryIncome,
                        rentalInflow: rentalIncome,
                        other: otherIncome,
                    },
                    householdExpenses,
                    netMonthlySavings,
                    savingsRatio: Math.round(savingsRatio * 10) / 10,
                    activeInvestments: {
                        currentValuation: totalInvestmentsValuation,
                        investedCapital: totalInvestedCapital,
                        unrealizedGains,
                        assetCount: investments.length,
                    },
                    committeeDues: {
                        receivablePending: committeeReceivableFromMembers,
                        collectedThisMonth: committeeCollectedThisMonth,
                        scheduledPayoutDue: upcomingPayoutForHousehold,
                    },
                    rentalPortions: {
                        totalUnits,
                        occupiedUnits,
                        vacantUnits: totalUnits - occupiedUnits,
                        rentReceived: rentReceivedThisMonth,
                        rentPending: rentPendingThisMonth,
                    },
                },
                expenseBreakdown: expenseCategoryMap,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
