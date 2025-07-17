import { NextRequest, NextResponse } from 'next/server'
import { getLowStockItems } from '@/lib/inventory'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const threshold = parseInt(searchParams.get('threshold') || '5')

    const lowStockItems = await getLowStockItems(threshold)

    return NextResponse.json({
      threshold,
      count: lowStockItems.length,
      items: lowStockItems
    })

  } catch (error) {
    console.error('Error fetching low stock items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch low stock items', details: error.message },
      { status: 500 }
    )
  }
}