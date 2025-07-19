import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST() {
  try {
    const result = await sendEmail({
      to: 'test@example.com', // Replace with your email
      subject: 'Test Email from Burbarshop',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from your Burbarshop application.</p>
        <p>If you receive this, SendGrid is working correctly!</p>
      `
    })

    return NextResponse.json({ 
      success: result,
      message: result ? 'Email sent successfully' : 'Email sending failed'
    })
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        hasApiKey: !!process.env.SENDGRID_API_KEY,
        hasEmailFrom: !!process.env.EMAIL_FROM,
        apiKeyStart: process.env.SENDGRID_API_KEY?.substring(0, 10) + '...'
      }
    }, { status: 500 })
  }
}