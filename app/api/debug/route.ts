import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME ? 'SET' : 'NOT SET',
    COHERE_API_KEY: process.env.COHERE_API_KEY ? 'SET' : 'NOT SET',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  })
}