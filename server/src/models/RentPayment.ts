import mongoose, { Schema, Document, Types } from 'mongoose';

export type RentPaymentStatus = 'Pending' | 'Partially Paid' | 'Received';
export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Online/EasyPaisa/JazzCash' | 'Cheque';

export interface IUtilitySplit {
  electricUnitsConsumed?: number;
  electricRatePerUnit?: number;
  electricTotal: number;
  gasCharge: number;
  maintenanceOrWater: number;
  otherAdditions: number;
  notes?: string;
}

export interface IRentPayment extends Document {
  unitId: Types.ObjectId;
  tenantName: string;
  month: number; // 1 - 12
  year: number; // e.g. 2026
  dueDate: Date;
  baseRent: number;
  utilitySplit: IUtilitySplit;
  totalBilledAmount: number;
  amountPaid: number;
  balanceRemaining: number;
  status: RentPaymentStatus;
  paymentDate?: Date;
  paymentMethod?: PaymentMethod;
  notes?: string;
  linkedTransactionId?: Types.ObjectId; // Reference to Income Transaction
  createdAt: Date;
  updatedAt: Date;
}

const UtilitySplitSchema = new Schema<IUtilitySplit>(
  {
    electricUnitsConsumed: { type: Number, default: 0, min: 0 },
    electricRatePerUnit: { type: Number, default: 0, min: 0 },
    electricTotal: { type: Number, default: 0, min: 0 },
    gasCharge: { type: Number, default: 0, min: 0 },
    maintenanceOrWater: { type: Number, default: 0, min: 0 },
    otherAdditions: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const RentPaymentSchema = new Schema<IRentPayment>(
  {
    unitId: {
      type: Schema.Types.ObjectId,
      ref: 'PropertyUnit',
      required: true,
      index: true,
    },
    tenantName: {
      type: String,
      required: true,
      trim: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2020,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    baseRent: {
      type: Number,
      required: true,
      min: 0,
    },
    utilitySplit: {
      type: UtilitySplitSchema,
      default: () => ({
        electricUnitsConsumed: 0,
        electricRatePerUnit: 0,
        electricTotal: 0,
        gasCharge: 0,
        maintenanceOrWater: 0,
        otherAdditions: 0,
      }),
    },
    totalBilledAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceRemaining: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Partially Paid', 'Received'],
      default: 'Pending',
      index: true,
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Online/EasyPaisa/JazzCash', 'Cheque'],
      default: 'Cash',
    },
    notes: {
      type: String,
      trim: true,
    },
    linkedTransactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate monthly billing for the same unit & cycle
RentPaymentSchema.index({ unitId: 1, year: 1, month: 1 }, { unique: true });

// Pre-save hook to compute totals & balance automatically
RentPaymentSchema.pre<IRentPayment>('save', function (next) {
  const utilitiesTotal =
    (this.utilitySplit?.electricTotal || 0) +
    (this.utilitySplit?.gasCharge || 0) +
    (this.utilitySplit?.maintenanceOrWater || 0) +
    (this.utilitySplit?.otherAdditions || 0);

  this.totalBilledAmount = this.baseRent + utilitiesTotal;
  this.balanceRemaining = Math.max(0, this.totalBilledAmount - (this.amountPaid || 0));

  if (this.amountPaid >= this.totalBilledAmount) {
    this.status = 'Received';
  } else if (this.amountPaid > 0) {
    this.status = 'Partially Paid';
  } else {
    this.status = 'Pending';
  }

  next();
});

export const RentPayment =
  (mongoose.models.RentPayment as mongoose.Model<IRentPayment>) ||
  mongoose.model<IRentPayment>('RentPayment', RentPaymentSchema);
