import express from 'express';
import upload from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Apply authentication middleware
router.use(protect);

// Upload single file
router.post('/single', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return the file URL
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Upload multiple files (for permit document and compliance report)
router.post('/documents', upload.fields([
  { name: 'permitDocument', maxCount: 1 },
  { name: 'complianceReport', maxCount: 1 }
]), (req, res) => {
  try {
    const response = {
      success: true,
      message: 'Files uploaded successfully',
      data: {}
    };

    if (req.files.permitDocument) {
      response.data.permitDocument = `/uploads/${req.files.permitDocument[0].filename}`;
    }

    if (req.files.complianceReport) {
      response.data.complianceReport = `/uploads/${req.files.complianceReport[0].filename}`;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete file
router.delete('/:filename', (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadsDir, req.params.filename);

    // Security check: ensure the file is within uploads directory
    if (!filePath.startsWith(uploadsDir)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file path'
      });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
