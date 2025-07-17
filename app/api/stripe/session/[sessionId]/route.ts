import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params
    // Handle mock sessions
    if (sessionId.startsWith('mock_session_')) {
      const sessionData = global.mockSessions?.[sessionId]
      
      if (!sessionData) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }

      // If order has been created (after payment), get order details
      if (sessionData.orderId) {
        const order = await prisma.order.findUnique({
          where: { id: sessionData.orderId },
          include: {
            items: {
              include: {
                product: true,
                productVariant: true
              }
            }
          }
        })

        if (order) {
          return NextResponse.json({
            id: sessionId,
            customer_email: order.email,
            amount_total: Math.round(order.total * 100), // Convert to cents
            payment_status: 'paid',
            status: 'complete',
            mock: true,
            orderId: order.id
          })
        }
      }

      // Return session data for payment page
      return NextResponse.json({
        id: sessionId,
        customer_email: sessionData.email,
        amount_total: Math.round(sessionData.total * 100), // Convert to cents
        payment_status: 'unpaid',
        status: 'open',
        mock: true,
        subtotal: sessionData.subtotal,
        shippingCost: sessionData.shippingCost,
        total: sessionData.total,
        items: sessionData.items
      })
    }

    // For real Stripe sessions (when you have valid keys)
    return NextResponse.json({ error: 'Real Stripe sessions not configured' }, { status: 404 })
  } catch (error) {
    console.error('Error retrieving session:', error)
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }
}