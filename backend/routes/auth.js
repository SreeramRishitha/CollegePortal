const express = require('express')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const { auth } = require('../middleware/auth')

const router = express.Router()

// GET /api/auth - Show available auth endpoints
router.get('/', (req, res) => {
  res.json({
    message: 'Authentication API',
    endpoints: {
      register: {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Register a new user',
        body: {
          name: 'string (required)',
          email: 'string (required, valid email)',
          password: 'string (required, min 6 characters)',
          role: 'string (optional: "student" or "admin")',
          studentId: 'string (optional, required if role is "student")'
        }
      },
      login: {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Login and get authentication token',
        body: {
          email: 'string (required, valid email)',
          password: 'string (required)'
        }
      },
      me: {
        method: 'GET',
        path: '/api/auth/me',
        description: 'Get current user information',
        auth: 'required'
      }
    },
    note: 'Most API endpoints require authentication. Include the token in the Authorization header: "Bearer <token>"'
  })
})

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, email, password, role, studentId } = req.body

      // Check if user exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' })
      }

      // Create user
      const user = new User({
        name,
        email,
        password,
        role: role || 'student',
        studentId: role === 'student' ? studentId : undefined,
      })

      await user.save()

      // Generate token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '7d',
      })

      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
        },
      })
    } catch (error) {
      console.error('Register error:', error)
      res.status(500).json({ message: 'Server error' })
    }
  }
)

// Login
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req, res) => {
    console.log('Login request received:', { email: req.body.email })
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { email, password } = req.body

      // Check database connection
      const mongoose = require('mongoose')
      const dbState = mongoose.connection.readyState
      // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      if (dbState === 0) {
        console.error('Database not connected. ReadyState:', dbState)
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/college-portal'
        const isAtlas = mongoUri.includes('mongodb+srv://') || mongoUri.includes('mongodb.net')
        
        let hint = 'Check if MongoDB service is running on localhost:27017 or verify your MONGODB_URI in .env'
        if (isAtlas) {
          hint = 'MongoDB Atlas connection failed. Check: 1) IP whitelist in Atlas Network Access, 2) Internet connection, 3) Cluster is running'
        }
        
        return res.status(503).json({ 
          message: 'Database connection error. Please check your MongoDB configuration and try again.',
          error: 'Database not connected',
          hint: hint
        })
      }
      // If connecting (state 2), wait a bit and retry once
      if (dbState === 2) {
        console.log('Database is connecting, waiting...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (mongoose.connection.readyState !== 1) {
          return res.status(503).json({ 
            message: 'Database is still connecting. Please try again in a moment.',
            error: 'Database connecting'
          })
        }
      }

      // Find user
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' })
      }

      // Check password
      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' })
      }

      // Generate token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '7d',
      })

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
        },
      })
    } catch (error) {
      console.error('Login error:', error)
      
      // Handle specific database errors
      if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
        return res.status(503).json({ 
          message: 'Database connection error. Please try again later.',
          error: 'Database connection failed'
        })
      }
      
      res.status(500).json({ 
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
)

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      studentId: req.user.studentId,
    },
  })
})

module.exports = router

