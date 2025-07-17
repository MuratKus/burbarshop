'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CartItem } from '@/lib/types'
import { getCart, addToCart as addToCartUtil, removeFromCart, updateCartItemQuantity, clearCart, getCartTotal, getCartItemCount } from '@/lib/cart'

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeFromCart: (productId: string, variantId: string) => void
  updateQuantity: (productId: string, variantId: string, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartItemCount: number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load cart from localStorage on mount
    setCart(getCart())
    setIsLoading(false)

    // Listen for cart updates
    const handleCartUpdate = (event: CustomEvent<CartItem[]>) => {
      setCart(event.detail)
    }

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener)
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener)
    }
  }, [])

  const handleAddToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    addToCartUtil(item)
    setCart(getCart())
  }

  const handleRemoveFromCart = (productId: string, variantId: string) => {
    removeFromCart(productId, variantId)
    setCart(getCart())
  }

  const handleUpdateQuantity = (productId: string, variantId: string, quantity: number) => {
    updateCartItemQuantity(productId, variantId, quantity)
    setCart(getCart())
  }

  const handleClearCart = () => {
    clearCart()
    setCart([])
  }

  const cartTotal = getCartTotal(cart)
  const cartItemCount = getCartItemCount(cart)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart: handleAddToCart,
        removeFromCart: handleRemoveFromCart,
        updateQuantity: handleUpdateQuantity,
        clearCart: handleClearCart,
        cartTotal,
        cartItemCount,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}