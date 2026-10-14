"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const propertyRoutes_1 = __importDefault(require("./routes/propertyRoutes"));
const rentRoutes_1 = __importDefault(require("./routes/rentRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const investmentRoutes_1 = __importDefault(require("./routes/investmentRoutes"));
const committeeRoutes_1 = __importDefault(require("./routes/committeeRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const app = (0, express_1.default)();
const mongoose_1 = __importDefault(require("mongoose"));
// Middlewares
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
app.options('*', (0, cors_1.default)());
app.use(express_1.default.json());
// Root Route for cPanel browser visits
app.get('/', (_req, res) => {
    res.json({
        status: 'online',
        service: 'Household Financial & Rental Management API',
        database: mongoose_1.default.connection.readyState === 1 ? 'Connected (MongoDB Atlas)' : 'Connecting / Offline',
        health: '/api/health',
        timestamp: new Date().toISOString(),
    });
});
// Base Health Check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'online',
        service: 'Household Financial & Rental Management API',
        database: mongoose_1.default.connection.readyState === 1 ? 'Connected (MongoDB Atlas)' : 'Connecting / Offline',
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/properties', propertyRoutes_1.default);
app.use('/api/rent', rentRoutes_1.default);
app.use('/api/transactions', transactionRoutes_1.default);
app.use('/api/investments', investmentRoutes_1.default);
app.use('/api/committees', committeeRoutes_1.default);
// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});
exports.default = app;
