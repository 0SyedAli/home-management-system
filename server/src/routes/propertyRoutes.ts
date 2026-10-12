import { Router, Request, Response } from 'express';
import { PropertyUnit } from '../models/PropertyUnit';

const router = Router();

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
    const unit = await PropertyUnit.findById(req.params.id);
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
    const { portionName, unitCode, baseMonthlyRent, description, tenant } = req.body;
    const unit = await PropertyUnit.create({
      portionName,
      unitCode,
      baseMonthlyRent,
      description,
      isOccupied: Boolean(tenant?.name),
      tenant: tenant?.name ? tenant : null,
    });
    res.status(201).json({ success: true, data: unit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update unit or tenant details
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updateData = { ...req.body };
    if (updateData.tenant) {
      updateData.isOccupied = Boolean(updateData.tenant.name && updateData.tenant.isActive);
    }
    const unit = await PropertyUnit.findByIdAndUpdate(req.params.id, updateData, {
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
    const unit = await PropertyUnit.findByIdAndDelete(req.params.id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }
    res.json({ success: true, message: 'Unit deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
