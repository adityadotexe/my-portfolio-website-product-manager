// lib/ai/embeddings.ts
import { CohereClient } from 'cohere-ai'

const apiKey = process.env.COHERE_API_KEY

if (!apiKey) {
  console.warn('Warning: COHERE_API_KEY is not defined. AI embedding features will be disabled.')
}

const cohere = apiKey ? new CohereClient({ token: apiKey }) : null

const EMBEDDING_MODEL = 'embed-english-v3.0'

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!cohere) {
    console.warn('Cohere client not initialized. Returning empty embedding.')
    return []
  }
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty for embedding generation')
    }
    const response = await cohere.embed({
      texts: [text],
      model: EMBEDDING_MODEL,
      inputType: 'search_query',
      embeddingTypes: ['float'],
    })
    const floats = response.embeddings && 'float' in response.embeddings
      ? (response.embeddings as { float: number[][] }).float
      : null
    if (!floats || floats.length === 0) {
      throw new Error('No embedding returned from Cohere')
    }
    return floats[0]
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

export async function batchGenerateEmbeddings(
  texts: string[],
  batchSize: number = 96
): Promise<number[][]> {
  if (!cohere) {
    console.warn('Cohere client not initialized. Returning empty embeddings.')
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
      const response = await cohere.embed({
        texts: batch,
        model: EMBEDDING_MODEL,
        inputType: 'search_document',
        embeddingTypes: ['float'],
      })
      const floats = response.embeddings && 'float' in response.embeddings
        ? (response.embeddings as { float: number[][] }).float
        : null
      if (!floats || floats.length === 0) {
        throw new Error(`No embeddings returned for batch starting at index ${i}`)
      }
      embeddings.push(...floats)
      if (i + batchSize < validTexts.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
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
