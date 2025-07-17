'use client'

import type { CartItem } from './types'

const CART_STORAGE_KEY = 'burbarshop-cart'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY)
    return cartData ? JSON.parse(cartData) : []
  } catch {
    return []
  }
}

export function addToCart(item: Omit<CartItem, 'quantity'> & { quantity?: number }): void {
  const cart = getCart()
  const existingItemIndex = cart.findIndex(
    cartItem => cartItem.productId === item.productId && cartItem.variantId === item.variantId
  )

  if (existingItemIndex >= 0) {
    // Update quantity of existing item
    cart[existingItemIndex].quantity += item.quantity || 1
  } else {
    // Add new item to cart
    cart.push({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity || 1
    })
  }

  saveCart(cart)
}

export function removeFromCart(productId: string, variantId: string): void {
  const cart = getCart()
  const updatedCart = cart.filter(
    item => !(item.productId === productId && item.variantId === variantId)
  )
  saveCart(updatedCart)
}

export function updateCartItemQuantity(
  productId: string, 
  variantId: string, 
  quantity: number
): void {
  const cart = getCart()
  const itemIndex = cart.findIndex(
    item => item.productId === productId && item.variantId === variantId
  )

  if (itemIndex >= 0) {
    if (quantity <= 0) {
      removeFromCart(productId, variantId)
    } else {
      cart[itemIndex].quantity = quantity
      saveCart(cart)
    }
  }
}

export function clearCart(): void {
  saveCart([])
}

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => {
    const price = item.variant?.price || item.product?.basePrice || 0
    return total + (price * item.quantity)
  }, 0)
}

export function getCartItemCount(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + item.quantity, 0)
}

function saveCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    // Dispatch custom event for cart updates
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }))
  } catch (error) {
    console.error('Failed to save cart:', error)
  }
}