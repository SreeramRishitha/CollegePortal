const mongoose = require('mongoose')

const deadlineSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['fee', 'exam', 'hostel', 'form', 'other'],
    default: 'other',
  },
  notes: String,
})

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: false,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rawText: {
      type: String,
    },
    summary: {
      type: String,
    },
    deadlines: [deadlineSchema],
    tags: [{
      type: String,
    }],
    department: {
      type: String,
      default: 'All',
    },
    targetAudience: {
      type: String,
      enum: ['All', 'Students', 'Faculty', 'Staff'],
      default: 'All',
    },
    publicUrl: {
      type: String,
      unique: true,
      sparse: true,
    },
    qrCodeUrl: {
      type: String,
    },
    vectorIndexed: {
      type: Boolean,
      default: false,
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Notice', noticeSchema)

