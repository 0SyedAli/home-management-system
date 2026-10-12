import mongoose, { Schema, Document, Types } from 'mongoose';

export type TransactionType = 'INCOME' | 'EXPENSE';

export type ExpenseCategory =
  | 'Groceries'
  | 'Utilities'
  | 'Maintenance'
  | 'Medical'
  | 'Education'
  | 'Committee Contribution'
  | 'Transportation'
  | 'Miscellaneous';

export type IncomeCategory =
  | 'Salary'
  | 'Rental Inflow'
  | 'Business / Freelance'
  | 'Investment Return'
  | 'Committee Payout'
  | 'Gift / Other Income';

export interface ITransaction extends Document {
  type: TransactionType;
  category: ExpenseCategory | IncomeCategory;
  amount: number;
  date: Date;
  title: string;
  notes?: string;
  paymentMethod: string;
  sourceOrPayee?: string;
  referenceModel?: 'RentPayment' | 'Committee' | 'Investment';
  referenceId?: Types.ObjectId;
  year: number;
  month: number;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: ['INCOME', 'EXPENSE'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      default: 'Cash',
      trim: true,
    },
    sourceOrPayee: {
      type: String,
      trim: true,
    },
    referenceModel: {
      type: String,
      enum: ['RentPayment', 'Committee', 'Investment', null],
      default: null,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

TransactionSchema.pre<ITransaction>('save', function (next) {
  if (this.date) {
    const d = new Date(this.date);
    this.year = d.getFullYear();
    this.month = d.getMonth() + 1;
  }
  next();
});

TransactionSchema.index({ type: 1, year: 1, month: 1 });
TransactionSchema.index({ category: 1, year: 1, month: 1 });

export const Transaction =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
