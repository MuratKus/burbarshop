import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_development', {
  apiVersion: '2024-06-20'
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { orderId, items, customerEmail, total } = req.body

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${item.product.title} - ${item.variant.size}`,
          description: item.product.type,
          images: item.product.images ? JSON.parse(item.product.images).slice(0, 1) : []
        },
        unit_amount: Math.round(item.variant.price * 100) // Convert to cents
      },
      quantity: item.quantity
    }))

    // Add shipping as a line item if applicable
    const shippingCost = total - items.reduce((sum: number, item: any) => sum + (item.variant.price * item.quantity), 0)
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Shipping',
            description: 'Standard shipping'
          },
          unit_amount: Math.round(shippingCost * 100)
        },
        quantity: 1
      })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${req.headers.origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${req.headers.origin}/checkout`,
      metadata: {
        order_id: orderId.toString()
      },
      shipping_address_collection: {
        allowed_countries: ['DE', 'AT', 'CH', 'NL', 'FR', 'IT', 'ES', 'US', 'CA', 'GB']
      }
    })

    res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
}