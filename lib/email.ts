export interface EmailData {
  to: string
  subject: string
  html: string
}

export async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    // Check if Resend is configured (preferred) or SendGrid fallback
    if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
      // Resend integration (preferred)
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: data.to,
        subject: data.subject,
        html: data.html,
      })
      
      console.log('✅ Email sent successfully via Resend to:', data.to)
      return true
    } else if (process.env.SENDGRID_API_KEY && process.env.EMAIL_FROM) {
      // SendGrid fallback
      const sgMail = await import('@sendgrid/mail')
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      
      const msg = {
        to: data.to,
        from: process.env.EMAIL_FROM,
        subject: data.subject,
        html: data.html,
      }
      
      await sgMail.send(msg)
      console.log('✅ Email sent successfully via SendGrid to:', data.to)
      return true
    } else {
      // No email service configured - log what would be sent
      console.log('📧 Email would be sent (No email service configured):')
      console.log('To:', data.to)
      console.log('Subject:', data.subject)
      console.log('HTML:', data.html.substring(0, 200) + '...')
      return true
    }
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Burcinbar</title>
    </head>
    <body style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fafafa; color: #2c3e50;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; padding: 20px; background-color: #7c9885; border-radius: 12px;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background-color: white; border-radius: 8px; margin-bottom: 15px;">
          <span style="color: #7c9885; font-weight: bold; font-size: 24px;">B</span>
        </div>
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Order Confirmed! 🎉</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Thank you for supporting independent art!</p>
      </div>
      
      <!-- Order Summary Card -->
      <div style="background-color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #2c3e50; margin-bottom: 20px; font-size: 20px; font-weight: 600;">Order Summary</h2>
        <div style="border-left: 4px solid #7c9885; padding-left: 15px; margin-bottom: 20px;">
          <p style="margin: 8px 0; color: #666;"><strong style="color: #2c3e50;">Order Number:</strong> <span style="color: #7c9885; font-weight: bold;">#${order.id.slice(-8).toUpperCase()}</span></p>
          <p style="margin: 8px 0; color: #666;"><strong style="color: #2c3e50;">Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin: 8px 0; color: #666;"><strong style="color: #2c3e50;">Status:</strong> <span style="background-color: #7c9885; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">CONFIRMED</span></p>
        </div>
      </div>
      
      <!-- Items Ordered -->
      <div style="background-color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #2c3e50; margin-bottom: 20px; font-size: 20px; font-weight: 600;">Your Beautiful Art Pieces</h2>
        ${order.items.map((item: any) => `
          <div style="border-bottom: 1px solid #f0f0f0; padding: 15px 0; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <p style="margin: 0 0 5px 0; font-weight: 600; color: #2c3e50; font-size: 16px;">${item.product.title}</p>
              <p style="margin: 0; color: #666; font-size: 14px;">${item.productVariant.size} • Qty: ${item.quantity}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-weight: 600; color: #7c9885; font-size: 16px;">€${(item.quantity * item.price).toFixed(2)}</p>
            </div>
          </div>
        `).join('')}
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #7c9885;">
          <div style="display: flex; justify-content: space-between; margin: 8px 0;">
            <span style="color: #666;">Subtotal:</span>
            <span style="color: #2c3e50; font-weight: 600;">€${order.subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 8px 0;">
            <span style="color: #666;">Shipping:</span>
            <span style="color: #2c3e50; font-weight: 600;">${order.shippingCost === 0 ? '<span style="color: #7c9885;">Free</span>' : `€${order.shippingCost.toFixed(2)}`}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 15px 0 0 0; padding-top: 10px; border-top: 1px solid #f0f0f0;">
            <span style="color: #2c3e50; font-size: 18px; font-weight: bold;">Total:</span>
            <span style="color: #7c9885; font-size: 20px; font-weight: bold;">€${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <!-- Shipping Address -->
      <div style="background-color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #2c3e50; margin-bottom: 20px; font-size: 20px; font-weight: 600;">📦 Shipping Address</h2>
        <div style="background-color: #f8fffe; padding: 15px; border-radius: 8px; border-left: 4px solid #7c9885;">
          <p style="margin: 5px 0; color: #2c3e50; font-weight: 600;">${shippingAddress.firstName} ${shippingAddress.lastName}</p>
          <p style="margin: 5px 0; color: #666;">${shippingAddress.address}</p>
          <p style="margin: 5px 0; color: #666;">${shippingAddress.city}, ${shippingAddress.postalCode}</p>
          <p style="margin: 5px 0; color: #666;">${shippingAddress.country}</p>
          ${shippingAddress.phone ? `<p style="margin: 5px 0; color: #666;">Phone: ${shippingAddress.phone}</p>` : ''}
        </div>
      </div>
      
      <!-- What's Next -->
      <div style="background-color: #fff8f0; padding: 25px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #f4a261;">
        <h2 style="color: #2c3e50; margin-bottom: 15px; font-size: 18px; font-weight: 600;">🎨 What Happens Next?</h2>
        <ul style="margin: 0; padding-left: 20px; color: #666;">
          <li style="margin: 8px 0;">Your beautiful art prints will be carefully prepared</li>
          <li style="margin: 8px 0;">We'll send you tracking information once shipped</li>
          <li style="margin: 8px 0;">Expected delivery: 3-7 business days</li>
        </ul>
      </div>
      
      <!-- Call to Action -->
      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #666; margin-bottom: 15px; font-size: 16px;">Track your order status:</p>
        <a href="${process.env.NEXTAUTH_URL || 'https://burcinbarbaros.com'}/orders/${order.id}" 
           style="display: inline-block; background-color: #7c9885; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          📦 View Order Status
        </a>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; margin-top: 40px; padding-top: 25px; border-top: 1px solid #e0e0e0;">
        <div style="margin-bottom: 15px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background-color: #7c9885; border-radius: 6px; margin-bottom: 10px;">
            <span style="color: white; font-weight: bold; font-size: 16px;">B</span>
          </div>
          <p style="margin: 0; color: #7c9885; font-weight: 600; font-size: 18px;">Burcinbar</p>
        </div>
        <p style="color: #999; font-size: 13px; margin: 10px 0;">
          This is an automated confirmation email. Please do not reply.<br>
          Questions? Contact us at <a href="mailto:burcinbar@gmail.com" style="color: #7c9885;">burcinbar@gmail.com</a>
        </p>
        <p style="color: #bbb; font-size: 11px; margin: 15px 0 0 0;">
          Unique art prints crafted with love • Independent artist • Worldwide shipping
        </p>
      </div>
    </body>
    </html>
  `
}