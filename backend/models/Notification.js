const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['notice', 'deadline', 'complaint', 'reminder', 'system'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: String,
    noticeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notice',
    },
    deadlineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deadline',
    },
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    channels: [{
      type: String,
      enum: ['inapp', 'email', 'whatsapp', 'sms'],
    }],
    sent: {
      type: Boolean,
      default: false,
    },
    sentAt: Date,
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
notificationSchema.index({ userId: 1, read: 1 })
notificationSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Notification', notificationSchema)

