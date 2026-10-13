"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Transaction_1 = require("../models/Transaction");
const router = (0, express_1.Router)();
// GET transactions with filters
router.get('/', async (req, res) => {
    try {
        const { type, category, year, month, limit = 50 } = req.query;
        const filter = {};
        if (type)
            filter.type = type;
        if (category)
            filter.category = category;
        if (year)
            filter.year = Number(year);
        if (month)
            filter.month = Number(month);
        const transactions = await Transaction_1.Transaction.find(filter)
            .sort({ date: -1, createdAt: -1 })
            .limit(Number(limit));
        res.json({ success: true, count: transactions.length, data: transactions });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// POST create transaction (Income or Expense)
router.post('/', async (req, res) => {
    try {
        const { type, category, amount, date, title, notes, paymentMethod, sourceOrPayee } = req.body;
        const txDate = date ? new Date(date) : new Date();
        const transaction = await Transaction_1.Transaction.create({
            type,
            category,
            amount: Number(amount),
            date: txDate,
            title,
            notes,
            paymentMethod: paymentMethod || 'Cash',
            sourceOrPayee,
            year: txDate.getFullYear(),
            month: txDate.getMonth() + 1,
        });
        res.status(201).json({ success: true, data: transaction });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// GET monthly cashflow breakdown
router.get('/summary/monthly', async (req, res) => {
    try {
        const year = Number(req.query.year) || new Date().getFullYear();
        const month = Number(req.query.month) || new Date().getMonth() + 1;
        const monthlyTxs = await Transaction_1.Transaction.find({ year, month });
        let totalIncome = 0;
        let totalExpense = 0;
        const expenseByCategory = {};
        const incomeByCategory = {};
        for (const tx of monthlyTxs) {
            if (tx.type === 'INCOME') {
                totalIncome += tx.amount;
                incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + tx.amount;
            }
            else {
                totalExpense += tx.amount;
                expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
            }
        }
        const netSavings = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
        res.json({
            success: true,
            data: {
                year,
                month,
                totalIncome,
                totalExpense,
                netSavings,
                savingsRate: Math.round(savingsRate * 10) / 10,
                incomeByCategory,
                expenseByCategory,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// DELETE transaction
router.delete('/:id', async (req, res) => {
    try {
        const tx = await Transaction_1.Transaction.findByIdAndDelete(req.params.id);
        if (!tx) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }
        res.json({ success: true, message: 'Transaction deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
