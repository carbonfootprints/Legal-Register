import LegalRegister from "../models/LegalRegister.js";

// @desc    Create new legal register entry
// @route   POST /api/legal-registers
// @access  Private
export const createLegalRegister = async (req, res) => {
  try {
    const legalRegister = await LegalRegister.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: legalRegister,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all legal register entries with pagination, search, and filter
// @route   GET /api/legal-registers
// @access  Private
export const getAllLegalRegisters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query - exclude archived by default
    let query = { isArchived: false };

    // Text search (permit name or document number)
    if (req.query.search) {
      query.$or = [
        { permit: { $regex: req.query.search, $options: "i" } },
        { documentNo: { $regex: req.query.search, $options: "i" } },
        { issuingAuthority: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by responsibility
    if (req.query.responsibility) {
      query.responsibility = req.query.responsibility;
    }

    // Filter by date range (dueDateForRenewal)
    if (req.query.dateFrom || req.query.dateTo) {
      query.dueDateForRenewal = {};
      if (req.query.dateFrom) {
        query.dueDateForRenewal.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        query.dueDateForRenewal.$lte = new Date(req.query.dateTo);
      }
    }

    // Sorting
    let sortBy = {};
    if (req.query.sortBy) {
      const order = req.query.sortOrder === "desc" ? -1 : 1;
      sortBy[req.query.sortBy] = order;
    } else {
      sortBy = { slNo: 1 }; // Default sort by serial number
    }

    // Execute query
    const legalRegisters = await LegalRegister.find(query)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort(sortBy)
      .limit(limit)
      .skip(skip);

    // Get total count
    const total = await LegalRegister.countDocuments(query);

    res.json({
      success: true,
      count: legalRegisters.length,
      total: total,
      page: page,
      pages: Math.ceil(total / limit),
      data: legalRegisters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single legal register entry
// @route   GET /api/legal-registers/:id
// @access  Private
export const getLegalRegisterById = async (req, res) => {
  try {
    const legalRegister = await LegalRegister.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!legalRegister) {
      return res.status(404).json({
        success: false,
        message: "Legal register entry not found",
      });
    }

    res.json({
      success: true,
      data: legalRegister,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update legal register entry
// @route   PUT /api/legal-registers/:id
// @access  Private
export const updateLegalRegister = async (req, res) => {
  try {
    let legalRegister = await LegalRegister.findById(req.params.id);

    if (!legalRegister) {
      return res.status(404).json({
        success: false,
        message: "Legal register entry not found",
      });
    }

    legalRegister = await LegalRegister.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user._id,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    res.json({
      success: true,
      data: legalRegister,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete legal register entry
// @route   DELETE /api/legal-registers/:id
// @access  Private
export const deleteLegalRegister = async (req, res) => {
  try {
    const legalRegister = await LegalRegister.findById(req.params.id);

    if (!legalRegister) {
      return res.status(404).json({
        success: false,
        message: "Legal register entry not found",
      });
    }

    await legalRegister.deleteOne();

    res.json({
      success: true,
      message: "Legal register entry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get expiry alerts (for dashboard)
// @route   GET /api/legal-registers/alerts/expiry
// @access  Private
export const getExpiryAlerts = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(today.getDate() + 30);

    // Get entries expiring in next 30 days or already expired
    const alerts = await LegalRegister.find({
      dueDateForRenewal: { $lte: thirtyDaysLater },
      status: { $in: ["Active", "Pending Renewal"] },
    })
      .populate("createdBy", "name email")
      .sort({ dueDateForRenewal: 1 });

    // Categorize alerts
    const categorized = {
      expired: [],
      dueToday: [],
      dueTwoDays: [],
      dueWeek: [],
      dueMonth: [],
    };

    alerts.forEach((alert) => {
      const daysUntil = alert.daysUntilRenewal;

      if (daysUntil < 0) {
        categorized.expired.push(alert);
      } else if (daysUntil === 0) {
        categorized.dueToday.push(alert);
      } else if (daysUntil <= 2) {
        categorized.dueTwoDays.push(alert);
      } else if (daysUntil <= 7) {
        categorized.dueWeek.push(alert);
      } else if (daysUntil <= 30) {
        categorized.dueMonth.push(alert);
      }
    });

    res.json({
      success: true,
      data: categorized,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get statistics (for dashboard)
// @route   GET /api/legal-registers/stats/summary
// @access  Private
export const getStatistics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total counts
    const total = await LegalRegister.countDocuments();
    const active = await LegalRegister.countDocuments({ status: "Active" });
    const expired = await LegalRegister.countDocuments({ status: "Expired" });
    const pendingRenewal = await LegalRegister.countDocuments({
      status: "Pending Renewal",
    });

    // Expiring soon (next 7 days)
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    const expiringSoon = await LegalRegister.countDocuments({
      dueDateForRenewal: {
        $gte: today,
        $lte: sevenDaysLater,
      },
      status: { $in: ["Active", "Pending Renewal"] },
    });

    // Already past due date
    const overdue = await LegalRegister.countDocuments({
      dueDateForRenewal: { $lt: today },
      status: { $in: ["Active", "Pending Renewal"] },
    });

    res.json({
      success: true,
      data: {
        total,
        active,
        expired,
        pendingRenewal,
        expiringSoon,
        overdue,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get archived (expired) legal register entries
// @route   GET /api/legal-registers/archived
// @access  Private
export const getArchivedLegalRegisters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query for archived permits only
    let query = { isArchived: true };

    // Text search
    if (req.query.search) {
      query.$or = [
        { permit: { $regex: req.query.search, $options: "i" } },
        { documentNo: { $regex: req.query.search, $options: "i" } },
        { issuingAuthority: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Sorting
    let sortBy = {};
    if (req.query.sortBy) {
      const order = req.query.sortOrder === "desc" ? -1 : 1;
      sortBy[req.query.sortBy] = order;
    } else {
      sortBy = { archivedAt: -1 }; // Most recently archived first
    }

    // Execute query
    const legalRegisters = await LegalRegister.find(query)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort(sortBy)
      .limit(limit)
      .skip(skip);

    // Get total count
    const total = await LegalRegister.countDocuments(query);

    res.json({
      success: true,
      count: legalRegisters.length,
      total: total,
      page: page,
      pages: Math.ceil(total / limit),
      data: legalRegisters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
