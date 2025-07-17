import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, orderId } = await request.json()

    if (!email || !orderId) {
      return NextResponse.json(
        { error: 'Email and Order ID are required' },
        { status: 400 }
      )
    }

    // Clean and normalize inputs
    const cleanEmail = email.toLowerCase().trim()
    const cleanOrderId = orderId.trim()

    // Search for order by email and either full order ID or last 8 characters
    const order = await prisma.order.findFirst({
      where: {
        email: cleanEmail,
        OR: [
          { id: cleanOrderId },
          { id: { endsWith: cleanOrderId.toLowerCase() } },
          // Also check if they entered the display format (last 8 chars uppercase)
          { id: { endsWith: cleanOrderId.toLowerCase().replace(/^#/, '') } }
        ]
      },
      select: {
        id: true,
        status: true,
        createdAt: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { 
          error: 'Order not found. Please check your email address and order ID.' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Order found successfully'
    })

  } catch (error) {
    console.error('Order tracking error:', error)
    return NextResponse.json(
      { error: 'Unable to track order. Please try again.' },
      { status: 500 }
    )
  }
}