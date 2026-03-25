// lib/db/mongodb.ts
import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME || 'portfolio_ai'

if (!uri) {
  console.warn('Warning: MONGODB_URI is not defined. Database features will be disabled.')
}

const options = {}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let clientPromise: Promise<MongoClient> | null = null

if (uri) {
  let client: MongoClient
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options)
      global._mongoClientPromise = client.connect()
    }
    clientPromise = global._mongoClientPromise
  } else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

export async function getDB(): Promise<Db> {
  if (!clientPromise) throw new Error('MongoDB not configured')
  try {
    const client = await clientPromise
    return client.db(dbName)
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    throw error
  }
}

export async function getDBAI(): Promise<Db> {
  if (!clientPromise) throw new Error('MongoDB not configured')
  try {
    const client = await clientPromise
    return client.db(dbName)
  } catch (error) {
    console.error('Error connecting to AI MongoDB:', error)
    throw error
  }
}

export async function getClient(): Promise<MongoClient> {
  if (!clientPromise) throw new Error('MongoDB not configured')
  return clientPromise
}

export async function testConnection(): Promise<boolean> {
  if (!clientPromise) return false
  try {
    const client = await clientPromise
    await client.db(dbName).command({ ping: 1 })
    console.log('✅ Successfully connected to MongoDB')
    return true
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    return false
  }
}

export default clientPromise