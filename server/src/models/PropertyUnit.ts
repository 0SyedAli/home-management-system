import mongoose, { Schema, Document } from 'mongoose';

export interface ITenantDetails {
  name: string;
  phone: string;
  email?: string;
  cnicOrId?: string;
  securityDeposit: number;
  agreementStartDate: Date;
  agreementEndDate?: Date;
  isActive: boolean;
}

export interface IPropertyUnit extends Document {
  portionName: string; // e.g. "Ground Floor", "1st Floor - Front", "Upper Portion"
  unitCode: string; // e.g. "GF-01", "UP-02"
  description?: string;
  baseMonthlyRent: number;
  electricSubMeterReading?: number; // Last recorded reading for utility splitting
  gasSubMeterReading?: number;
  fixedUtilityCharge?: number;
  isOccupied: boolean;
  tenant?: ITenantDetails;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenantDetails>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    cnicOrId: { type: String, trim: true },
    securityDeposit: { type: Number, required: true, min: 0, default: 0 },
    agreementStartDate: { type: Date, required: true },
    agreementEndDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const PropertyUnitSchema = new Schema<IPropertyUnit>(
  {
    portionName: {
      type: String,
      required: [true, 'Portion name is required (e.g. Ground Floor, Upper Portion)'],
      trim: true,
    },
    unitCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, trim: true },
    baseMonthlyRent: {
      type: Number,
      required: [true, 'Base monthly rent is required'],
      min: 0,
    },
    electricSubMeterReading: { type: Number, default: 0, min: 0 },
    gasSubMeterReading: { type: Number, default: 0, min: 0 },
    fixedUtilityCharge: { type: Number, default: 0, min: 0 },
    isOccupied: { type: Boolean, default: false },
    tenant: { type: TenantSchema, default: null },
  },
  {
    timestamps: true,
  }
);

PropertyUnitSchema.index({ unitCode: 1 });
PropertyUnitSchema.index({ isOccupied: 1 });

export const PropertyUnit = mongoose.models.PropertyUnit || mongoose.model<IPropertyUnit>('PropertyUnit', PropertyUnitSchema);
