import { NextResponse } from 'next/server'

export async function GET() {
  // Get all environment variables related to database
  const envVars = Object.keys(process.env)
    .filter(key => key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('NEON'))
    .map(key => ({
      key,
      value: process.env[key]?.substring(0, 50) + '...' // Only show first 50 chars for security
    }))
  
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    databaseEnvVars: envVars,
    availableVars: envVars.length
  })
}