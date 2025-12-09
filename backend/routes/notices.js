const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Notice = require('../models/Notice')
const Deadline = require('../models/Deadline')
const { auth, adminOnly } = require('../middleware/auth')
const { addDocumentToVectorDB, addTextToVectorDB } = require('../services/ragService')
const { summarizeAndExtract } = require('../services/summarizerService')
const { notifyNewNotice } = require('../services/notificationService')
const { generateQRCode, generateShortUrl } = require('../services/qrService')

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/notices'
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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // Allow no file if textContent is provided
    if (!file) {
      cb(null, true)
      return
    }
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'))
    }
  },
})

// Get all notices
router.get('/', auth, async (req, res) => {
  try {
    const query = { published: true }

    // Filter by department if specified
    if (req.query.department && req.query.department !== 'All') {
      query.department = req.query.department
    }

    const notices = await Notice.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })

    res.json(notices)
  } catch (error) {
    console.error('Get notices error:', error)
    res.status(500).json({ message: 'Failed to fetch notices' })
  }
})

// Get single notice
router.get('/:id', auth, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id).populate(
      'uploadedBy',
      'name email'
    )

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' })
    }

    res.json(notice)
  } catch (error) {
    console.error('Get notice error:', error)
    res.status(500).json({ message: 'Failed to fetch notice' })
  }
})

// Upload and process notice (admin only) - supports both PDF and text
router.post('/upload', auth, adminOnly, upload.single('file'), async (req, res) => {
  try {
    const { title, department = 'All', targetAudience = 'All', textContent } = req.body

    // Check if text content is provided (text-based upload)
    if (textContent && textContent.trim()) {
      // Text-based notice
      const notice = new Notice({
        title: title || 'Untitled Notice',
        fileUrl: null, // No file for text-based notices
        originalFileName: 'text-notice.txt',
        uploadedBy: req.user._id,
        department,
        targetAudience,
        processingStatus: 'processing',
        published: false,
      })

      await notice.save()

      // Process text content in background
      processTextNoticeAsync(notice._id, textContent).catch((err) => {
        console.error('Background processing error:', err)
      })

      return res.status(201).json({
        _id: notice._id,
        title: notice.title,
        processingStatus: notice.processingStatus,
        message: 'Notice uploaded. Processing in background...',
      })
    }

    // PDF-based notice
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or text content provided' })
    }

    // Create notice with pending status
    const notice = new Notice({
      title: title || req.file.originalname,
      fileUrl: `/uploads/notices/${req.file.filename}`,
      originalFileName: req.file.originalname,
      uploadedBy: req.user._id,
      department,
      targetAudience,
      processingStatus: 'processing',
      published: false,
    })

    await notice.save()

    // Process in background (in production, use a job queue)
    processNoticeAsync(notice._id, req.file.path, req.file.originalname).catch((err) => {
      console.error('Background processing error:', err)
    })

    res.status(201).json({
      _id: notice._id,
      title: notice.title,
      processingStatus: notice.processingStatus,
      message: 'Notice uploaded. Processing in background...',
    })
  } catch (error) {
    console.error('Upload notice error:', error)
    res.status(500).json({
      message: 'Failed to upload notice',
      error: error.message // Return specific error for debugging
    })
  }
})

// Process text-based notice asynchronously
async function processTextNoticeAsync(noticeId, textContent) {
  try {
    const notice = await Notice.findById(noticeId)
    if (!notice) return

    // Generate summary and extract deadlines from text
    const { summary, deadlines, tags } = await summarizeAndExtract(textContent)

    // Update notice
    notice.rawText = textContent.substring(0, 5000) // Store first 5000 chars
    notice.summary = summary
    notice.deadlines = deadlines
    notice.tags = tags
    notice.processingStatus = 'completed'

    // Generate public URL and QR code
    const publicUrl = generateShortUrl(noticeId)
    notice.publicUrl = publicUrl
    const frontendUrl = process.env.FRONTEND_URL || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:3001')
    notice.qrCodeUrl = await generateQRCode(noticeId, `${frontendUrl}${publicUrl}`)

    await notice.save()

    // Add to vector DB for RAG (with noticeId for context restriction)
    try {
      await addTextToVectorDB(textContent, `notice-${noticeId}`, noticeId.toString())
      notice.vectorIndexed = true
      await notice.save()
    } catch (error) {
      console.error('Vector DB indexing error:', error)
    }

    // Create deadline records
    for (const deadline of deadlines) {
      const deadlineRecord = new Deadline({
        noticeId: notice._id,
        title: deadline.title,
        date: deadline.date,
        type: deadline.type,
        department: notice.department,
        priority: 'medium',
        description: deadline.notes,
        createdBy: notice.uploadedBy,
      })
      await deadlineRecord.save()
    }

    // Notify students if published
    if (notice.published) {
      await notifyNewNotice(notice)
    }

    console.log(`Text notice ${noticeId} processed successfully`)
  } catch (error) {
    console.error('Process text notice error:', error)
    const notice = await Notice.findById(noticeId)
    if (notice) {
      notice.processingStatus = 'failed'
      await notice.save()
    }
  }
}

// Process notice asynchronously (PDF-based)
async function processNoticeAsync(noticeId, filePath, originalName) {
  try {
    const notice = await Notice.findById(noticeId)
    if (!notice) return

    // Extract text from PDF
    const { extractTextFromPDF } = require('../services/ragService')
    const rawText = await extractTextFromPDF(filePath)

    // Generate summary and extract deadlines
    const { summary, deadlines, tags } = await summarizeAndExtract(rawText)

    // Update notice
    notice.rawText = rawText.substring(0, 5000) // Store first 5000 chars
    notice.summary = summary
    notice.deadlines = deadlines
    notice.tags = tags
    notice.processingStatus = 'completed'

    // Generate public URL and QR code
    const publicUrl = generateShortUrl(noticeId)
    notice.publicUrl = publicUrl
    const frontendUrl = process.env.FRONTEND_URL || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:3001')
    notice.qrCodeUrl = await generateQRCode(noticeId, `${frontendUrl}${publicUrl}`)

    await notice.save()

    // Add to vector DB for RAG (with noticeId for context restriction)
    try {
      await addDocumentToVectorDB(filePath, originalName, noticeId.toString())
      notice.vectorIndexed = true
      await notice.save()
    } catch (error) {
      console.error('Vector DB indexing error:', error)
    }

    // Create deadline records
    for (const deadline of deadlines) {
      const deadlineRecord = new Deadline({
        noticeId: notice._id,
        title: deadline.title,
        date: deadline.date,
        type: deadline.type,
        department: notice.department,
        priority: 'medium',
        description: deadline.notes,
        createdBy: notice.uploadedBy,
      })
      await deadlineRecord.save()
    }

    // Notify students if published
    if (notice.published) {
      await notifyNewNotice(notice)
    }

    console.log(`Notice ${noticeId} processed successfully`)
  } catch (error) {
    console.error('Process notice error:', error)
    const notice = await Notice.findById(noticeId)
    if (notice) {
      notice.processingStatus = 'failed'
      await notice.save()
    }
  }
}

// Publish notice (admin only)
router.post('/:id/publish', auth, adminOnly, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' })
    }

    if (notice.processingStatus !== 'completed') {
      return res.status(400).json({ message: 'Notice is still processing' })
    }

    notice.published = true
    await notice.save()

    // Notify students
    await notifyNewNotice(notice)

    res.json(notice)
  } catch (error) {
    console.error('Publish notice error:', error)
    res.status(500).json({ message: 'Failed to publish notice' })
  }
})

// Update notice (admin only)
router.patch('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { title, summary, deadlines, tags, department } = req.body

    const notice = await Notice.findById(req.params.id)
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' })
    }

    if (title) notice.title = title
    if (summary) notice.summary = summary
    if (deadlines) notice.deadlines = deadlines
    if (tags) notice.tags = tags
    if (department) notice.department = department

    await notice.save()

    // Update deadline records
    if (deadlines) {
      await Deadline.deleteMany({ noticeId: notice._id })
      for (const deadline of deadlines) {
        const deadlineRecord = new Deadline({
          noticeId: notice._id,
          title: deadline.title,
          date: deadline.date,
          type: deadline.type,
          department: notice.department,
          createdBy: notice.uploadedBy,
        })
        await deadlineRecord.save()
      }
    }

    res.json(notice)
  } catch (error) {
    console.error('Update notice error:', error)
    res.status(500).json({ message: 'Failed to update notice' })
  }
})

// Delete notice (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' })
    }

    // Delete file
    if (fs.existsSync(notice.fileUrl.replace(/^\//, ''))) {
      fs.unlinkSync(notice.fileUrl.replace(/^\//, ''))
    }

    // Delete QR code
    if (notice.qrCodeUrl && fs.existsSync(notice.qrCodeUrl.replace(/^\//, ''))) {
      fs.unlinkSync(notice.qrCodeUrl.replace(/^\//, ''))
    }

    // Delete deadlines
    await Deadline.deleteMany({ noticeId: notice._id })

    await Notice.findByIdAndDelete(req.params.id)

    res.json({ message: 'Notice deleted successfully' })
  } catch (error) {
    console.error('Delete notice error:', error)
    res.status(500).json({ message: 'Failed to delete notice' })
  }
})

module.exports = router

