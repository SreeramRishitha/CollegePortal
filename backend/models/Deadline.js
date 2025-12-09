const mongoose = require('mongoose')

const deadlineSchema = new mongoose.Schema(
  {
    noticeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notice',
    },
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    department: {
      type: String,
      default: 'All',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    type: {
      type: String,
      enum: ['fee', 'exam', 'hostel', 'form', 'other'],
      default: 'other',
    },
    description: String,
    reminderSettings: {
      daysBefore: [{
        type: Number,
      }],
      notifyChannels: [{
        type: String,
        enum: ['email', 'inapp', 'whatsapp', 'sms'],
      }],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrenceRule: String, // RRULE format
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
deadlineSchema.index({ date: 1 })
deadlineSchema.index({ department: 1 })

module.exports = mongoose.model('Deadline', deadlineSchema)

