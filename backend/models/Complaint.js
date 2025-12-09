const mongoose = require('mongoose')

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['general', 'academic', 'infrastructure', 'attendance', 'certificate', 'other'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['pending', 'in-review', 'resolved', 'rejected'],
      default: 'pending',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reply: {
      type: String,
    },
    attachments: [
      {
        type: String,
      },
    ],
    predictedDepartment: {
      type: String,
    },
    confidenceScore: {
      type: Number,
    },
    routingStatus: {
      type: String,
      enum: ['auto', 'manual', 'needs-triage'],
      default: 'auto',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    department: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Complaint', complaintSchema)

