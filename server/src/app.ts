import express from 'express';
import cors from 'cors';
import propertyRoutes from './routes/propertyRoutes';
import rentRoutes from './routes/rentRoutes';
import transactionRoutes from './routes/transactionRoutes';
import investmentRoutes from './routes/investmentRoutes';
import committeeRoutes from './routes/committeeRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Base Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'Household Financial & Rental Management API',
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
