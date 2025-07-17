import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: any) {
  try {
    const orderData = JSON.parse(session.metadata.orderData)
    
    const order = await prisma.order.create({
      data: {
        email: session.customer_email,
        total: orderData.total,
        shippingCost: 5.99,
        status: 'PENDING',
        paymentIntentId: session.payment_intent,
        shippingAddress: {
          name: session.shipping_details?.name || '',
          address: session.shipping_details?.address || orderData.shippingAddress
        },
        items: {
          create: orderData.items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    })

    for (const item of orderData.items) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    console.log('Order created successfully:', order.id)
    
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}