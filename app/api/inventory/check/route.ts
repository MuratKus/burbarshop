import { NextRequest, NextResponse } from 'next/server'
import { checkInventoryAvailability, type InventoryItem } from '@/lib/inventory'

export async function POST(request: NextRequest) {
  try {
    const { items }: { items: InventoryItem[] } = await request.json()

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    const inventoryChecks = await checkInventoryAvailability(items)

    const allAvailable = inventoryChecks.every(check => check.isAvailable)
    const outOfStockItems = inventoryChecks.filter(check => !check.isAvailable)

    return NextResponse.json({
      available: allAvailable,
      checks: inventoryChecks,
      outOfStockItems: outOfStockItems.length > 0 ? outOfStockItems : undefined
    })

  } catch (error) {
    console.error('Error checking inventory:', error)
    return NextResponse.json(
      { error: 'Failed to check inventory', details: error.message },
      { status: 500 }
    )
  }
}