import { NextRequest, NextResponse } from 'next/server'

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'password' // In production, this should be hashed and stored securely
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Check credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Create response with admin session cookie
      const response = NextResponse.json({
        success: true,
        message: 'Admin login successful'
      })

      // Set admin session cookie
      response.cookies.set('admin-session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400, // 24 hours
        path: '/'
      })

      return response
    } else {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}