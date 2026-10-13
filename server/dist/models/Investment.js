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
exports.Investment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const InvestmentSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
InvestmentSchema.pre('save', function (next) {
    this.unrealizedReturn = this.currentValuation - this.investedCapital;
    this.returnPercentage =
        this.investedCapital > 0 ? (this.unrealizedReturn / this.investedCapital) * 100 : 0;
    next();
});
exports.Investment = mongoose_1.default.models.Investment ||
    mongoose_1.default.model('Investment', InvestmentSchema);
