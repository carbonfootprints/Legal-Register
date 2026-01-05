import express from 'express';
import { exportToExcel, exportToPDF } from '../controllers/exportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware
router.use(protect);

router.get('/excel', exportToExcel);
router.get('/pdf', exportToPDF);

export default router;
