import { NextRequest, NextResponse } from 'next/server'
import { updateVariantStock } from '@/lib/inventory'

export async function POST(request: NextRequest) {
  try {
    const { variantId, stock } = await request.json()

    if (!variantId || stock === undefined || stock === null) {
      return NextResponse.json(
        { error: 'Variant ID and stock level are required' },
        { status: 400 }
      )
    }

    if (stock < 0) {
      return NextResponse.json(
        { error: 'Stock cannot be negative' },
        { status: 400 }
      )
    }

    await updateVariantStock(variantId, stock)

    return NextResponse.json({
      success: true,
      message: `Stock updated to ${stock} for variant ${variantId}`
    })

  } catch (error) {
    console.error('Error updating stock:', error)
    return NextResponse.json(
      { error: 'Failed to update stock', details: error.message },
      { status: 500 }
    )
  }
}