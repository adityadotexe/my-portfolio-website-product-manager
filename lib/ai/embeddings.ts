// lib/ai/embeddings.ts
import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  console.warn('Warning: OPENAI_API_KEY is not defined. AI features will be disabled.')
}

const openai = apiKey ? new OpenAI({ apiKey }) : null

const embeddingModel = process.env.EMBEDDING_MODEL || 'text-embedding-3-small'

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!openai) {
    console.warn('OpenAI client not initialized. Returning empty embedding.')
    return []
  }
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty for embedding generation')
    }
    const response = await openai.embeddings.create({
      model: embeddingModel,
      input: text,
      encoding_format: 'float',
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

export async function batchGenerateEmbeddings(
  texts: string[],
  batchSize: number = 50
): Promise<number[][]> {
  if (!openai) {
    console.warn('OpenAI client not initialized. Returning empty embeddings.')
    return []
  }
  try {
    if (!texts || texts.length === 0) return []
    const validTexts = texts.filter(t => t && t.trim().length > 0)
    if (validTexts.length === 0) return []
    const embeddings: number[][] = []
    for (let i = 0; i < validTexts.length; i += batchSize) {
      const batch = validTexts.slice(i, i + batchSize)
      console.log(`Processing embedding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validTexts.length / batchSize)}...`)
      const batchPromises = batch.map(text => generateEmbedding(text))
      const batchEmbeddings = await Promise.all(batchPromises)
      embeddings.push(...batchEmbeddings)
      if (i + batchSize < validTexts.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    console.log(`✅ Generated ${embeddings.length} embeddings`)
    return embeddings
  } catch (error) {
    console.error('Error in batch embedding generation:', error)
    throw error
  }
}

export function cosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same dimensions')
  }
  let dotProduct = 0
  let magnitude1 = 0
  let magnitude2 = 0
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i]
    magnitude1 += embedding1[i] * embedding1[i]
    magnitude2 += embedding2[i] * embedding2[i]
  }
  magnitude1 = Math.sqrt(magnitude1)
  magnitude2 = Math.sqrt(magnitude2)
  if (magnitude1 === 0 || magnitude2 === 0) return 0
  return dotProduct / (magnitude1 * magnitude2)
}