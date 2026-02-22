import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import CronService from './services/cronService.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/authRoutes.js';
import legalRegisterRoutes from './routes/legalRegisterRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

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

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Legal Register API Docs'
}));

// Serve swagger.json
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Legal Register Management System API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      legalRegisters: '/api/legal-registers',
      export: '/api/export',
      upload: '/api/upload'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/legal-registers', legalRegisterRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/upload', uploadRoutes);

// Test endpoint to manually trigger email check (for testing)
app.post('/api/cron/trigger-email-check', async (req, res) => {
  try {
    logger.log('Manual email check triggered via API');
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
    logger.important('=====================================');
    logger.important(`Server running in ${process.env.NODE_ENV} mode`);
    logger.important(`Server listening on port ${PORT}`);
    logger.important(`API URL: http://localhost:${PORT}`);
    logger.important('=====================================');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error(`Error: ${err.message}`);
    logger.error('Shutting down the server due to unhandled promise rejection');
    process.exit(1);
  });
}

// Export for Vercel serverless
export default app;
