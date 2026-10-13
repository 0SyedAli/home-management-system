import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { RentPayment } from '../models/RentPayment';
import { PropertyUnit } from '../models/PropertyUnit';
import { Transaction } from '../models/Transaction';

const router = Router();

// GET rent records with optional filters (unitId, year, month, status)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { unitId, year, month, status } = req.query;
    const filter: any = {};

    if (unitId) filter.unitId = unitId;
    if (year) filter.year = Number(year);
    if (month) filter.month = Number(month);
    if (status) filter.status = status;

    const payments = await RentPayment.find(filter)
      .populate('unitId', 'portionName unitCode')
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.json({ success: true, count: payments.length, data: payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET rent history for a specific unit
router.get('/unit/:unitId/history', async (req: Request, res: Response) => {
  try {
    const history = await RentPayment.find({ unitId: req.params.unitId })
      .sort({ year: -1, month: -1 });
    res.json({ success: true, count: history.length, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST generate or upsert monthly rent bill with utility splits
router.post('/bill', async (req: Request, res: Response) => {
  try {
    const {
      unitId,
      month,
      year,
      dueDate,
      baseRent,
      electricUnitsConsumed,
      electricRatePerUnit,
      electricTotal,
      gasCharge,
      maintenanceOrWater,
      otherAdditions,
      notes,
    } = req.body;

    const unit = await PropertyUnit.findById(unitId);
    if (!unit || !unit.tenant) {
      return res.status(400).json({ success: false, message: 'Invalid unit or unit is currently vacant' });
    }

    const electricCalc = electricTotal || (Number(electricUnitsConsumed || 0) * Number(electricRatePerUnit || 0));
    const totalBilled = (baseRent || unit.baseMonthlyRent) + electricCalc + Number(gasCharge || 0) + Number(maintenanceOrWater || 0) + Number(otherAdditions || 0);

    const payment = await RentPayment.findOneAndUpdate(
      { unitId, year, month },
      {
        unitId,
        tenantName: unit.tenant.name,
        month,
        year,
        dueDate: dueDate || new Date(year, month - 1, 5),
        baseRent: baseRent || unit.baseMonthlyRent,
        utilitySplit: {
          electricUnitsConsumed: electricUnitsConsumed || 0,
          electricRatePerUnit: electricRatePerUnit || 0,
          electricTotal: electricCalc,
          gasCharge: gasCharge || 0,
          maintenanceOrWater: maintenanceOrWater || 0,
          otherAdditions: otherAdditions || 0,
          notes,
        },
        totalBilledAmount: totalBilled,
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: payment });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST "Collect Rent" - Logs collection & directly feeds into Primary Monthly Income
router.post('/collect', async (req: Request, res: Response) => {
  try {
    const {
      rentPaymentId,
      unitId,
      month,
      year,
      amountReceived,
      paymentMethod,
      paymentDate,
      notes,
    } = req.body;

    const now = new Date();
    const payDate = paymentDate ? new Date(paymentDate) : now;
    const currentMonth = month ? Number(month) : (payDate.getMonth() + 1);
    const currentYear = year ? Number(year) : payDate.getFullYear();

    let payment;
    if (rentPaymentId) {
      payment = await RentPayment.findById(rentPaymentId);
    } else if (unitId) {
      payment = await RentPayment.findOne({ unitId, month: currentMonth, year: currentYear });
    }

    const unitFilter = mongoose.Types.ObjectId.isValid(unitId) ? { _id: unitId } : { unitCode: unitId };
    const unit = await PropertyUnit.findOne(unitFilter);

    if (!payment) {
      payment = new RentPayment({
        unitId: unit ? unit._id : undefined,
        tenantName: unit?.tenant?.name || 'Tenant',
        month: currentMonth,
        year: currentYear,
        dueDate: payDate,
        baseRent: unit?.baseMonthlyRent || Number(amountReceived) || 0,
        totalBilledAmount: unit?.baseMonthlyRent || Number(amountReceived) || 0,
        amountPaid: 0,
        status: 'Pending',
      });
    }

    const previousPaid = payment.amountPaid || 0;
    const newlyReceived = Number(amountReceived);
    payment.amountPaid = previousPaid + newlyReceived;
    payment.paymentDate = payDate;
    payment.paymentMethod = paymentMethod || 'Cash';
    payment.status = 'Received';
    if (notes) payment.notes = notes;

    await payment.save();

    // Synchronize PropertyUnit rentStatus
    if (unit) {
      unit.rentStatus = 'Paid';
      unit.lastReceivedDate = paymentDate || 'Today';
      await unit.save();
    }
    const unitLabel = unit ? unit.portionName : 'Rental Portion';
    const baseRentIncome = Math.min(newlyReceived, payment.baseRent);
    let incomeTx: any = null;

    if (baseRentIncome > 0) {
      incomeTx = await Transaction.create({
        type: 'INCOME',
        category: 'Rental Inflow',
        amount: baseRentIncome,
        date: payment.paymentDate,
        title: `Rental Inflow: ${unitLabel} (${payment.tenantName})`,
        notes: `Base rent collected for ${payment.month}/${payment.year} (Gas & Electric utility splits excluded from income). Method: ${payment.paymentMethod}`,
        paymentMethod: payment.paymentMethod,
        sourceOrPayee: payment.tenantName,
        referenceModel: 'RentPayment',
        referenceId: payment._id,
        year: payment.year,
        month: payment.month,
      });

      payment.linkedTransactionId = incomeTx._id;
      await payment.save();
    }

    res.json({
      success: true,
      message: 'Rent collected successfully and integrated into Monthly Income Transactions',
      data: {
        payment,
        transaction: incomeTx,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
