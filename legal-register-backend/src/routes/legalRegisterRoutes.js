import express from 'express';
import {
  createLegalRegister,
  getAllLegalRegisters,
  getLegalRegisterById,
  updateLegalRegister,
  deleteLegalRegister,
  getExpiryAlerts,
  getStatistics,
  getArchivedLegalRegisters,
  restoreLegalRegister
} from '../controllers/legalRegisterController.js';
import { protect } from '../middleware/auth.js';
import CronService from '../services/cronService.js';
import EmailLog from '../models/EmailLog.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @swagger
 * /legal-registers/stats/summary:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     active:
 *                       type: integer
 *                     expired:
 *                       type: integer
 *                     pendingRenewal:
 *                       type: integer
 *                     expiringSoon:
 *                       type: integer
 *                     overdue:
 *                       type: integer
 */
router.get('/stats/summary', getStatistics);

/**
 * @swagger
 * /legal-registers/alerts/expiry:
 *   get:
 *     summary: Get expiry alerts categorized by urgency
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     expired:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LegalRegister'
 *                     dueToday:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LegalRegister'
 *                     dueTwoDays:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LegalRegister'
 *                     dueWeek:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LegalRegister'
 *                     dueMonth:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LegalRegister'
 */
router.get('/alerts/expiry', getExpiryAlerts);

/**
 * @swagger
 * /legal-registers/archived:
 *   get:
 *     summary: Get archived legal registers
 *     tags: [Legal Registers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archived registers retrieved successfully
 */
router.get('/archived', getArchivedLegalRegisters);

// Test endpoints - only available in development
if (process.env.NODE_ENV !== 'production') {
  // Test endpoint to manually trigger email notifications
  router.post('/test/send-emails', async (req, res) => {
    try {
      logger.log('Manual email notification trigger by:', req.user.email);
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
      logger.log('Cleared all email logs by:', req.user.email);
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
}

/**
 * @swagger
 * /legal-registers:
 *   get:
 *     summary: Get all legal registers with pagination and filters
 *     tags: [Legal Registers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by permit name, document number, or issuing authority
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Expired, Pending Renewal, Cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of legal registers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LegalRegister'
 *   post:
 *     summary: Create a new legal register
 *     tags: [Legal Registers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LegalRegister'
 *     responses:
 *       201:
 *         description: Legal register created successfully
 *       400:
 *         description: Validation error
 */
router.route('/')
  .get(getAllLegalRegisters)
  .post(createLegalRegister);

/**
 * @swagger
 * /legal-registers/{id}:
 *   get:
 *     summary: Get a legal register by ID
 *     tags: [Legal Registers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Legal register ID
 *     responses:
 *       200:
 *         description: Legal register found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/LegalRegister'
 *       404:
 *         description: Legal register not found
 *   put:
 *     summary: Update a legal register
 *     tags: [Legal Registers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Legal register ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LegalRegister'
 *     responses:
 *       200:
 *         description: Legal register updated successfully
 *       404:
 *         description: Legal register not found
 *   delete:
 *     summary: Delete a legal register
 *     tags: [Legal Registers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Legal register ID
 *     responses:
 *       200:
 *         description: Legal register deleted successfully
 *       404:
 *         description: Legal register not found
 */
router.put('/:id/restore', restoreLegalRegister);

router.route('/:id')
  .get(getLegalRegisterById)
  .put(updateLegalRegister)
  .delete(deleteLegalRegister);

export default router;
