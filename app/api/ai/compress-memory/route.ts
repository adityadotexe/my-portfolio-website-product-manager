// app/api/ai/compress-memory/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Guard: skip if API key is missing or placeholder
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey.startsWith('sk-placeholder') || apiKey === 'sk-') {
    return NextResponse.json({
      originalLength: 0,
      compressedLength: 0,
      compressedMemory: '',
      error: 'AI features not configured',
    })
  }

  try {
    const { compressMemory } = await import('@/lib/ai/service')
    const body = await req.json()
    const { conversationHistory } = body

    if (!conversationHistory || typeof conversationHistory !== 'string') {
      return NextResponse.json(
        { error: 'Conversation history is required' },
        { status: 400 }
      )
    }

    const compressedMemory = await compressMemory(conversationHistory)

    return NextResponse.json({
      originalLength: conversationHistory.length,
      compressedLength: compressedMemory.length,
      compressedMemory,
    })
  } catch (error) {
    console.error('[Compress Memory API] Error:', error)
    return NextResponse.json({
      originalLength: 0,
      compressedLength: 0,
      compressedMemory: '',
      error: 'Compression failed',
    })
  }
}