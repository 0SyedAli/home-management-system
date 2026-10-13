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
exports.Transaction = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TransactionSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
TransactionSchema.pre('save', function (next) {
    if (this.date) {
        const d = new Date(this.date);
        this.year = d.getFullYear();
        this.month = d.getMonth() + 1;
    }
    next();
});
TransactionSchema.index({ type: 1, year: 1, month: 1 });
TransactionSchema.index({ category: 1, year: 1, month: 1 });
exports.Transaction = mongoose_1.default.models.Transaction ||
    mongoose_1.default.model('Transaction', TransactionSchema);
