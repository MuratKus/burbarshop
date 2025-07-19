import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { fromEmail } = await request.json().catch(() => ({}))
    
    const apiKey = process.env.SENDGRID_API_KEY
    const testFromEmail = fromEmail || 'burcinbar@gmail.com'
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing SENDGRID_API_KEY'
      }, { status: 400 })
    }

    const sgMail = await import('@sendgrid/mail')
    sgMail.setApiKey(apiKey)
    
    console.log(`🔧 Testing with sender: ${testFromEmail}`)
    
    const msg = {
      to: 'burcinbar@gmail.com',
      from: testFromEmail, // Try different senders
      subject: `Sender Test: ${testFromEmail}`,
      text: `Test email from ${testFromEmail} at ${new Date().toISOString()}`,
      html: `
        <h2>🔧 Sender Authentication Test</h2>
        <p><strong>From:</strong> ${testFromEmail}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p>If you receive this, sender authentication is working!</p>
      `
    }
    
    const result = await sgMail.send(msg)
    
    return NextResponse.json({
      success: true,
      message: `Email sent from ${testFromEmail}`,
      statusCode: result[0]?.statusCode,
      messageId: result[0]?.headers?.['x-message-id']
    })

  } catch (error: any) {
    console.error('❌ Verified sender test failed:', error)
    
    // SendGrid specific error handling
    if (error.response?.body?.errors) {
      const sgErrors = error.response.body.errors
      return NextResponse.json({
        success: false,
        error: 'SendGrid API Error',
        sendgridErrors: sgErrors,
        statusCode: error.response.status
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.response?.status
    }, { status: 500 })
  }
}