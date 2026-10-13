"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentPayment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UtilitySplitSchema = new mongoose_1.Schema({
    electricUnitsConsumed: { type: Number, default: 0, min: 0 },
    electricRatePerUnit: { type: Number, default: 0, min: 0 },
    electricTotal: { type: Number, default: 0, min: 0 },
    gasCharge: { type: Number, default: 0, min: 0 },
    maintenanceOrWater: { type: Number, default: 0, min: 0 },
    otherAdditions: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true },
}, { _id: false });
const RentPaymentSchema = new mongoose_1.Schema({
    unitId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Transaction',
    },
}, {
    timestamps: true,
});
// Prevent duplicate monthly billing for the same unit & cycle
RentPaymentSchema.index({ unitId: 1, year: 1, month: 1 }, { unique: true });
// Pre-save hook to compute totals & balance automatically
RentPaymentSchema.pre('save', function (next) {
    const utilitiesTotal = (this.utilitySplit?.electricTotal || 0) +
        (this.utilitySplit?.gasCharge || 0) +
        (this.utilitySplit?.maintenanceOrWater || 0) +
        (this.utilitySplit?.otherAdditions || 0);
    this.totalBilledAmount = this.baseRent + utilitiesTotal;
    this.balanceRemaining = Math.max(0, this.totalBilledAmount - (this.amountPaid || 0));
    if (this.amountPaid >= this.totalBilledAmount) {
        this.status = 'Received';
    }
    else if (this.amountPaid > 0) {
        this.status = 'Partially Paid';
    }
    else {
        this.status = 'Pending';
    }
    next();
});
exports.RentPayment = mongoose_1.default.models.RentPayment ||
    mongoose_1.default.model('RentPayment', RentPaymentSchema);
