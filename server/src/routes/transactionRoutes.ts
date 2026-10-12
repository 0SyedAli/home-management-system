import { Router, Request, Response } from 'express';
import { Transaction } from '../models/Transaction';

const router = Router();

// GET transactions with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, category, year, month, limit = 50 } = req.query;
    const filter: any = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (year) filter.year = Number(year);
    if (month) filter.month = Number(month);

    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create transaction (Income or Expense)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { type, category, amount, date, title, notes, paymentMethod, sourceOrPayee } = req.body;
    const txDate = date ? new Date(date) : new Date();

    const transaction = await Transaction.create({
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
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET monthly cashflow breakdown
router.get('/summary/monthly', async (req: Request, res: Response) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || new Date().getMonth() + 1;

    const monthlyTxs = await Transaction.find({ year, month });

    let totalIncome = 0;
    let totalExpense = 0;
    const expenseByCategory: Record<string, number> = {};
    const incomeByCategory: Record<string, number> = {};

    for (const tx of monthlyTxs) {
      if (tx.type === 'INCOME') {
        totalIncome += tx.amount;
        incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + tx.amount;
      } else {
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE transaction
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const tx = await Transaction.findByIdAndDelete(req.params.id);
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
