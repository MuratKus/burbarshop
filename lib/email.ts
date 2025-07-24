// SendGrid Template IDs
const SENDGRID_TEMPLATES = {
  ORDER_CONFIRMATION: 'd-74e1fd2cc7d7462f8723a9ed0bc87fa8',
  NEWSLETTER: 'd-11506f6b042f48b7b6674a5a95d73c50',
  SHIPPING_NOTIFICATION: '', // Add when you create this template
}

export interface EmailData {
  to: string
  subject: string
  html?: string
  templateId?: string
  dynamicTemplateData?: any
}

export async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    if (process.env.SENDGRID_API_KEY && process.env.EMAIL_FROM) {
      // SendGrid with dynamic templates
      const sgMail = await import('@sendgrid/mail')
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      
      const msg: any = {
        to: data.to,
        from: process.env.EMAIL_FROM,
      }

      // Use dynamic template if provided, otherwise use HTML
      if (data.templateId && data.dynamicTemplateData) {
        msg.templateId = data.templateId
        msg.dynamicTemplateData = data.dynamicTemplateData
      } else {
        msg.subject = data.subject
        msg.html = data.html
      }
      
      await sgMail.send(msg)
      console.log('✅ Email sent successfully via SendGrid to:', data.to)
      return true
    } else {
      // No email service configured - log what would be sent
      console.log('📧 Email would be sent (No email service configured):')
      console.log('To:', data.to)
      console.log('Subject:', data.subject || 'Template Email')
      if (data.templateId) {
        console.log('Template ID:', data.templateId)
        console.log('Template Data:', JSON.stringify(data.dynamicTemplateData, null, 2))
      } else {
        console.log('HTML:', data.html?.substring(0, 200) + '...')
      }
      return true
    }
  } catch (error) {
    console.error('❌ Email sending error:', error)
    return false
  }
}

// Send order confirmation email using dynamic template
export async function sendOrderConfirmationEmail(order: any): Promise<boolean> {
  try {
    const shippingAddress = JSON.parse(order.shippingAddress)
    
    const templateData = {
      order_number: `#${order.id.slice(-8).toUpperCase()}`,
      order_date: new Date(order.createdAt).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      customer_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      shipping_address: shippingAddress.address,
      shipping_city: shippingAddress.city,
      shipping_postal: shippingAddress.postalCode,
      shipping_country: shippingAddress.country,
      shipping_phone: shippingAddress.phone || '',
      items: order.items.map((item: any) => ({
        title: item.product.title,
        size: item.productVariant.size,
        quantity: item.quantity,
        item_total: (item.quantity * item.price).toFixed(2)
      })),
      subtotal: order.subtotal.toFixed(2),
      shipping_cost: order.shippingCost.toFixed(2),
      free_shipping: order.shippingCost === 0,
      total: order.total.toFixed(2),
      track_order_url: `${process.env.NEXTAUTH_URL || 'https://burbarshop.com'}/orders/${order.id}`,
      shop_url: `${process.env.NEXTAUTH_URL || 'https://burbarshop.com'}/shop`
    }
    
    return await sendEmail({
      to: order.email,
      templateId: SENDGRID_TEMPLATES.ORDER_CONFIRMATION,
      dynamicTemplateData: templateData
    })
  } catch (error) {
    console.error('❌ Order confirmation email error:', error)
    return false
  }
}

// Send newsletter email using dynamic template
export async function sendNewsletterEmail(
  to: string, 
  newsletterData: {
    newsletter_title: string
    newsletter_subtitle: string
    main_message: string
    featured_artwork?: any
    new_arrivals?: any[]
    special_offer?: any
    behind_scenes?: string
  }
): Promise<boolean> {
  try {
    const templateData = {
      ...newsletterData,
      website_url: process.env.NEXTAUTH_URL || 'https://burbarshop.com',
      unsubscribe_url: `${process.env.NEXTAUTH_URL || 'https://burbarshop.com'}/unsubscribe`,
      preferences_url: `${process.env.NEXTAUTH_URL || 'https://burbarshop.com'}/email-preferences`
    }
    
    return await sendEmail({
      to,
      templateId: SENDGRID_TEMPLATES.NEWSLETTER,
      dynamicTemplateData: templateData
    })
  } catch (error) {
    console.error('❌ Newsletter email error:', error)
    return false
  }
}

// Send admin notification email when new order is created
export async function sendAdminOrderNotification(order: any): Promise<boolean> {
  try {
    const shippingAddress = JSON.parse(order.shippingAddress)
    const adminEmail = process.env.ADMIN_EMAIL || 'me@murat-kus.com'
    
    const orderItemsList = order.items.map((item: any) => 
      `• ${item.quantity}x ${item.product.title} (${item.productVariant.size}) - €${(item.quantity * item.price).toFixed(2)}`
    ).join('\n')
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>🚨 New Order Alert - ${order.id.slice(-8).toUpperCase()}</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 25px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚨 NEW ORDER ALERT</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Time to create some art!</p>
        </div>
        
        <!-- Order Info -->
        <div style="background-color: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin-bottom: 20px; font-size: 20px;">Order Details</h2>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
            <p style="margin: 5px 0; color: #2c3e50;"><strong>Order ID:</strong> #${order.id.slice(-8).toUpperCase()}</p>
            <p style="margin: 5px 0; color: #2c3e50;"><strong>Total:</strong> €${order.total.toFixed(2)}</p>
            <p style="margin: 5px 0; color: #2c3e50;"><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}</p>
            <p style="margin: 5px 0; color: #2c3e50;"><strong>Time:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          </div>
          
          <h3 style="color: #2c3e50; margin: 20px 0 10px 0;">🎨 Items to Prepare:</h3>
          <div style="background-color: #f8fffe; padding: 15px; border-radius: 8px; border-left: 4px solid #7c9885;">
            ${order.items.map((item: any) => `
              <div style="margin: 10px 0; padding: 10px; background-color: white; border-radius: 6px;">
                <p style="margin: 0; font-weight: 600; color: #2c3e50;">${item.quantity}x ${item.product.title}</p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Size: ${item.productVariant.size} • €${(item.quantity * item.price).toFixed(2)}</p>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Customer Info -->
        <div style="background-color: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin-bottom: 15px; font-size: 20px;">📦 Ship To:</h2>
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 5px 0; color: #2c3e50; font-weight: 600;">${shippingAddress.firstName} ${shippingAddress.lastName}</p>
            <p style="margin: 5px 0; color: #666;">${shippingAddress.address}</p>
            <p style="margin: 5px 0; color: #666;">${shippingAddress.city}, ${shippingAddress.postalCode}</p>
            <p style="margin: 5px 0; color: #666;">${shippingAddress.country}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${order.email}</p>
            ${shippingAddress.phone ? `<p style="margin: 5px 0; color: #666;"><strong>Phone:</strong> ${shippingAddress.phone}</p>` : ''}
          </div>
        </div>
        
        <!-- Action Required -->
        <div style="background: linear-gradient(135deg, #7c9885 0%, #6b8473 100%); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h3 style="color: white; margin: 0 0 10px 0;">🎯 Next Steps:</h3>
          <p style="color: rgba(255,255,255,0.9); margin: 0; line-height: 1.6;">
            1. Prepare the artwork<br>
            2. Update order status in admin panel<br>
            3. Add tracking info when shipped
          </p>
        </div>
        
        <!-- Quick Actions -->
        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.NEXTAUTH_URL || 'https://burbarshop.com'}/admin/orders" 
             style="display: inline-block; background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 5px;">
            🏃‍♀️ Go to Orders
          </a>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            Burcinbar Admin Notification • Order ID: #${order.id.slice(-8).toUpperCase()}
          </p>
        </div>
      </body>
      </html>
    `
    
    return await sendEmail({
      to: adminEmail,
      subject: `🚨 New Order #${order.id.slice(-8).toUpperCase()} - €${order.total.toFixed(2)}`,
      html: emailHtml
    })
  } catch (error) {
    console.error('❌ Admin notification email error:', error)
    return false
  }
}

// Legacy function for backward compatibility
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