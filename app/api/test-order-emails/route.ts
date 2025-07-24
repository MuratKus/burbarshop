import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json().catch(() => ({}))
    
    // Create a realistic mock order for testing
    const mockOrder = {
      id: `test-order-${Date.now()}`,
      email: testEmail || 'test-customer@example.com',
      createdAt: new Date().toISOString(),
      subtotal: 47.98,
      shippingCost: 8.50,
      total: 56.48,
      paymentMethod: 'stripe',
      paymentId: 'pi_test_1234567890',
      shippingAddress: JSON.stringify({
        firstName: 'Emma',
        lastName: 'Johnson',
        address: '42 Art Gallery Street',
        city: 'Amsterdam',
        postalCode: '1016 AB',
        country: 'Netherlands',
        phone: '+31 6 87654321'
      }),
      items: [
        {
          quantity: 2,
          price: 19.99,
          product: {
            title: 'Byzantine Lady Portrait - Riso Print'
          },
          productVariant: {
            size: 'A4'
          }
        },
        {
          quantity: 1,
          price: 7.99,
          product: {
            title: 'Ottoman Garden Postcard'
          },
          productVariant: {
            size: 'A6'
          }
        }
      ]
    }

    console.log('🧪 Testing order emails with mock data...')
    console.log('📧 Customer email:', mockOrder.email)
    console.log('📧 Admin email:', process.env.ADMIN_EMAIL || 'me@murat-kus.com')

    const results = {
      customerEmail: false,
      adminEmail: false,
      errors: []
    }

    // Test customer confirmation email
    try {
      results.customerEmail = await sendOrderConfirmationEmail(mockOrder)
      console.log('✅ Customer confirmation email test:', results.customerEmail ? 'SUCCESS' : 'FAILED')
    } catch (error) {
      console.error('❌ Customer email test failed:', error)
      results.errors.push(`Customer email: ${error.message}`)
    }

    // Test admin notification email  
    try {
      results.adminEmail = await sendAdminOrderNotification(mockOrder)
      console.log('✅ Admin notification email test:', results.adminEmail ? 'SUCCESS' : 'FAILED')
    } catch (error) {
      console.error('❌ Admin email test failed:', error)
      results.errors.push(`Admin email: ${error.message}`)
    }

    // Wait a moment for emails to process
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: results.customerEmail && results.adminEmail,
      message: 'Order email tests completed',
      results: {
        customerEmailSent: results.customerEmail,
        adminEmailSent: results.adminEmail,
        customerEmailAddress: mockOrder.email,
        adminEmailAddress: process.env.ADMIN_EMAIL || 'me@murat-kus.com',
        testOrderId: mockOrder.id,
        errors: results.errors
      },
      mockOrder: {
        id: mockOrder.id,
        total: mockOrder.total,
        itemCount: mockOrder.items.length,
        customer: `${JSON.parse(mockOrder.shippingAddress).firstName} ${JSON.parse(mockOrder.shippingAddress).lastName}`
      }
    })

  } catch (error) {
    console.error('❌ Order email test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to test order emails',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET method for quick testing without POST data
export async function GET() {
  try {
    // Use default test emails
    const mockRequest = new Request('http://localhost:3000/api/test-order-emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testEmail: 'test-customer@example.com' })
    })
    
    return POST(mockRequest as NextRequest)
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to run email test',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}