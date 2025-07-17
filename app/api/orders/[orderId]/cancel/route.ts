import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { releaseInventory, type InventoryItem } from '@/lib/inventory'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    // Find the order with its items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Only allow cancellation if order is PENDING or PROCESSING
    if (!['PENDING', 'PROCESSING'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Order cannot be cancelled in current status' },
        { status: 400 }
      )
    }

    // Prepare inventory items for release
    const inventoryItems: InventoryItem[] = order.items.map(item => ({
      variantId: item.productVariantId,
      quantity: item.quantity
    }))

    // Release inventory back to stock and update order status
    await prisma.$transaction(async (tx) => {
      // Update order status to CANCELLED
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      })

      // Release inventory
      await releaseInventory(inventoryItems)
    })

    console.log(`Order ${orderId} cancelled and inventory released`)

    // Fetch updated order
    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            productVariant: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully and inventory restored',
      order: updatedOrder
    })

  } catch (error) {
    console.error('Error cancelling order:', error)
    return NextResponse.json(
      { error: 'Failed to cancel order', details: error.message },
      { status: 500 }
    )
  }
}