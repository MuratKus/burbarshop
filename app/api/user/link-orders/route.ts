import { NextRequest, NextResponse } from 'next/server'
import { linkGuestOrdersToUser } from '@/lib/link-guest-orders'

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    const result = await linkGuestOrdersToUser(userId, email)

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Error in link-orders API:', error)
    return NextResponse.json(
      { error: 'Failed to link guest orders' },
      { status: 500 }
    )
  }
}