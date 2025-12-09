const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Complaint = require('../models/Complaint')
const { auth, adminOnly } = require('../middleware/auth')
const { routeComplaint, getDepartmentAssignment } = require('../services/routingService')
const { createNotification } = require('../services/notificationService')

const router = express.Router()

// GET /api/complaints - Show available complaint endpoints
router.get('/info', (req, res) => {
  res.json({
    message: 'Complaints API',
    endpoints: {
      getAll: {
        method: 'GET',
        path: '/api/complaints',
        description: 'Get all complaints (user sees own, admin sees all)',
        auth: 'required'
      },
      getById: {
        method: 'GET',
        path: '/api/complaints/:id',
        description: 'Get a specific complaint by ID',
        auth: 'required'
      },
      create: {
        method: 'POST',
        path: '/api/complaints',
        description: 'Create a new complaint',
        auth: 'required',
        body: {
          title: 'string (required)',
          description: 'string (required)',
          category: 'string (required)',
          department: 'string (optional)',
          attachments: 'files (optional, max 5 files)'
        }
      }
    },
    note: 'Authentication required. Include token in Authorization header: "Bearer <token>"'
  })
})

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/complaints'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only images and PDF files are allowed'))
    }
  },
})

// Get all complaints (user sees own, admin sees all)
router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { submittedBy: req.user._id }
    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 })

    res.json(complaints)
  } catch (error) {
    console.error('Get complaints error:', error)
    res.status(500).json({ message: 'Failed to fetch complaints' })
  }
})

// Get single complaint
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(
      'submittedBy',
      'name email'
    )

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' })
    }

    // Check if user has access
    if (
      req.user.role !== 'admin' &&
      complaint.submittedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json(complaint)
  } catch (error) {
    console.error('Get complaint error:', error)
    res.status(500).json({ message: 'Failed to fetch complaint' })
  }
})

// Create complaint
router.post('/', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, description, category } = req.body

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' })
    }

    const attachments = req.files
      ? req.files.map((file) => `/uploads/complaints/${file.filename}`)
      : []

    // Route complaint using predictive routing
    const routing = routeComplaint(`${title} ${description}`)
    
    const complaint = new Complaint({
      title,
      description,
      category: category || 'general',
      submittedBy: req.user._id,
      attachments,
      predictedDepartment: routing.department,
      confidenceScore: routing.confidence,
      routingStatus: routing.confidence >= 0.5 ? 'auto' : 'needs-triage',
      department: routing.department !== 'NeedsTriage' ? routing.department : undefined,
    })

    await complaint.save()
    await complaint.populate('submittedBy', 'name email')

    // Notify assigned department/admin
    if (complaint.department && complaint.routingStatus === 'auto') {
      // In production, notify the assigned department
      console.log(`Complaint ${complaint._id} routed to ${complaint.department}`)
    }

    // Notify student that complaint was submitted
    await createNotification({
      userId: req.user._id,
      type: 'complaint',
      title: 'Complaint Submitted',
      message: `Your complaint "${title}" has been submitted and ${complaint.routingStatus === 'auto' ? `routed to ${complaint.department}` : 'is pending review'}`,
      link: `/complaints/${complaint._id}`,
      complaintId: complaint._id,
      channels: ['inapp'],
    })

    res.status(201).json(complaint)
  } catch (error) {
    console.error('Create complaint error:', error)
    res.status(500).json({ message: 'Failed to create complaint' })
  }
})

// Update complaint status (admin only)
router.patch('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body

    if (!['pending', 'in-review', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('submittedBy', 'name email')

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' })
    }

    res.json(complaint)
  } catch (error) {
    console.error('Update status error:', error)
    res.status(500).json({ message: 'Failed to update status' })
  }
})

// Reply to complaint (admin only)
router.post('/:id/reply', auth, adminOnly, async (req, res) => {
  try {
    const { reply } = req.body

    if (!reply || reply.trim().length === 0) {
      return res.status(400).json({ message: 'Reply is required' })
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { reply, status: 'in-review' },
      { new: true }
    ).populate('submittedBy', 'name email')

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' })
    }

    res.json(complaint)
  } catch (error) {
    console.error('Reply error:', error)
    res.status(500).json({ message: 'Failed to send reply' })
  }
})

module.exports = router

