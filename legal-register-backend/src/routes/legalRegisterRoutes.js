import express from 'express';
import {
  createLegalRegister,
  getAllLegalRegisters,
  getLegalRegisterById,
  updateLegalRegister,
  deleteLegalRegister,
  getExpiryAlerts,
  getStatistics,
  getArchivedLegalRegisters
} from '../controllers/legalRegisterController.js';
import { protect } from '../middleware/auth.js';
import CronService from '../services/cronService.js';
import EmailLog from '../models/EmailLog.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Statistics and alerts routes (must be before :id route)
router.get('/stats/summary', getStatistics);
router.get('/alerts/expiry', getExpiryAlerts);
router.get('/archived', getArchivedLegalRegisters);

// Test endpoint to manually trigger email notifications
router.post('/test/send-emails', async (req, res) => {
  try {
    console.log('Manual email notification trigger by:', req.user.email);
    const result = await CronService.checkAndSendReminders();
    res.json({
      success: true,
      message: 'Email notification check completed',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test endpoint to clear email logs (for testing only)
router.delete('/test/clear-email-logs', async (req, res) => {
  try {
    const result = await EmailLog.deleteMany({});
    console.log('Cleared all email logs by:', req.user.email);
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} email logs`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// CRUD routes
router.route('/')
  .get(getAllLegalRegisters)
  .post(createLegalRegister);

router.route('/:id')
  .get(getLegalRegisterById)
  .put(updateLegalRegister)
  .delete(deleteLegalRegister);

export default router;
