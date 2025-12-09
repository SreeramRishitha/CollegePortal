// Quick MongoDB connection test
// Run with: node test-mongodb.js

const mongoose = require('mongoose')
require('dotenv').config({ path: './backend/.env' })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college-portal'

console.log('Testing MongoDB connection...')
console.log('URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')) // Hide password

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('✅ MongoDB connection successful!')
    console.log(`   Database: ${mongoose.connection.name}`)
    console.log(`   Host: ${mongoose.connection.host}:${mongoose.connection.port}`)
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message)
    console.log('\nTroubleshooting:')
    console.log('1. Make sure MongoDB is running')
    console.log('   - Local: Check if MongoDB service is running')
    console.log('   - Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest')
    console.log('   - Linux: sudo systemctl status mongod')
    console.log('2. Check MONGODB_URI in backend/.env')
    console.log('3. For Atlas: Check IP whitelist and credentials')
    console.log(`\nCurrent URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`)
    process.exit(1)
  })

