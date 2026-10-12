import mongoose, { Schema, Document } from 'mongoose';

export type AssetType =
  | 'Stocks / Mutual Funds'
  | 'Real Estate / Land'
  | 'Physical Gold / Silver'
  | 'Fixed Deposit / National Savings'
  | 'Crypto'
  | 'Private Business Equity'
  | 'Other';

export interface IInvestment extends Document {
  assetName: string;
  assetType: AssetType;
  investedCapital: number;
  currentValuation: number;
  unrealizedReturn: number;
  returnPercentage: number;
  purchaseDate: Date;
  status: 'Active' | 'Liquidated' | 'Matured';
  institutionOrBroker?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvestmentSchema = new Schema<IInvestment>(
  {
    assetName: {
      type: String,
      required: true,
      trim: true,
    },
    assetType: {
      type: String,
      required: true,
      enum: [
        'Stocks / Mutual Funds',
        'Real Estate / Land',
        'Physical Gold / Silver',
        'Fixed Deposit / National Savings',
        'Crypto',
        'Private Business Equity',
        'Other',
      ],
      index: true,
    },
    investedCapital: {
      type: Number,
      required: true,
      min: 0,
    },
    currentValuation: {
      type: Number,
      required: true,
      min: 0,
    },
    unrealizedReturn: {
      type: Number,
      default: 0,
    },
    returnPercentage: {
      type: Number,
      default: 0,
    },
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Active', 'Liquidated', 'Matured'],
      default: 'Active',
      index: true,
    },
    institutionOrBroker: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

InvestmentSchema.pre<IInvestment>('save', function (next) {
  this.unrealizedReturn = this.currentValuation - this.investedCapital;
  this.returnPercentage =
    this.investedCapital > 0 ? (this.unrealizedReturn / this.investedCapital) * 100 : 0;
  next();
});

export const Investment =
  mongoose.models.Investment || mongoose.model<IInvestment>('Investment', InvestmentSchema);
