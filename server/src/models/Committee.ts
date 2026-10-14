import mongoose, { Schema, Document, Types } from 'mongoose';

export type CommitteeStatus = 'Draft' | 'Active' | 'Completed' | 'Archived';
export type ContributionStatus = 'Paid' | 'Pending' | 'Overdue';

export interface IMonthlyContribution {
  _id?: Types.ObjectId;
  monthIndex: number; // 1 to totalMonths (e.g. 1st month, 2nd month)
  cycleLabel: string; // e.g. "Oct 2026"
  year: number;
  month: number;
  dueDate: Date;
  paidDate?: Date;
  amountDue: number;
  amountPaid: number;
  status: ContributionStatus;
  paymentMethod?: string;
  notes?: string;
}

export interface ICommitteePaymentRecord {
  monthYear: string; // e.g. "2026-10"
  status: 'Paid' | 'Partial' | 'Pending';
  paidDate?: Date;
  amountPaid: number;
  remainingDue?: number;
  notes?: string;
}

export interface ICommitteeMember extends Document {
  committeeId?: Types.ObjectId;
  memberName: string;
  phone?: string;
  monthlyInstallment: number;
  startDate?: string; // e.g. "2026-10"
  endDate?: string;   // e.g. "2027-09"
  payoutMonth: string; // e.g. "March 2027"
  status: 'Paid' | 'Partial' | 'Pending'; // Current month status
  currentMonthPaidAmount?: number;
  currentMonthRemainingDue?: number;
  paymentHistory: ICommitteePaymentRecord[];
  payoutMonthIndex?: number; // e.g., 1 for 1st payout
  scheduledPayoutDate?: Date;
  isPayoutCompleted?: boolean;
  actualPayoutDate?: Date;
  payoutAmount?: number;
  notes?: string;
  contributions: IMonthlyContribution[];
  totalContributedToDate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommittee extends Document {
  name: string;
  description?: string;
  monthlyPoolTotal: number; // Sum of all members' monthly contributions
  totalPoolLifecycleValue: number; // monthlyPoolTotal * totalMonths
  startDate: Date;
  endDate: Date;
  totalMonths: number;
  status: CommitteeStatus;
  organizerName: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MonthlyContributionSchema = new Schema<IMonthlyContribution>(
  {
    monthIndex: { type: Number, required: true },
    cycleLabel: { type: String, required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    amountDue: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue'],
      default: 'Pending',
    },
    paymentMethod: { type: String, default: 'Cash' },
    notes: { type: String, trim: true },
  },
  { _id: true }
);

const CommitteePaymentRecordSchema = new Schema<ICommitteePaymentRecord>(
  {
    monthYear: { type: String, required: true },
    status: {
      type: String,
      enum: ['Paid', 'Partial', 'Pending'],
      default: 'Pending',
    },
    paidDate: { type: Date },
    amountPaid: { type: Number, default: 0 },
    remainingDue: { type: Number, default: 0 },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const CommitteeMemberSchema = new Schema<ICommitteeMember>(
  {
    committeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Committee',
      required: false,
      index: true,
    },
    memberName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    monthlyInstallment: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: String,
      default: () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      },
    },
    endDate: {
      type: String,
      default: () => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      },
    },
    payoutMonth: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Paid', 'Partial', 'Pending'],
      default: 'Pending',
      index: true,
    },
    currentMonthPaidAmount: {
      type: Number,
      default: 0,
    },
    currentMonthRemainingDue: {
      type: Number,
      default: 0,
    },
    paymentHistory: {
      type: [CommitteePaymentRecordSchema],
      default: [],
    },
    payoutMonthIndex: {
      type: Number,
      default: 1,
      min: 1,
    },
    scheduledPayoutDate: {
      type: Date,
      required: false,
    },
    isPayoutCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    actualPayoutDate: {
      type: Date,
    },
    payoutAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    contributions: [MonthlyContributionSchema],
    totalContributedToDate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

CommitteeMemberSchema.index({ committeeId: 1, memberName: 1 });

const CommitteeSchema = new Schema<ICommittee>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    monthlyPoolTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPoolLifecycleValue: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalMonths: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Completed', 'Archived'],
      default: 'Active',
      index: true,
    },
    organizerName: {
      type: String,
      default: 'Self / Household',
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

export const Committee =
  (mongoose.models.Committee as mongoose.Model<ICommittee>) ||
  mongoose.model<ICommittee>('Committee', CommitteeSchema);

export const CommitteeMember =
  (mongoose.models.CommitteeMember as mongoose.Model<ICommitteeMember>) ||
  mongoose.model<ICommitteeMember>('CommitteeMember', CommitteeMemberSchema);
