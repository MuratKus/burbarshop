import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple admin authentication middleware
// In production, this should be replaced with proper authentication
export function middleware(request: NextRequest) {
  // Check if user is accessing admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for admin session cookie
    const adminSession = request.cookies.get('admin-session')?.value
    
    // If no session and not on login page, redirect to login
    if (!adminSession && request.nextUrl.pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // If has session and on login page, redirect to dashboard
    if (adminSession && request.nextUrl.pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*'
}