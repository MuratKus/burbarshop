import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json()

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()

    // Find user with valid magic link token
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: {
        id: true,
        email: true,
        name: true,
        magicLinkToken: true,
        magicLinkExpires: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if token matches
    if (user.magicLinkToken !== token) {
      return NextResponse.json(
        { error: 'Invalid verification link' },
        { status: 401 }
      )
    }

    // Check if token has expired
    if (!user.magicLinkExpires || user.magicLinkExpires < new Date()) {
      return NextResponse.json(
        { error: 'Verification link has expired. Please request a new one.' },
        { status: 401 }
      )
    }

    // Clear the magic link token (one-time use)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        magicLinkToken: null,
        magicLinkExpires: null
      }
    })

    // Return user data (excluding sensitive fields)
    const { magicLinkToken, magicLinkExpires, ...userWithoutToken } = user

    return NextResponse.json({
      success: true,
      message: 'Magic link verified successfully',
      user: userWithoutToken
    })

  } catch (error) {
    console.error('Magic link verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}