import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import propertyRoutes from './routes/propertyRoutes';
import rentRoutes from './routes/rentRoutes';
import transactionRoutes from './routes/transactionRoutes';
import investmentRoutes from './routes/investmentRoutes';
import committeeRoutes from './routes/committeeRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

const app = express();

import mongoose from 'mongoose';

// Middlewares
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
app.options('*', cors());
app.use(express.json());

// Root Route for cPanel browser visits
app.get('/', (_req, res) => {
  res.json({
    status: 'online',
    service: 'Household Financial & Rental Management API',
    database: mongoose.connection.readyState === 1 ? 'Connected (MongoDB Atlas)' : 'Connecting / Offline',
    health: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

// Base Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'Household Financial & Rental Management API',
    database: mongoose.connection.readyState === 1 ? 'Connected (MongoDB Atlas)' : 'Connecting / Offline',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/rent', rentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/committees', committeeRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
