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
  documentNumber: {
    type: String,
    trim: true
  },
  revisionNumber: {
    type: String,
    trim: true
  },
  revisionDate: {
    type: Date
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
  noExpiry: {
    type: Boolean,
    default: false
  },
  reportingFrequency: {
    type: String,
    // Old values kept for backward compatibility with existing records
    enum: ['N/A', 'Monthly', 'Quarterly', 'Half-Yearly', 'Annually', 'Once in two years', 'Once in three years', 'Once in four years', 'Once in five years', 'As Required',
           'Yearly once', 'Two years', 'Three years once', 'Four years', 'Five years'],
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
      const counter = await mongoose.connection.db.collection('counters').findOneAndUpdate(
        { _id: `slNo_${this.createdBy}` },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: 'after' }
      );
      this.slNo = counter.seq;
    } catch (error) {
      return next(error);
    }
  }

  // Auto-archive expired permits
  if (this.status === 'Expired' && !this.isArchived) {
    this.isArchived = true;
    this.archivedAt = new Date();
  }

  // If no expiry, clear expiry-related fields
  if (this.noExpiry) {
    this.dateOfExpiry = undefined;
    this.dueDateForRenewal = undefined;
  }

  // Check if permit has expired based on dateOfExpiry (skip if no expiry)
  if (!this.noExpiry && this.dateOfExpiry) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(this.dateOfExpiry);
    expiryDate.setHours(0, 0, 0, 0);

    if (expiryDate < today && this.status === 'Active') {
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
