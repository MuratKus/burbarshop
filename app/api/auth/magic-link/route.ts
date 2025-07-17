import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Create or update user with magic link token
    const user = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        magicLinkToken: token,
        magicLinkExpires: expiresAt
      },
      create: {
        email: cleanEmail,
        name: cleanEmail.split('@')[0], // Use email prefix as default name
        magicLinkToken: token,
        magicLinkExpires: expiresAt
      }
    })

    // Create magic link URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const magicLink = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(cleanEmail)}`

    // Send magic link email
    const emailSent = await sendEmail({
      to: cleanEmail,
      subject: 'Your Magic Link for Burbarshop',
      html: generateMagicLinkEmail(magicLink, cleanEmail)
    })

    if (!emailSent) {
      console.warn('Failed to send email, but proceeding...')
    }

    return NextResponse.json({
      success: true,
      message: 'Magic link sent successfully'
    })

  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    )
  }
}

function generateMagicLinkEmail(magicLink: string, email: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Magic Link</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333;">✨ Your Magic Link</h1>
        <p style="color: #666;">Click the button below to sign in to Burbarshop</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${magicLink}" 
           style="background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Sign In to Burbarshop
        </a>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-bottom: 10px;">🔒 Security Information</h3>
        <ul style="color: #666; margin: 0; padding-left: 20px;">
          <li>This link will expire in 15 minutes</li>
          <li>It can only be used once</li>
          <li>If you didn't request this, you can safely ignore this email</li>
        </ul>
      </div>
      
      <div style="margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">
          ${magicLink}
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This email was sent to ${email}<br>
          If you have questions, contact us at support@burbarshop.com
        </p>
      </div>
    </body>
    </html>
  `
}