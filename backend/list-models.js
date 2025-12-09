const https = require('https')
require('dotenv').config()

const API_KEY = process.env.GEMINI_API_KEY

if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY not found')
  process.exit(1)
}

console.log('Fetching available models...\n')

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1/models?key=${API_KEY}`,
  method: 'GET'
}

const req = https.request(options, (res) => {
  let data = ''
  res.on('data', (chunk) => { data += chunk })
  res.on('end', () => {
    if (res.statusCode === 200) {
      const response = JSON.parse(data)
      console.log('✅ Available models:')
      if (response.models) {
        response.models.forEach(model => {
          console.log(`  - ${model.name}`)
        })
      } else {
        console.log('No models found in response')
        console.log('Full response:', JSON.stringify(response, null, 2))
      }
    } else {
      console.error(`❌ Failed: ${res.statusCode}`)
      console.error('Response:', data.substring(0, 500))
      if (res.statusCode === 403 || res.statusCode === 401) {
        console.log('\n💡 Your API key may be invalid or expired.')
        console.log('Please regenerate it at: https://makersuite.google.com/app/apikey')
      }
    }
    process.exit(0)
  })
})

req.on('error', (err) => {
  console.error('Error:', err.message)
  process.exit(1)
})

req.end()

