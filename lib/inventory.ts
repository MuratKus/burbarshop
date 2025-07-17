import { prisma } from '@/lib/prisma'

export interface InventoryItem {
  variantId: string
  quantity: number
}

export interface InventoryCheck {
  variantId: string
  requested: number
  available: number
  isAvailable: boolean
}

/**
 * Check if requested quantities are available in stock
 */
export async function checkInventoryAvailability(items: InventoryItem[]): Promise<InventoryCheck[]> {
  const results: InventoryCheck[] = []

  for (const item of items) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      select: { stock: true }
    })

    if (!variant) {
      throw new Error(`Product variant ${item.variantId} not found`)
    }

    results.push({
      variantId: item.variantId,
      requested: item.quantity,
      available: variant.stock,
      isAvailable: variant.stock >= item.quantity
    })
  }

  return results
}

/**
 * Reserve inventory for an order (reduce stock)
 * This should be done atomically when an order is placed
 */
export async function reserveInventory(items: InventoryItem[]): Promise<void> {
  // Use a transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // First, check availability within the transaction
    for (const item of items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stock: true, product: { select: { title: true } } }
      })

      if (!variant) {
        throw new Error(`Product variant ${item.variantId} not found`)
      }

      if (variant.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${variant.product.title}. ` +
          `Requested: ${item.quantity}, Available: ${variant.stock}`
        )
      }
    }

    // If all items are available, update the stock
    for (const item of items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }
  })
}

/**
 * Release inventory back to stock (for order cancellations)
 */
export async function releaseInventory(items: InventoryItem[]): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      })
    }
  })
}

/**
 * Get low stock alerts (variants with stock below threshold)
 */
export async function getLowStockItems(threshold: number = 5) {
  return await prisma.productVariant.findMany({
    where: {
      stock: {
        lte: threshold
      }
    },
    include: {
      product: {
        select: {
          title: true,
          type: true
        }
      }
    },
    orderBy: {
      stock: 'asc'
    }
  })
}

/**
 * Update stock for a specific variant (admin function)
 */
export async function updateVariantStock(variantId: string, newStock: number): Promise<void> {
  if (newStock < 0) {
    throw new Error('Stock cannot be negative')
  }

  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: newStock }
  })
}