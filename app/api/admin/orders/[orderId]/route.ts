import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sendEmail, generateOrderConfirmationEmail } from '@/lib/email'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { status, trackingNumber, trackingUrl } = await request.json()
    const { orderId } = await params

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // If marking as shipped, require tracking number
    if (status === 'SHIPPED' && !trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required when marking as shipped' },
        { status: 400 }
      )
    }

    // Valid statuses
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = { status }
    
    // Add tracking info if provided
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber
    }
    if (trackingUrl) {
      updateData.trackingUrl = trackingUrl
    }
    
    // Set shipped timestamp if marking as shipped
    if (status === 'SHIPPED') {
      updateData.shippedAt = new Date()
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
            productVariant: true
          }
        },
        user: true
      }
    })

    // Send status update email if the status changed to shipped or delivered
    if (status === 'SHIPPED' || status === 'DELIVERED') {
      try {
        await sendEmail({
          to: updatedOrder.email,
          subject: `Order Update: Your order is ${status.toLowerCase()}`,
          html: generateOrderStatusEmail(updatedOrder, status)
        })
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError)
        // Don't fail the status update if email fails
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to ${status}`
    })

  } catch (error) {
    console.error('Order status update error:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}

function generateOrderStatusEmail(order: any, status: string): string {
  const shippingAddress = JSON.parse(order.shippingAddress)
  const statusEmoji = status === 'SHIPPED' ? '📦' : '✅'
  const statusMessage = status === 'SHIPPED' 
    ? 'Your order has been shipped!' 
    : 'Your order has been delivered!'
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Status Update</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 48px; margin-bottom: 20px;">${statusEmoji}</div>
        <h1 style="color: #333;">${statusMessage}</h1>
        <p style="color: #666;">Order #${order.id.slice(-8).toUpperCase()}</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-bottom: 15px;">Order Details</h2>
        <p><strong>Order ID:</strong> #${order.id.slice(-8).toUpperCase()}</p>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Total:</strong> €${order.total.toFixed(2)}</p>
        ${order.trackingNumber ? `
          <div style="margin-top: 15px; padding: 15px; background-color: #e6f3ff; border-radius: 5px;">
            <p style="margin: 0; color: #0066cc;"><strong>📦 Tracking Information</strong></p>
            <p style="margin: 5px 0 0 0;"><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
            ${order.trackingUrl ? `
              <p style="margin: 5px 0 0 0;">
                <a href="${order.trackingUrl}" style="color: #0066cc; text-decoration: none;">
                  🔗 Track Your Package
                </a>
              </p>
            ` : ''}
          </div>
        ` : ''}
      </div>
      
      <div style="margin-bottom: 20px;">
        <h2 style="color: #333; margin-bottom: 15px;">Items</h2>
        ${order.items.map((item: any) => `
          <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <p><strong>${item.product.title}</strong> (${item.productVariant.size})</p>
            <p>Quantity: ${item.quantity} × €${item.price.toFixed(2)}</p>
          </div>
        `).join('')}
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-bottom: 15px;">Shipping Address</h2>
        <p>${shippingAddress.firstName} ${shippingAddress.lastName}</p>
        <p>${shippingAddress.address}</p>
        <p>${shippingAddress.city}, ${shippingAddress.postalCode}</p>
        <p>${shippingAddress.country}</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXTAUTH_URL}/orders/${order.id}" 
           style="background-color: #333; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Order Details
        </a>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you have questions, contact us at support@burbarshop.com
        </p>
      </div>
    </body>
    </html>
  `
}