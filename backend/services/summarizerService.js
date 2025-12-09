const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config()

let genAI = null
let model = null

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
}

/**
 * Generate summary and extract deadlines from notice text
 */
async function summarizeAndExtract(text) {
  if (!model) {
    throw new Error('Gemini API not configured')
  }

  const prompt = `You are an assistant that reads college circulars and notices. Analyze the following text and provide:

1) A 2-3 sentence TL;DR summary that is clear and concise.
2) A JSON array "deadlines" with objects containing: {title, date (in YYYY-MM-DD format), type (fee/exam/hostel/form/other), notes}
3) A "tags" array with relevant tags like ["fees", "exam", "hostel", "academic", etc.]

Text:
${text}

Respond ONLY with valid JSON in this exact format:
{
  "summary": "2-3 sentence summary here",
  "deadlines": [
    {"title": "Deadline title", "date": "2026-11-20", "type": "fee", "notes": "optional notes"}
  ],
  "tags": ["tag1", "tag2"]
}`

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent extraction
        maxOutputTokens: 1024,
      },
    })

    const response = await result.response
    const textResponse = response.text()

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = textResponse.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '')
    }

    const parsed = JSON.parse(jsonText)

    // Validate and format deadlines
    if (parsed.deadlines && Array.isArray(parsed.deadlines)) {
      parsed.deadlines = parsed.deadlines.map((dl) => ({
        title: dl.title || 'Deadline',
        date: new Date(dl.date),
        type: dl.type || 'other',
        notes: dl.notes || '',
      }))
    } else {
      parsed.deadlines = []
    }

    // Ensure tags is an array
    if (!Array.isArray(parsed.tags)) {
      parsed.tags = []
    }

    return {
      summary: parsed.summary || 'No summary available',
      deadlines: parsed.deadlines || [],
      tags: parsed.tags || [],
    }
  } catch (error) {
    console.error('Summarization error:', error)
    // Fallback: return basic summary
    return {
      summary: text.substring(0, 200) + '...',
      deadlines: [],
      tags: [],
    }
  }
}

module.exports = {
  summarizeAndExtract,
}

