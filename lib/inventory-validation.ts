import { CartItem } from '@/lib/cart'

export interface InventoryIssue {
  productTitle: string
  variantSize: string
  requestedQuantity: number
  availableStock: number
  correctedQuantity: number
}

export interface CartItemWithStock extends CartItem {
  product: {
    id: string
    title: string
  }
  variant: {
    id: string
    size: string
    stock: number
  }
}

export function validateCartInventory(cartItems: CartItemWithStock[]): {
  hasIssues: boolean
  issues: InventoryIssue[]
  correctedCart: CartItem[]
} {
  const issues: InventoryIssue[] = []
  const correctedCart: CartItem[] = []

  cartItems.forEach(item => {
    const availableStock = item.variant.stock
    const requestedQuantity = item.quantity
    
    if (requestedQuantity > availableStock) {
      // Add to issues list
      issues.push({
        productTitle: item.product.title,
        variantSize: item.variant.size,
        requestedQuantity,
        availableStock,
        correctedQuantity: availableStock
      })
      
      // Add corrected item to cart (only if stock > 0)
      if (availableStock > 0) {
        correctedCart.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: availableStock
        })
      }
    } else {
      // No issues, keep original quantity
      correctedCart.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: requestedQuantity
      })
    }
  })

  return {
    hasIssues: issues.length > 0,
    issues,
    correctedCart
  }
}