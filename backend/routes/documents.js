const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Document = require('../models/Document')
const { auth, adminOnly } = require('../middleware/auth')
const { addDocumentToVectorDB } = require('../services/ragService')

const router = express.Router()

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents'
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
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'))
    }
  },
})

// Get all documents
router.get('/', auth, async (req, res) => {
  try {
    const documents = await Document.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })

    res.json(documents)
  } catch (error) {
    console.error('Get documents error:', error)
    res.status(500).json({ message: 'Failed to fetch documents' })
  }
})

// Upload document (admin only)
router.post('/upload', auth, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const document = new Document({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      uploadedBy: req.user._id,
    })

    await document.save()

    // Process document and add to vector DB
    try {
      await addDocumentToVectorDB(req.file.path, req.file.originalname)
      console.log('Document processed and added to vector DB')
    } catch (error) {
      console.error('Error processing document:', error)
      // Continue even if vector DB processing fails
    }

    res.status(201).json({
      _id: document._id,
      filename: document.filename,
      originalName: document.originalName,
      size: document.size,
      uploadedAt: document.createdAt,
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ message: 'Failed to upload document' })
  }
})

// Delete document (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    // Delete file
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path)
    }

    await Document.findByIdAndDelete(req.params.id)

    res.json({ message: 'Document deleted successfully' })
  } catch (error) {
    console.error('Delete error:', error)
    res.status(500).json({ message: 'Failed to delete document' })
  }
})

module.exports = router

