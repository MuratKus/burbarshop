import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, generateOrderConfirmationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, paymentMethod } = await request.json()

    // Get session data
    const sessionData = global.mockSessions?.[sessionId]
    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Simulate payment validation
    const isValidCard = paymentMethod.cardNumber.replace(/\s/g, '') === '4242424242424242'
    
    if (!isValidCard) {
      return NextResponse.json({ error: 'Invalid card number. Use 4242 4242 4242 4242 for testing.' }, { status: 400 })
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        email: sessionData.email,
        subtotal: sessionData.subtotal,
        shippingCost: sessionData.shippingCost,
        total: sessionData.total,
        status: 'PENDING',
        paymentMethod: 'stripe',
        paymentId: 'mock_payment_' + Date.now(),
        shippingAddress: JSON.stringify(sessionData.shippingAddress),
        items: {
          create: sessionData.items.map((item: any) => ({
            productId: item.productId,
            productVariantId: item.variantId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true,
            productVariant: true
          }
        }
      }
    })

    // Store order ID in session for success page
    global.mockSessions[sessionId].orderId = order.id

    // Send order confirmation email
    try {
      const emailHtml = generateOrderConfirmationEmail(order)
      await sendEmail({
        to: order.email,
        subject: `Order Confirmation - #${order.id.slice(-8).toUpperCase()}`,
        html: emailHtml
      })
      console.log('✅ Order confirmation email sent to:', order.email)
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError)
      // Don't fail the order if email fails
    }

    // Clean up old sessions (optional)
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    for (const [key, value] of Object.entries(global.mockSessions || {})) {
      if ((value as any).timestamp < oneHourAgo) {
        delete global.mockSessions[key]
      }
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      message: 'Payment processed successfully'
    })
  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed', details: error.message },
      { status: 500 }
    )
  }
}