import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('🔧 Starting basic email test...')
    
    // Check environment variables
    const apiKey = process.env.SENDGRID_API_KEY
    const emailFrom = process.env.EMAIL_FROM
    
    console.log('📧 Email From:', emailFrom)
    console.log('🔑 API Key exists:', !!apiKey)
    console.log('🔑 API Key starts with SG:', apiKey?.startsWith('SG.'))
    
    if (!apiKey || !emailFrom) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        debug: {
          hasApiKey: !!apiKey,
          hasEmailFrom: !!emailFrom
        }
      }, { status: 400 })
    }

    // Import SendGrid
    const sgMail = await import('@sendgrid/mail')
    sgMail.setApiKey(apiKey)
    
    console.log('📮 Attempting to send basic email...')
    
    // Very basic email (no templates)
    const msg = {
      to: 'burcinbar@gmail.com', // Send to yourself
      from: emailFrom,
      subject: 'SendGrid Test - Basic Email',
      text: 'This is a plain text test email from your Burbarshop app.',
      html: `
        <h1>🎨 SendGrid Test</h1>
        <p>This is a <strong>basic HTML test</strong> email from your Burbarshop application.</p>
        <p>If you receive this, SendGrid is working correctly!</p>
        <p>Time: ${new Date().toISOString()}</p>
      `
    }
    
    console.log('📧 Sending to:', msg.to)
    console.log('📧 From:', msg.from)
    
    const result = await sgMail.send(msg)
    
    console.log('✅ Email sent successfully!')
    console.log('📊 SendGrid response:', result[0]?.statusCode)
    
    return NextResponse.json({
      success: true,
      message: 'Basic email sent successfully!',
      debug: {
        statusCode: result[0]?.statusCode,
        messageId: result[0]?.headers?.['x-message-id'],
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ Basic email test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      debug: {
        errorCode: error.code,
        statusCode: error.response?.status,
        body: error.response?.body,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}