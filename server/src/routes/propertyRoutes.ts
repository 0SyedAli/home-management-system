import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { PropertyUnit } from '../models/PropertyUnit';

const router = Router();

// Helper to get mongoose filter
const getUnitFilter = (id: string) => {
  return mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { unitCode: id };
};

// GET all property units
router.get('/', async (_req: Request, res: Response) => {
  try {
    const units = await PropertyUnit.find().sort({ portionName: 1 });
    res.json({ success: true, count: units.length, data: units });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single unit
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const unit = await PropertyUnit.findOne(getUnitFilter(req.params.id));
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }
    res.json({ success: true, data: unit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create unit
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      portionName,
      unitCode,
      baseMonthlyRent,
      description,
      electricSubMeterReading,
      gasSubMeterReading,
      fixedUtilityCharge,
      isElectricIncluded,
      isGasIncluded,
      rentStatus,
      lastReceivedDate,
      ledgerHistory,
      tenant,
    } = req.body;

    const unit = await PropertyUnit.create({
      portionName,
      unitCode: unitCode || `P-${Date.now().toString().slice(-4)}`,
      baseMonthlyRent: Number(baseMonthlyRent) || 0,
      description,
      electricSubMeterReading: Number(electricSubMeterReading) || 0,
      gasSubMeterReading: Number(gasSubMeterReading) || 0,
      fixedUtilityCharge: Number(fixedUtilityCharge) || 0,
      isElectricIncluded: Boolean(isElectricIncluded),
      isGasIncluded: Boolean(isGasIncluded),
      isOccupied: Boolean(tenant?.name),
      rentStatus: rentStatus || 'Pending',
      lastReceivedDate: lastReceivedDate || '',
      ledgerHistory: ledgerHistory || [],
      tenant: tenant?.name ? tenant : null,
    });
    res.status(201).json({ success: true, data: unit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH / PUT update status directly (1-click toggle status)
const updateStatusHandler = async (req: Request, res: Response) => {
  try {
    const { status, rentStatus, lastReceivedDate, ledgerEntry } = req.body;
    const targetStatus = status || rentStatus || 'Paid';

    const unit = await PropertyUnit.findOne(getUnitFilter(req.params.id));
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    unit.rentStatus = targetStatus;
    if (lastReceivedDate !== undefined) {
      unit.lastReceivedDate = lastReceivedDate;
    }
    if (ledgerEntry) {
      const remainingLedger = (unit.ledgerHistory || []).filter(
        (lh: any) => lh?.monthYear?.toLowerCase() !== ledgerEntry.monthYear?.toLowerCase()
      );
      unit.ledgerHistory = [ledgerEntry, ...remainingLedger];
    }

    await unit.save();
    res.json({ success: true, message: `Status updated to ${targetStatus}`, data: unit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

router.patch('/:id/status', updateStatusHandler);
router.put('/:id/status', updateStatusHandler);

// PUT update unit or tenant details
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updateData = { ...req.body };
    if (updateData.tenant !== undefined) {
      updateData.isOccupied = Boolean(updateData.tenant?.name && updateData.tenant?.isActive !== false);
    }
    const unit = await PropertyUnit.findOneAndUpdate(getUnitFilter(req.params.id), updateData, {
      new: true,
      runValidators: true,
    });
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }
    res.json({ success: true, data: unit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE unit
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const unit = await PropertyUnit.findOneAndDelete(getUnitFilter(req.params.id));
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }
    res.json({ success: true, message: 'Unit deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
