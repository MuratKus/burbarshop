export interface EmailData {
  to: string
  subject: string
  html: string
}

export async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY || !process.env.EMAIL_FROM) {
      console.log('📧 Email would be sent (SendGrid not configured):')
      console.log('To:', data.to)
      console.log('Subject:', data.subject)
      console.log('HTML:', data.html)
      return true
    }

    // SendGrid integration
    const sgMail = await import('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    
    const msg = {
      to: data.to,
      from: process.env.EMAIL_FROM,
      subject: data.subject,
      html: data.html,
    }
    
    await sgMail.send(msg)
    console.log('✅ Email sent successfully to:', data.to)
    
    return true
  } catch (error) {
    console.error('❌ Email sending error:', error)
    return false
  }
}

export function generateOrderConfirmationEmail(order: any): string {
  const shippingAddress = JSON.parse(order.shippingAddress)
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333;">Order Confirmation</h1>
        <p style="color: #666;">Thank you for your order!</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-bottom: 15px;">Order Details</h2>
        <p><strong>Order ID:</strong> #${order.id.slice(-8).toUpperCase()}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Total:</strong> €${order.total.toFixed(2)}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h2 style="color: #333; margin-bottom: 15px;">Items Ordered</h2>
        ${order.items.map((item: any) => `
          <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <p><strong>${item.product.title}</strong> (${item.productVariant.size})</p>
            <p>Quantity: ${item.quantity} × €${item.price.toFixed(2)} = €${(item.quantity * item.price).toFixed(2)}</p>
          </div>
        `).join('')}
        
        <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #333;">
          <p style="margin: 5px 0;"><strong>Subtotal:</strong> €${order.subtotal.toFixed(2)}</p>
          <p style="margin: 5px 0;"><strong>Shipping:</strong> €${order.shippingCost.toFixed(2)}</p>
          <p style="margin: 5px 0; font-size: 18px;"><strong>Total:</strong> €${order.total.toFixed(2)}</p>
        </div>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-bottom: 15px;">Shipping Address</h2>
        <p>${shippingAddress.firstName} ${shippingAddress.lastName}</p>
        <p>${shippingAddress.address}</p>
        <p>${shippingAddress.city}, ${shippingAddress.postalCode}</p>
        <p>${shippingAddress.country}</p>
        ${shippingAddress.phone ? `<p>Phone: ${shippingAddress.phone}</p>` : ''}
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #666; margin-bottom: 10px;">Track your order:</p>
        <a href="${process.env.NEXTAUTH_URL}/orders/${order.id}" 
           style="background-color: #333; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Order Status
        </a>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email. Please do not reply.<br>
          If you have questions, contact us at support@burbarshop.com
        </p>
      </div>
    </body>
    </html>
  `
}