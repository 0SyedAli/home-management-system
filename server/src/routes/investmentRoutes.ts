import { Router, Request, Response } from 'express';
import { Investment } from '../models/Investment';

const router = Router();

// GET all investments & portfolio totals
router.get('/', async (_req: Request, res: Response) => {
  try {
    const investments = await Investment.find().sort({ currentValuation: -1 });

    const totalInvested = investments.reduce((acc, item) => acc + item.investedCapital, 0);
    const totalValuation = investments.reduce((acc, item) => acc + item.currentValuation, 0);
    const totalReturn = totalValuation - totalInvested;
    const overallReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    res.json({
      success: true,
      data: {
        portfolioSummary: {
          totalInvested,
          totalValuation,
          totalReturn,
          overallReturnPercentage: Math.round(overallReturnPercentage * 100) / 100,
        },
        items: investments,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST add investment
router.post('/', async (req: Request, res: Response) => {
  try {
    const { assetName, assetType, investedCapital, currentValuation, purchaseDate, institutionOrBroker, notes } = req.body;
    const investment = await Investment.create({
      assetName,
      assetType,
      investedCapital,
      currentValuation: currentValuation ?? investedCapital,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      institutionOrBroker,
      notes,
    });
    res.status(201).json({ success: true, data: investment });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update investment (e.g. update current valuation)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }

    if (req.body.currentValuation !== undefined) {
      investment.currentValuation = Number(req.body.currentValuation);
    }
    if (req.body.investedCapital !== undefined) {
      investment.investedCapital = Number(req.body.investedCapital);
    }
    if (req.body.assetName) investment.assetName = req.body.assetName;
    if (req.body.assetType) investment.assetType = req.body.assetType;
    if (req.body.status) investment.status = req.body.status;
    if (req.body.notes) investment.notes = req.body.notes;

    await investment.save();
    res.json({ success: true, data: investment });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
