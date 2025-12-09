const express = require('express')
const { auth } = require('../middleware/auth')
const { generateAnswer } = require('../services/ragService')

const router = express.Router()

// GET /api/query - Show available query endpoints
router.get('/', (req, res) => {
  res.json({
    message: 'Query API - AI-powered question answering',
    endpoints: {
      ask: {
        method: 'POST',
        path: '/api/query/ask',
        description: 'Ask a question to the AI assistant',
        auth: 'required',
        body: {
          question: 'string (required)',
          noticeId: 'string (optional)'
        }
      }
    },
    note: 'Authentication required. Include token in Authorization header: "Bearer <token>"'
  })
})

// Ask a question
router.post('/ask', auth, async (req, res) => {
  try {
    const { question, noticeId } = req.body

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: 'Question is required' })
    }

    const answer = await generateAnswer(question, noticeId || null)

    res.json({
      question,
      answer,
      noticeId: noticeId || null,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error('Query error:', error)
    res.status(500).json({ message: 'Failed to process query' })
  }
})

module.exports = router

