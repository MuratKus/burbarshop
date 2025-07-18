#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔧 Setting up environment-specific configuration...\n')

// Check if we're in Vercel deployment
const isVercel = process.env.VERCEL === '1'
const isProduction = process.env.NODE_ENV === 'production'
const isPreview = process.env.VERCEL_ENV === 'preview'

console.log('Environment detected:')
console.log(`- VERCEL: ${isVercel}`)
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`- VERCEL_ENV: ${process.env.VERCEL_ENV}`)

// Determine which DATABASE_URL to use
let databaseUrl

if (isVercel) {
  // In Vercel (production/preview), use Neon's DATABASE_DATABASE_URL
  databaseUrl = process.env.DATABASE_DATABASE_URL || process.env.DATABASE_POSTGRES_URL
  console.log('\n✅ Using Vercel/Neon database configuration')
} else {
  // Local development - check for existing DATABASE_URL
  if (process.env.DATABASE_URL) {
    databaseUrl = process.env.DATABASE_URL
    console.log('\n✅ Using local DATABASE_URL')
  } else if (process.env.DATABASE_DATABASE_URL) {
    databaseUrl = process.env.DATABASE_DATABASE_URL
    console.log('\n✅ Using pulled Neon DATABASE_DATABASE_URL for local development')
  } else {
    // No fallback - require proper database configuration
    console.log('\n❌ No PostgreSQL database URL found!')
    console.log('   Please ensure DATABASE_URL is set in .env.local')
    console.log('   Expected format: postgres://user:password@host:port/database')
    process.exit(1)
  }
}

// Set the environment variable for this process
process.env.DATABASE_URL = databaseUrl

console.log(`\n🗄️  Database URL: ${databaseUrl.replace(/:[^:@]*@/, ':***@')}`)
console.log('\n✨ Environment setup complete!')

// Export for programmatic use
module.exports = {
  databaseUrl,
  isVercel,
  isProduction,
  isPreview
}