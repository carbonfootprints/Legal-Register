import LegalRegister from '../models/LegalRegister.js';
import ExcelExport from '../utils/excelExport.js';
import PDFExport from '../utils/pdfExport.js';

// @desc    Export legal registers to Excel
// @route   GET /api/export/excel
// @access  Private
export const exportToExcel = async (req, res) => {
  try {
    // Build query based on filters (same as getAllLegalRegisters) - filter by user
    let query = { createdBy: req.user._id };

    if (req.query.search) {
      query.$or = [
        { permit: { $regex: req.query.search, $options: 'i' } },
        { documentNo: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.dateFrom || req.query.dateTo) {
      query.dueDateForRenewal = {};
      if (req.query.dateFrom) {
        query.dueDateForRenewal.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        query.dueDateForRenewal.$lte = new Date(req.query.dateTo);
      }
    }

    // Fetch data
    const data = await LegalRegister.find(query).sort({ slNo: 1 });

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found to export'
      });
    }

    // Generate Excel
    const buffer = await ExcelExport.generateLegalRegisterExcel(data);

    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=legal-register-${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Export legal registers to PDF
// @route   GET /api/export/pdf
// @access  Private
export const exportToPDF = async (req, res) => {
  try {
    // Build query based on filters - filter by user
    let query = { createdBy: req.user._id };

    if (req.query.search) {
      query.$or = [
        { permit: { $regex: req.query.search, $options: 'i' } },
        { documentNo: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.dateFrom || req.query.dateTo) {
      query.dueDateForRenewal = {};
      if (req.query.dateFrom) {
        query.dueDateForRenewal.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        query.dueDateForRenewal.$lte = new Date(req.query.dateTo);
      }
    }

    // Fetch data
    const data = await LegalRegister.find(query).sort({ slNo: 1 });

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found to export'
      });
    }

    // Generate PDF
    const buffer = await PDFExport.generateLegalRegisterPDF(data);

    // Send file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=legal-register-${Date.now()}.pdf`);
    res.send(buffer);
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
