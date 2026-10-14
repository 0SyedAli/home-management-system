"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const seedData_1 = require("./seeds/seedData");
const cronService_1 = require("./services/cronService");
// In cPanel Phusion Passenger, process.env.PORT is provided dynamically
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/home_management_db';
// 1. Start HTTP Server immediately so Passenger/cPanel does NOT time out with 503
const server = app_1.default.listen(PORT, () => {
    console.log(`Household Financial API running on port ${PORT}`);
});
// 2. Initialize background cron jobs
(0, cronService_1.initCronJobs)();
// 3. Connect to MongoDB asynchronously
console.log('Connecting to MongoDB...');
mongoose_1.default.connect(MONGODB_URI)
    .then(async () => {
    console.log('MongoDB connection established successfully.');
    if (process.env.SEED_ON_START === 'true') {
        await (0, seedData_1.seedDatabase)();
    }
    // Check and initialize current month's status for committee members
    await (0, cronService_1.resetMonthlyCommitteeStatus)().catch((e) => console.log('Monthly status check:', e.message));
})
    .catch((error) => {
    console.error('MongoDB connection error (Check MongoDB Atlas Network Access IP Whitelist!):', error.message);
});
exports.default = server;
