import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import { sendEmail } from '@/lib/email'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

// Enhanced email template for shipping notifications
function generateShippingNotificationEmail(order: any, trackingNumber: string, trackingUrl?: string) {
  const shippingAddress = JSON.parse(order.shippingAddress)
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Order Has Shipped!</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333;">Your Order Has Shipped! 📦</h1>
        <p style="color: #666;">Your Burbar Shop order is on its way!</p>
      </div>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0ea5e9;">
        <h2 style="color: #333; margin-bottom: 15px;">Tracking Information</h2>
        <p><strong>Order ID:</strong> #${order.id.slice(-8).toUpperCase()}</p>
        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
        <p><strong>Shipped Date:</strong> ${new Date().toLocaleDateString()}</p>
        
        ${trackingUrl ? `
        <div style="text-align: center; margin-top: 20px;">
          <a href="${trackingUrl}" 
             style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Track Your Package
          </a>
        </div>
        ` : ''}
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-bottom: 15px;">Shipping Address</h2>
        <p>${shippingAddress.firstName} ${shippingAddress.lastName}</p>
        <p>${shippingAddress.address}</p>
        <p>${shippingAddress.city}, ${shippingAddress.postalCode}</p>
        <p>${shippingAddress.country}</p>
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

// Parse natural language commands
function parseCommand(message: string) {
  const msg = message.toLowerCase().trim()
  
  // Order management commands
  if (msg.includes('pending orders') || msg.includes('show orders') || msg.includes('list orders')) {
    return { type: 'get_orders', filters: { status: 'PENDING' } }
  }
  
  if (msg.includes('shipped orders')) {
    return { type: 'get_orders', filters: { status: 'SHIPPED' } }
  }
  
  if (msg.includes('all orders')) {
    return { type: 'get_orders', filters: {} }
  }
  
  // Update order status
  const updateMatch = msg.match(/update order #?(\w+) to (\w+)/)
  if (updateMatch) {
    const [, orderId, status] = updateMatch
    return { 
      type: 'update_order', 
      orderId: orderId.toUpperCase(), 
      status: status.toUpperCase() 
    }
  }
  
  // Ship order with tracking
  const shipMatch = msg.match(/ship order #?(\w+) with tracking (.+)/)
  if (shipMatch) {
    const [, orderId, tracking] = shipMatch
    return { 
      type: 'ship_order', 
      orderId: orderId.toUpperCase(), 
      trackingNumber: tracking.trim() 
    }
  }
  
  // Inventory commands
  if (msg.includes('low stock') || msg.includes('inventory')) {
    return { type: 'check_inventory' }
  }
  
  // Sales analytics
  if (msg.includes('sales') || msg.includes('revenue') || msg.includes('analytics')) {
    const daysMatch = msg.match(/last (\d+) days?/)
    const days = daysMatch ? parseInt(daysMatch[1]) : 30
    return { type: 'sales_analytics', daysBack: days }
  }
  
  // Product performance
  if (msg.includes('best selling') || msg.includes('top products') || msg.includes('product performance')) {
    return { type: 'product_performance' }
  }
  
  // Customer stats
  if (msg.includes('customers') || msg.includes('customer stats')) {
    return { type: 'customer_stats' }
  }
  
  // Stripe payment lookup
  const paymentMatch = msg.match(/payment (pi_\w+)/)
  if (paymentMatch) {
    return { type: 'lookup_payment', paymentId: paymentMatch[1] }
  }
  
  return { type: 'unknown' }
}

// Execute the parsed command
async function executeCommand(command: any) {
  try {
    switch (command.type) {
      case 'get_orders': {
        const whereConditions: any = {}
        if (command.filters.status) {
          whereConditions.status = command.filters.status
        }
        
        const orders = await prisma.order.findMany({
          where: whereConditions,
          include: {
            items: {
              include: {
                product: { select: { title: true, type: true } },
                productVariant: { select: { size: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
        
        if (orders.length === 0) {
          return {
            response: `No ${command.filters.status?.toLowerCase() || ''} orders found.`,
            data: null
          }
        }
        
        const summary = orders.map(order => ({
          id: order.id.slice(-8).toUpperCase(),
          status: order.status,
          email: order.email,
          total: `€${order.total.toFixed(2)}`,
          items: order.items.length,
          created: order.createdAt.toLocaleDateString()
        }))
        
        return {
          response: `Found ${orders.length} ${command.filters.status?.toLowerCase() || ''} orders:`,
          data: summary
        }
      }
      
      case 'update_order': {
        const order = await prisma.order.findFirst({
          where: { 
            id: { endsWith: command.orderId.toLowerCase() }
          }
        })
        
        if (!order) {
          return { response: `Order #${command.orderId} not found.`, data: null }
        }
        
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: { status: command.status, updatedAt: new Date() }
        })
        
        return {
          response: `✅ Order #${command.orderId} updated to ${command.status}`,
          data: { 
            orderId: updatedOrder.id.slice(-8).toUpperCase(),
            previousStatus: order.status,
            newStatus: updatedOrder.status
          }
        }
      }
      
      case 'ship_order': {
        const order = await prisma.order.findFirst({
          where: { 
            id: { endsWith: command.orderId.toLowerCase() }
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
        
        if (!order) {
          return { response: `Order #${command.orderId} not found.`, data: null }
        }
        
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: { 
            status: 'SHIPPED',
            trackingNumber: command.trackingNumber,
            shippedAt: new Date(),
            updatedAt: new Date()
          }
        })
        
        // Send shipping notification email
        const emailHtml = generateShippingNotificationEmail(order, command.trackingNumber)
        const emailSent = await sendEmail({
          to: order.email,
          subject: `Your Burbar Shop order has shipped! #${order.id.slice(-8).toUpperCase()}`,
          html: emailHtml
        })
        
        return {
          response: `🚚 Order #${command.orderId} marked as shipped with tracking ${command.trackingNumber}. ${emailSent ? 'Email notification sent!' : 'Email notification failed.'}`,
          data: {
            orderId: updatedOrder.id.slice(-8).toUpperCase(),
            trackingNumber: command.trackingNumber,
            emailSent
          }
        }
      }
      
      case 'check_inventory': {
        const variants = await prisma.productVariant.findMany({
          include: {
            product: { select: { title: true, type: true } }
          },
          orderBy: { stock: 'asc' }
        })
        
        const lowStockItems = variants.filter(v => v.stock <= 5)
        const outOfStockItems = variants.filter(v => v.stock === 0)
        
        return {
          response: `📦 Inventory Summary:\n• ${outOfStockItems.length} items out of stock\n• ${lowStockItems.length} items low stock (≤5)\n• ${variants.length} total variants`,
          data: {
            lowStock: lowStockItems.map(v => ({
              product: v.product.title,
              size: v.size,
              stock: v.stock,
              type: v.product.type
            })),
            outOfStock: outOfStockItems.map(v => ({
              product: v.product.title,
              size: v.size,
              type: v.product.type
            }))
          }
        }
      }
      
      case 'sales_analytics': {
        const daysAgo = new Date()
        daysAgo.setDate(daysAgo.getDate() - command.daysBack)
        
        const orders = await prisma.order.findMany({
          where: {
            createdAt: { gte: daysAgo },
            status: { not: 'CANCELLED' }
          }
        })
        
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
        const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0
        
        return {
          response: `📊 Sales Analytics (Last ${command.daysBack} days):\n• ${orders.length} orders\n• €${totalRevenue.toFixed(2)} revenue\n• €${avgOrderValue.toFixed(2)} avg order value`,
          data: {
            period: `${command.daysBack} days`,
            totalOrders: orders.length,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            averageOrderValue: Math.round(avgOrderValue * 100) / 100
          }
        }
      }
      
      case 'product_performance': {
        const daysAgo = new Date()
        daysAgo.setDate(daysAgo.getDate() - 30)
        
        const orderItems = await prisma.orderItem.findMany({
          where: {
            order: {
              createdAt: { gte: daysAgo },
              status: { not: 'CANCELLED' }
            }
          },
          include: {
            product: true
          }
        })
        
        const productStats: any = {}
        orderItems.forEach(item => {
          const productId = item.product.id
          if (!productStats[productId]) {
            productStats[productId] = {
              title: item.product.title,
              totalQuantity: 0,
              totalRevenue: 0
            }
          }
          productStats[productId].totalQuantity += item.quantity
          productStats[productId].totalRevenue += item.quantity * item.price
        })
        
        const topProducts = Object.values(productStats)
          .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
          .slice(0, 5)
        
        return {
          response: `🏆 Top Products (Last 30 days):`,
          data: topProducts
        }
      }
      
      case 'customer_stats': {
        const daysAgo = new Date()
        daysAgo.setDate(daysAgo.getDate() - 30)
        
        const orders = await prisma.order.findMany({
          where: {
            createdAt: { gte: daysAgo },
            status: { not: 'CANCELLED' }
          }
        })
        
        const customerEmails = [...new Set(orders.map(o => o.email))]
        
        return {
          response: `👥 Customer Stats (Last 30 days):\n• ${customerEmails.length} unique customers\n• ${orders.length} total orders\n• ${(orders.length / customerEmails.length).toFixed(1)} avg orders per customer`,
          data: {
            uniqueCustomers: customerEmails.length,
            totalOrders: orders.length,
            averageOrdersPerCustomer: Math.round((orders.length / customerEmails.length) * 10) / 10
          }
        }
      }
      
      case 'lookup_payment': {
        const payment = await stripe.paymentIntents.retrieve(command.paymentId)
        
        return {
          response: `💳 Payment ${command.paymentId}:\n• Amount: ${payment.currency.toUpperCase()} ${(payment.amount / 100).toFixed(2)}\n• Status: ${payment.status}`,
          data: {
            id: payment.id,
            amount: payment.amount / 100,
            currency: payment.currency.toUpperCase(),
            status: payment.status,
            created: new Date(payment.created * 1000).toISOString()
          }
        }
      }
      
      default:
        return {
          response: "I'm not sure how to help with that. Try asking me about:\n\n• Orders: \"Show pending orders\", \"Update order #12345 to shipped\"\n• Inventory: \"Check low stock items\"\n• Analytics: \"Sales stats for last 7 days\"\n• Payments: \"Look up payment pi_1234567890\"",
          data: null
        }
    }
  } catch (error) {
    console.error('Command execution error:', error)
    return {
      response: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: null
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { response: 'Please provide a message.' },
        { status: 400 }
      )
    }
    
    const command = parseCommand(message)
    const result = await executeCommand(command)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { response: 'Sorry, I encountered an error processing your request.' },
      { status: 500 }
    )
  }
}