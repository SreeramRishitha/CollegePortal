const { GoogleGenerativeAI } = require('@google/generative-ai')
const pdfParse = require('pdf-parse')
const fs = require('fs').promises
const path = require('path')

// Initialize Gemini
let genAI = null
let model = null

if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    // Use gemini-2.0-flash-lite (free tier compatible)
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
    console.log('✅ Gemini AI initialized with model: gemini-2.0-flash-lite')
  } catch (error) {
    console.error('Error initializing Gemini AI:', error.message)
    model = null
  }
} else {
  console.warn('GEMINI_API_KEY not set. AI features will be limited.')
}

// Function to try alternative models if primary model fails
async function tryAlternativeModels(question) {
  // Try free-tier compatible models first
  const modelNames = ['gemini-2.0-flash-lite', 'gemini-2.5-flash-lite', 'gemini-2.0-flash-001', 'gemini-2.0-flash']
  
  for (const modelName of modelNames) {
    try {
      const testModel = genAI.getGenerativeModel({ model: modelName })
      const result = await testModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: question }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      })
      // If successful, update the global model
      model = testModel
      console.log(`✅ Switched to model: ${modelName}`)
      return result.response.text()
    } catch (err) {
      // Skip quota errors for this model, try next
      if (err.message.includes('429') || err.message.includes('quota')) {
        console.log(`⚠️ ${modelName} quota exceeded, trying next model...`)
        continue
      }
      continue
    }
  }
  return null
}

// In-memory vector store (simple fallback)
let vectorStore = []
// Notice-specific vector store
let noticeVectorStore = {}

// Try to initialize ChromaDB (optional - install separately if needed)
let chromaClient = null
let collection = null

async function initializeChromaDB() {
  try {
    // ChromaDB is optional - install with: npm install chromadb
    const { ChromaClient } = require('chromadb')
    chromaClient = new ChromaClient({
      path: process.env.CHROMADB_URL || 'http://localhost:8000',
    })

    const collections = await chromaClient.listCollections()
    const collectionName = 'college-documents'

    if (collections.find((c) => c.name === collectionName)) {
      collection = await chromaClient.getCollection({ name: collectionName })
    } else {
      collection = await chromaClient.createCollection({
        name: collectionName,
      })
    }
    console.log('ChromaDB initialized successfully')
  } catch (error) {
    // ChromaDB not installed or not available - use in-memory storage
    console.log('ChromaDB not available, using in-memory storage')
  }
}

// Initialize ChromaDB (non-blocking)
initializeChromaDB()

// Extract text from PDF
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath)
    const data = await pdfParse(dataBuffer)
    return data.text
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw error
  }
}

// Split text into chunks
function splitTextIntoChunks(text, chunkSize = 1000, overlap = 200) {
  // Validate input
  if (!text || typeof text !== 'string') {
    console.warn('Invalid text input for chunking')
    return []
  }

  // Ensure reasonable chunk size
  if (chunkSize <= 0 || chunkSize > 10000) {
    chunkSize = 1000
  }
  if (overlap < 0 || overlap >= chunkSize) {
    overlap = Math.min(200, Math.floor(chunkSize / 5))
  }

  const chunks = []
  let start = 0
  const maxChunks = 10000 // Safety limit

  while (start < text.length && chunks.length < maxChunks) {
    const end = Math.min(start + chunkSize, text.length)
    const chunk = text.slice(start, end)
    if (chunk.length > 0) {
      chunks.push(chunk)
    }
    start = end - overlap
    if (start <= 0) break // Prevent infinite loop
  }

  return chunks
}

// Simple text similarity (TF-IDF-like approach)
function calculateSimilarity(text1, text2) {
  const words1 = text1.toLowerCase().split(/\s+/)
  const words2 = text2.toLowerCase().split(/\s+/)
  const set1 = new Set(words1)
  const set2 = new Set(words2)
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  return intersection.size / union.size
}

// Add text directly to vector database (for text-based notices)
async function addTextToVectorDB(text, sourceName, noticeId = null) {
  try {
    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.warn(`No text provided for ${sourceName}`)
      return
    }

    const chunks = splitTextIntoChunks(text)
    
    if (chunks.length === 0) {
      console.warn(`No chunks created from ${sourceName}`)
      return
    }

    // Store in in-memory vector store
    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i] && chunks[i].trim().length > 0) {
        const chunkData = {
          text: chunks[i],
          source: sourceName,
          chunkIndex: i,
        }
        if (noticeId) {
          chunkData.noticeId = noticeId
        }
        vectorStore.push(chunkData)
        
        // Also store in notice-specific store if noticeId provided
        if (noticeId) {
          if (!noticeVectorStore[noticeId]) {
            noticeVectorStore[noticeId] = []
          }
          noticeVectorStore[noticeId].push(chunkData)
        }
      }
    }

    // Also try to store in ChromaDB if available
    if (collection) {
      try {
        const ids = []
        const documents = []
        const metadatas = []

        for (let i = 0; i < chunks.length; i++) {
          ids.push(`${sourceName}-chunk-${i}`)
          documents.push(chunks[i])
          const metadata = { source: sourceName, chunkIndex: i }
          if (noticeId) {
            metadata.noticeId = noticeId
          }
          metadatas.push(metadata)
        }

        await collection.add({
          ids,
          documents,
          metadatas,
        })
        console.log(`Also stored in ChromaDB`)
      } catch (error) {
        console.log('ChromaDB storage failed, using in-memory only')
      }
    }

    console.log(`Added ${chunks.length} chunks from ${sourceName} to vector store`)
  } catch (error) {
    console.error('Error adding text to vector DB:', error)
    throw error
  }
}

// Add document to vector database (with optional noticeId)
async function addDocumentToVectorDB(filePath, originalName, noticeId = null) {
  try {
    const text = await extractTextFromPDF(filePath)
    
    // Validate extracted text
    if (!text || text.trim().length === 0) {
      console.warn(`No text extracted from ${originalName}`)
      return
    }

    const chunks = splitTextIntoChunks(text)
    
    if (chunks.length === 0) {
      console.warn(`No chunks created from ${originalName}`)
      return
    }

    // Store in in-memory vector store
    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i] && chunks[i].trim().length > 0) {
        const chunkData = {
          text: chunks[i],
          source: originalName,
          chunkIndex: i,
        }
        if (noticeId) {
          chunkData.noticeId = noticeId
        }
        vectorStore.push(chunkData)
        
        // Also store in notice-specific store if noticeId provided
        if (noticeId) {
          if (!noticeVectorStore[noticeId]) {
            noticeVectorStore[noticeId] = []
          }
          noticeVectorStore[noticeId].push(chunkData)
        }
      }
    }

    // Also try to store in ChromaDB if available
    if (collection) {
      try {
        const ids = []
        const documents = []
        const metadatas = []

        for (let i = 0; i < chunks.length; i++) {
          ids.push(`${originalName}-chunk-${i}`)
          documents.push(chunks[i])
          metadatas.push({ source: originalName, chunkIndex: i })
        }

        await collection.add({
          ids,
          documents,
          metadatas,
        })
        console.log(`Also stored in ChromaDB`)
      } catch (error) {
        console.log('ChromaDB storage failed, using in-memory only')
      }
    }

    console.log(`Added ${chunks.length} chunks from ${originalName} to vector store`)
  } catch (error) {
    console.error('Error adding document to vector DB:', error)
    throw error
  }
}

// Query vector database (with optional noticeId filter)
async function queryVectorDB(query, topK = 5, noticeId = null) {
  try {
    // Use notice-specific store if noticeId provided
    const storeToSearch = noticeId && noticeVectorStore[noticeId] 
      ? noticeVectorStore[noticeId] 
      : vectorStore
    
    // Use in-memory vector store with similarity search
    const results = storeToSearch
      .map((item) => ({
        text: item.text,
        similarity: calculateSimilarity(query, item.text),
        source: item.source,
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .filter((item) => item.similarity > 0.1) // Only return relevant results
      .map((item) => item.text)

    // Also try ChromaDB if available
    if (collection && results.length === 0) {
      try {
        const chromaResults = await collection.query({
          queryTexts: [query],
          nResults: topK,
        })
        if (chromaResults.documents && chromaResults.documents[0]) {
          return chromaResults.documents[0]
        }
      } catch (error) {
        console.log('ChromaDB query failed, using in-memory results')
      }
    }

    return results
  } catch (error) {
    console.error('Vector DB query error:', error)
    return []
  }
}

// Generate answer using RAG (with optional noticeId for context restriction)
async function generateAnswer(question, noticeId = null) {
  try {
    if (!model) {
      return 'AI service is not configured. Please set GEMINI_API_KEY in environment variables.'
    }

    // Retrieve relevant chunks (filtered by noticeId if provided)
    const relevantChunks = await queryVectorDB(question, 5, noticeId)

    if (relevantChunks.length === 0) {
      // Fallback: use model directly without RAG - natural conversation style
      const prompt = `${question}`

      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        })
        const response = await result.response
        return response.text()
      } catch (apiError) {
        console.error('Gemini API error:', apiError.message)
        
        // If model not found, try alternative models
        if (apiError.message.includes('404') || apiError.message.includes('not found')) {
          console.log('Trying alternative models...')
          const altResult = await tryAlternativeModels(prompt)
          if (altResult) {
            return altResult
          }
          return 'The AI model is not available with your API key. Please regenerate your API key at https://makersuite.google.com/app/apikey or contact support.'
        }
        
        if (apiError.message.includes('quota') || apiError.message.includes('429')) {
          console.log('Quota exceeded, trying alternative models...')
          const altResult = await tryAlternativeModels(prompt)
          if (altResult) {
            return altResult
          }
          // Extract retry delay if available
          const retryMatch = apiError.message.match(/Please retry in ([\d.]+)s/)
          const retryTime = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60
          return `⚠️ API quota exceeded. The free tier has limited requests. Please wait ${retryTime} seconds and try again.\n\n💡 Solutions:\n1. Wait ${retryTime} seconds and retry\n2. Upgrade to a paid plan: https://ai.google.dev/pricing\n3. Use a different API key with available quota`
        }
        
        throw apiError
      }
    }

    // Build context from relevant chunks
    const context = relevantChunks.join('\n\n')

    // Generate answer using RAG - natural conversation style like Gemini
    const prompt = `Based on the following official college documents, answer this question naturally and conversationally:

${context}

Question: ${question}

Provide a clear, helpful answer using the information from the documents above. If the documents don't contain the answer, say so naturally.`

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      })
      const response = await result.response
      return response.text()
    } catch (apiError) {
      console.error('Gemini API error:', apiError.message)
      
      // If model not found, try alternative models
      if (apiError.message.includes('404') || apiError.message.includes('not found')) {
        console.log('Trying alternative models...')
        const altResult = await tryAlternativeModels(prompt)
        if (altResult) {
          return altResult
        }
        return 'The AI model is not available with your API key. Please regenerate your API key at https://makersuite.google.com/app/apikey or contact support.'
      }
      
      if (apiError.message.includes('quota') || apiError.message.includes('429')) {
        console.log('Quota exceeded, trying alternative models...')
        const altResult = await tryAlternativeModels(prompt)
        if (altResult) {
          return altResult
        }
        // Extract retry delay if available
        const retryMatch = apiError.message.match(/Please retry in ([\d.]+)s/)
        const retryTime = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60
        return `⚠️ API quota exceeded. The free tier has limited requests. Please wait ${retryTime} seconds and try again.\n\n💡 Solutions:\n1. Wait ${retryTime} seconds and retry\n2. Upgrade to a paid plan: https://ai.google.dev/pricing\n3. Use a different API key with available quota`
      }
      
      throw apiError
    }
  } catch (error) {
    console.error('Answer generation error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return `I apologize, but I encountered an error while processing your question: ${error.message}. Please try again or contact support.`
  }
}

module.exports = {
  addDocumentToVectorDB,
  addTextToVectorDB,
  generateAnswer,
  extractTextFromPDF,
  queryVectorDB,
}

