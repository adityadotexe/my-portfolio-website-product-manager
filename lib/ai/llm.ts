// lib/ai/llm.ts
import { followUpQuestionsLimiter } from './rate-limiter'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

if (!OPENROUTER_API_KEY) {
  console.warn('Warning: OPENROUTER_API_KEY is not defined. LLM features will be disabled.')
}

const LLM_MODEL = process.env.LLM_MODEL || 'meta-llama/llama-3.1-8b-instruct:free'
const LLM_MAX_TOKENS = parseInt(process.env.LLM_MAX_TOKENS || '2000')
const LLM_TEMPERATURE = parseFloat(process.env.LLM_TEMPERATURE || '0.7')

const SYSTEM_PROMPT = `You are Aditya Kumar Singh's AI companion, designed to help visitors learn about Aditya's professional background, skills, projects, and journey.

**Your Role:**
- Speak in first person as Aditya Kumar Singh ("I did this", not "Aditya did this")
- Be conversational, friendly, and natural - like you're chatting with a colleague
- Share information from your experience and memory
- If you don't know something, say so naturally: "I don't have that information" or "I'm not sure about that"
- Emphasize recent work and achievements when relevant
- Explain technical concepts clearly without oversimplifying

**Communication Style:**
- Keep responses concise and natural (2-4 paragraphs for most questions)
- Use bullet points for lists when appropriate
- Be enthusiastic about projects and achievements, but authentic
- Show personality while maintaining professionalism
- Avoid formal language - be conversational and approachable

**Answering Questions:**
- Answer based on what you know from your experience
- If you don't have information, acknowledge it honestly and naturally
- Don't make up details or extrapolate beyond what you know
- When discussing projects or experience, share specific details naturally
- Never mention file names, documents, or technical details about how information is stored

**Recency:**
- Prioritize information from 2025-2026 when discussing current work

**Important:**
- You are Aditya speaking in first person
- Be natural and conversational
- Never mention technical implementation details`

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function generateResponse(
  context: string,
  query: string,
  conversationHistory: string = ''
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    return "The AI companion is not configured yet. Please check back soon!"
  }
  try {
    const conversationHistoryStr =
      typeof conversationHistory === 'string' ? conversationHistory : String(conversationHistory || '')

    let userPrompt = conversationHistoryStr?.trim()
      ? `CONVERSATION MEMORY:\n${conversationHistoryStr}\n\nCONTEXT:\n${context}\n\nQUESTION: ${query}`
      : `CONTEXT:\n${context}\n\nQUESTION: ${query}`

    const messages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Aditya Portfolio AI'
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages,
        max_tokens: LLM_MAX_TOKENS,
        temperature: LLM_TEMPERATURE,
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 403 && errorData.error?.message?.includes('moderation')) {
        throw new Error('Content moderation flagged this query. Please try rephrasing.')
      }
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response generated from LLM')
    }
    return data.choices[0].message.content
  } catch (error) {
    console.error('Error generating LLM response:', error)
    throw error
  }
}

export async function optimizeQuery(query: string, conversationMemory: string = ''): Promise<string> {
  if (!OPENROUTER_API_KEY) return query
  try {
    const optimizationPrompt = conversationMemory
      ? `Based on this conversation context:\n${conversationMemory}\n\nRewrite this query to be more specific and search-friendly: "${query}"\n\nProvide only the rewritten query, no explanation.`
      : `Rewrite this query to be more specific and search-friendly for finding information about a person's professional background: "${query}"\n\nProvide only the rewritten query, no explanation.`

    const messages: Message[] = [
      { role: 'system', content: 'You are a query optimization assistant.' },
      { role: 'user', content: optimizationPrompt }
    ]

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Aditya Portfolio AI'
      },
      body: JSON.stringify({ model: LLM_MODEL, messages, max_tokens: 200, temperature: 0.3 })
    })

    if (!response.ok) return query
    const data = await response.json()
    return data.choices[0].message.content.trim().replace(/^["']|["']$/g, '')
  } catch {
    return query
  }
}

export async function generateFollowUpQuestions(context: string, query: string, answer: string): Promise<string[]> {
  if (!OPENROUTER_API_KEY) return generateFallbackQuestions(query, answer)
  try {
    const truncatedAnswer = answer.length > 500 ? answer.substring(0, 500) + '...' : answer
    const prompt = `User asked: "${query}"\nYou answered: "${truncatedAnswer}"\n\nGenerate 3 follow-up questions. Return only the questions, one per line.`

    const messages: Message[] = [
      { role: 'system', content: 'You generate follow-up questions.' },
      { role: 'user', content: prompt }
    ]

    const data = await followUpQuestionsLimiter.schedule(async () => {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Aditya Portfolio AI'
        },
        body: JSON.stringify({ model: LLM_MODEL, messages, max_tokens: LLM_MAX_TOKENS, temperature: LLM_TEMPERATURE })
      })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      return response.json()
    }, 1)

    const questionsText = data.choices?.[0]?.message?.content?.trim() || ''
    if (!questionsText) return generateFallbackQuestions(query, answer)

    const questions = questionsText
      .split('\n')
      .map((q: string) => q.trim().replace(/^\d+\.?\s*/, '').replace(/^[-•]\s*/, ''))
      .filter((q: string) => q.length > 0)
      .slice(0, 3)

    return questions.length < 3
      ? [...questions, ...generateFallbackQuestions(query, answer)].slice(0, 3)
      : questions
  } catch {
    return generateFallbackQuestions(query, answer)
  }
}

export function generateFallbackQuestions(query: string, answer: string): string[] {
  const lowerAnswer = answer.toLowerCase()
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes('project') || lowerAnswer.includes('project')) {
    return ["What technologies did you use?", "What was the outcome?", "What did you learn from it?"]
  }
  if (lowerQuery.includes('skill') || lowerAnswer.includes('skill')) {
    return ["How did you develop these skills?", "Which projects used these skills?", "What advice would you give someone learning this?"]
  }
  if (lowerQuery.includes('journey') || lowerAnswer.includes('career')) {
    return ["What were key turning points?", "How did you transition between roles?", "What advice would you give someone starting out?"]
  }
  return ["Can you tell me more about that?", "What other projects relate to this?", "How did this impact your career?"]
}

export async function compressMemory(conversationHistory: string): Promise<string> {
  if (!OPENROUTER_API_KEY) return conversationHistory
  try {
    const prompt = `Summarize this conversation into key points (max 200 words):\n\n${conversationHistory}\n\nProvide a concise summary:`
    const messages: Message[] = [
      { role: 'system', content: 'You compress conversation history into concise summaries.' },
      { role: 'user', content: prompt }
    ]
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Aditya Portfolio AI'
      },
      body: JSON.stringify({ model: LLM_MODEL, messages, max_tokens: 300, temperature: 0.3 })
    })
    if (!response.ok) return conversationHistory
    const data = await response.json()
    return data.choices[0].message.content.trim()
  } catch {
    return conversationHistory
  }
}