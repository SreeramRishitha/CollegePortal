const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config()

const app = express()

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/query', require('./routes/query'))
app.use('/api/complaints', require('./routes/complaints'))
app.use('/api/documents', require('./routes/documents'))
app.use('/api/notices', require('./routes/notices'))
app.use('/api/deadlines', require('./routes/deadlines'))
app.use('/api/notifications', require('./routes/notifications'))

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'College Portal API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      query: '/api/query',
      complaints: '/api/complaints',
      documents: '/api/documents',
      notices: '/api/notices',
      deadlines: '/api/deadlines',
      notifications: '/api/notifications'
    }
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is accessible',
    timestamp: new Date().toISOString()
  })
})

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college-portal'
const isAtlas = MONGODB_URI.includes('mongodb+srv://') || MONGODB_URI.includes('mongodb.net')

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: isAtlas ? 10000 : 5000, // Longer timeout for Atlas
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    connectTimeoutMS: isAtlas ? 10000 : 5000,
  })
  .then(() => {
    console.log('✅ Connected to MongoDB')
    console.log(`   Database: ${mongoose.connection.name}`)
    if (isAtlas) {
      console.log('   Type: MongoDB Atlas (Cloud)')
    } else {
      console.log(`   Host: ${mongoose.connection.host}:${mongoose.connection.port}`)
    }
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message)
    console.error(`   Connection string: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`)
    
    if (isAtlas) {
      console.error('\n💡 MongoDB Atlas Troubleshooting:')
      console.error('   1. Check your IP address is whitelisted in Atlas Network Access')
      console.error('      - Go to: https://cloud.mongodb.com → Network Access')
      console.error('      - Add your current IP or use 0.0.0.0/0 (less secure)')
      console.error('   2. Verify your username and password are correct')
      console.error('   3. Check your internet connection')
      console.error('   4. Ensure your Atlas cluster is running (not paused)')
    } else {
      console.error('\n💡 Local MongoDB Troubleshooting:')
      console.error('   - Local: Make sure MongoDB service is running')
      console.error('   - Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest')
      console.error('   - Linux: sudo systemctl start mongod')
    }
    
    // Don't crash the server, just log the error
    // MongoDB will retry connection automatically
  })

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected')
})

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected')
})

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message)
})

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Handle port already in use error gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please stop the other process or use a different port.`)
    console.log(`💡 To free port ${PORT}, run: Get-NetTCPConnection -LocalPort ${PORT} | Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`)
    process.exit(1)
  } else {
    throw err
  }
})

