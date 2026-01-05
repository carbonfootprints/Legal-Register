import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import CronService from './services/cronService.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import legalRegisterRoutes from './routes/legalRegisterRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Legal Register Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      legalRegisters: '/api/legal-registers',
      export: '/api/export'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/legal-registers', legalRegisterRoutes);
app.use('/api/export', exportRoutes);

// Test endpoint to manually trigger email check (for testing)
app.post('/api/cron/trigger-email-check', async (req, res) => {
  try {
    console.log('Manual email check triggered via API');
    const result = await CronService.triggerManualCheck();
    res.json({
      success: true,
      message: 'Email check completed',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start cron job for email notifications (only in development)
if (process.env.NODE_ENV !== 'production') {
  CronService.startRenewalNotificationJob();
}

// Start server (only in development, not on Vercel)
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('=====================================');
    console.log(`Server running in ${process.env.NODE_ENV} mode`);
    console.log(`Server listening on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}`);
    console.log('=====================================');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to unhandled promise rejection');
    process.exit(1);
  });
}

// Export for Vercel serverless
export default app;
