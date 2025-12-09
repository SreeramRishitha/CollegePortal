const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']

async function testModels() {
  for (const modelName of models) {
    try {
      console.log(`Testing ${modelName}...`)
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent('Hello')
      console.log(`✅ ${modelName} WORKS!`)
      console.log(`Response: ${result.response.text()}`)
      return modelName
    } catch (err) {
      console.log(`❌ ${modelName} failed: ${err.message.substring(0, 100)}`)
    }
  }
  return null
}

testModels().then(working => {
  if (working) {
    console.log(`\n✅ Use this model name: "${working}"`)
  } else {
    console.log('\n❌ No working model found. Check your API key.')
  }
  process.exit(0)
})

