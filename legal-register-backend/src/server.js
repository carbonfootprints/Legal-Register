import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
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

// Validate required environment variables before starting
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS', 'CRON_SECRET'];
const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin for uploads
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-eval needed for Swagger UI
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://validator.swagger.io"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      workerSrc: ["blob:"], // Swagger UI uses blob workers
    },
  },
}));

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

// Cron endpoint for Vercel/external cron services (secured with secret)
app.get('/api/cron/daily-email-check', async (req, res) => {
  try {
    // Verify cron secret for security (timing-safe comparison)
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      const expected = crypto.createHmac('sha256', cronSecret).update(`Bearer ${cronSecret}`).digest();
      const actual = crypto.createHmac('sha256', cronSecret).update(authHeader || '').digest();
      if (!crypto.timingSafeEqual(expected, actual)) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }
    }

    logger.log('Daily email check triggered via cron endpoint');
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

// Test endpoint to manually trigger email check (development only)
if (process.env.NODE_ENV !== 'production') {
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
}

// Error handler middleware (must be last)
app.use(errorHandler);

// Start cron job for email notifications
CronService.startRenewalNotificationJob();

// Handle unhandled promise rejections in all environments
process.on('unhandledRejection', (err) => {
  logger.error(`Error: ${err.message}`);
  logger.error('Shutting down the server due to unhandled promise rejection');
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.important('=====================================');
  logger.important(`Server running in ${process.env.NODE_ENV} mode`);
  logger.important(`Server listening on port ${PORT}`);
  logger.important(`API URL: http://localhost:${PORT}`);
  logger.important('=====================================');
});

export default app;
