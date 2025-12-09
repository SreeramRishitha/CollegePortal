const https = require('https')
require('dotenv').config()

const API_KEY = process.env.GEMINI_API_KEY

if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in .env file')
  process.exit(1)
}

console.log('Testing API key with direct REST API call...')
console.log('API Key:', API_KEY.substring(0, 20) + '...')

// Try v1 API endpoint
const testV1 = () => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      contents: [{
        parts: [{ text: 'Say hello' }]
      }]
    })

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1/models/gemini-pro:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }

    const req = https.request(options, (res) => {
      let responseData = ''
      res.on('data', (chunk) => { responseData += chunk })
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ v1 API works!')
          resolve(JSON.parse(responseData))
        } else {
          console.log(`❌ v1 API failed: ${res.statusCode}`)
          console.log('Response:', responseData.substring(0, 200))
          reject(new Error(`Status ${res.statusCode}`))
        }
      })
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

// Try v1beta API endpoint
const testV1Beta = () => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      contents: [{
        parts: [{ text: 'Say hello' }]
      }]
    })

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }

    const req = https.request(options, (res) => {
      let responseData = ''
      res.on('data', (chunk) => { responseData += chunk })
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ v1beta API works!')
          resolve(JSON.parse(responseData))
        } else {
          console.log(`❌ v1beta API failed: ${res.statusCode}`)
          console.log('Response:', responseData.substring(0, 300))
          reject(new Error(`Status ${res.statusCode}: ${responseData}`))
        }
      })
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

async function test() {
  console.log('\n1. Testing v1 API (gemini-pro)...')
  try {
    const result = await testV1()
    console.log('✅ SUCCESS with v1 API!')
    console.log('Response:', JSON.stringify(result).substring(0, 200))
  } catch (err) {
    console.log('v1 failed, trying v1beta...\n')
    
    console.log('2. Testing v1beta API (gemini-1.5-flash)...')
    try {
      const result = await testV1Beta()
      console.log('✅ SUCCESS with v1beta API!')
      console.log('Response:', JSON.stringify(result).substring(0, 200))
    } catch (err2) {
      console.log('\n❌ Both APIs failed')
      console.log('\n💡 SOLUTION:')
      console.log('1. Go to: https://makersuite.google.com/app/apikey')
      console.log('2. Delete your old API key')
      console.log('3. Create a NEW API key')
      console.log('4. Update backend/.env with the new key')
      console.log('5. Restart the server')
    }
  }
}

test().then(() => process.exit(0)).catch(() => process.exit(1))

