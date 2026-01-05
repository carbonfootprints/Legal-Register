import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
  legalRegisterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LegalRegister',
    required: true
  },
  emailType: {
    type: String,
    enum: ['two_day_reminder', 'due_date_reminder'],
    required: true
  },
  recipientEmail: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    default: 'sent'
  },
  errorMessage: {
    type: String
  },
  dueDateForRenewal: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate emails
emailLogSchema.index({
  legalRegisterId: 1,
  emailType: 1,
  dueDateForRenewal: 1
}, {
  unique: true
});

export default mongoose.model('EmailLog', emailLogSchema);
