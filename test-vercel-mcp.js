#!/usr/bin/env node

// Load environment variables from .env.local
import { readFileSync } from 'fs'
import { join } from 'path'

try {
  const envFile = readFileSync(join(process.cwd(), '.env.local'), 'utf-8')
  envFile.split('\n').forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, ...values] = line.split('=')
      const value = values.join('=').trim()
      if (key && value) {
        process.env[key.trim()] = value
      }
    }
  })
} catch (error) {
  console.error('Could not load .env.local:', error.message)
}

console.log('VERCEL_TOKEN loaded:', process.env.VERCEL_TOKEN ? `${process.env.VERCEL_TOKEN.substring(0, 10)}...` : 'NOT FOUND')

// Test a simple Vercel API call
if (process.env.VERCEL_TOKEN) {
  try {
    const response = await fetch('https://api.vercel.com/v9/projects', {
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Vercel API test successful!')
      console.log(`Found ${data.projects?.length || 0} projects`)
      if (data.projects?.length > 0) {
        console.log('Projects:', data.projects.map(p => p.name).join(', '))
      }
    } else {
      console.error('❌ Vercel API test failed:', response.status, response.statusText)
    }
  } catch (error) {
    console.error('❌ Vercel API error:', error.message)
  }
} else {
  console.error('❌ No VERCEL_TOKEN found in environment')
}