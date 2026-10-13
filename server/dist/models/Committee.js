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
exports.CommitteeMember = exports.Committee = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const MonthlyContributionSchema = new mongoose_1.Schema({
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
}, { _id: true });
const CommitteeMemberSchema = new mongoose_1.Schema({
    committeeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Committee',
        required: true,
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
    payoutMonthIndex: {
        type: Number,
        required: true,
        min: 1,
    },
    scheduledPayoutDate: {
        type: Date,
        required: true,
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
        required: true,
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
}, {
    timestamps: true,
});
CommitteeMemberSchema.index({ committeeId: 1, memberName: 1 });
const CommitteeSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
exports.Committee = mongoose_1.default.models.Committee ||
    mongoose_1.default.model('Committee', CommitteeSchema);
exports.CommitteeMember = mongoose_1.default.models.CommitteeMember ||
    mongoose_1.default.model('CommitteeMember', CommitteeMemberSchema);
