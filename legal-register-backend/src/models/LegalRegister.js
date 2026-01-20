import mongoose from 'mongoose';

const legalRegisterSchema = new mongoose.Schema({
  slNo: {
    type: Number,
    unique: true
  },
  permit: {
    type: String,
    required: [true, 'Permit name is required'],
    trim: true
  },
  documentNo: {
    type: String,
    required: [true, 'Document number is required'],
    trim: true
  },
  issuingAuthority: {
    type: String,
    required: [true, 'Issuing authority is required'],
    trim: true
  },
  dateOfIssue: {
    type: Date,
    required: [true, 'Date of issue is required']
  },
  dateOfExpiry: {
    type: Date
  },
  dueDateForRenewal: {
    type: Date
  },
  reportingFrequency: {
    type: String,
    enum: ['N/A', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly once', 'Two years', 'Three years once', 'Four years', 'Five years', 'As Required'],
    default: 'N/A'
  },
  dateOfLastReport: {
    type: Date
  },
  responsibility: {
    type: String,
    required: [true, 'Responsibility is required'],
    trim: true
  },
  permitDocument: {
    type: String,
    trim: true
  },
  complianceReport: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Pending Renewal', 'Cancelled'],
    default: 'Active'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Manual auto-increment for slNo (per user)
legalRegisterSchema.pre('save', async function(next) {
  if (this.isNew && !this.slNo) {
    try {
      // Find last record for THIS user only
      const lastRecord = await this.constructor.findOne(
        { createdBy: this.createdBy },
        { slNo: 1 }
      ).sort({ slNo: -1 }).lean();
      this.slNo = lastRecord ? lastRecord.slNo + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }

  // Auto-archive expired permits
  if (this.status === 'Expired' && !this.isArchived) {
    this.isArchived = true;
    this.archivedAt = new Date();
  }

  // Check if permit has expired based on dueDateForRenewal
  if (this.dueDateForRenewal) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(this.dueDateForRenewal);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today && this.status === 'Active') {
      this.status = 'Expired';
      this.isArchived = true;
      this.archivedAt = new Date();
    }
  }

  next();
});

// Index for search and filter
legalRegisterSchema.index({ permit: 'text', documentNo: 'text' });
legalRegisterSchema.index({ dateOfExpiry: 1, dueDateForRenewal: 1 });
legalRegisterSchema.index({ isArchived: 1, status: 1 });

// Virtual for days until renewal
legalRegisterSchema.virtual('daysUntilRenewal').get(function() {
  if (!this.dueDateForRenewal) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(this.dueDateForRenewal);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to check if renewal is due soon
legalRegisterSchema.methods.isRenewalDueSoon = function(days = 7) {
  const daysUntil = this.daysUntilRenewal;
  return daysUntil !== null && daysUntil >= 0 && daysUntil <= days;
};

export default mongoose.model('LegalRegister', legalRegisterSchema);
