'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/Button'
import { useCart } from '@/components/CartProvider'

interface WishlistItem {
  id: string
  productId: string
  createdAt: string
  product: {
    id: string
    title: string
    images: string
    basePrice: number
    type: string
    variants: Array<{
      id: string
      size: string
      price: number
      stock: number
    }>
  }
}

export default function WishlistPage() {
  const { addToCart } = useCart()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removingItem, setRemovingItem] = useState<string | null>(null)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const userData = localStorage.getItem('user')
      let params = new URLSearchParams()

      if (userData) {
        const user = JSON.parse(userData)
        params.append('userId', user.id)
      } else {
        // For guest users, we could use email from localStorage or prompt for it
        // For now, we'll just show empty wishlist for guests
        setWishlistItems([])
        setLoading(false)
        return
      }

      const response = await fetch(`/api/wishlist?${params}`)
      if (response.ok) {
        const data = await response.json()
        setWishlistItems(data)
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    setRemovingItem(productId)
    try {
      const userData = localStorage.getItem('user')
      let params = new URLSearchParams()
      params.append('productId', productId)

      if (userData) {
        const user = JSON.parse(userData)
        params.append('userId', user.id)
      } else {
        // Handle guest removal
        return
      }

      const response = await fetch(`/api/wishlist?${params}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.productId !== productId))
      } else {
        alert('Failed to remove item from wishlist')
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      alert('Failed to remove item from wishlist')
    } finally {
      setRemovingItem(null)
    }
  }

  const moveToCart = (item: WishlistItem) => {
    const firstVariant = item.product.variants[0]
    if (firstVariant && firstVariant.stock > 0) {
      addToCart(item.product.id, firstVariant.id, 1)
      removeFromWishlist(item.productId)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading wishlist...</div>
          </div>
        </div>
      </main>
    )
  }

  // Check if user is logged in
  const userData = localStorage.getItem('user')
  if (!userData) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow p-8">
              <div className="text-4xl mb-4">💝</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
              <p className="text-gray-600 mb-6">
                Create an account or sign in to save your favorite products to your wishlist.
              </p>
              <div className="space-y-3">
                <Link href="/auth/magic" className="w-full">
                  <Button className="w-full">Sign In with Magic Link</Button>
                </Link>
                <Link href="/auth/register" className="w-full">
                  <Button variant="outline" className="w-full">Create Account</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <Link href="/shop">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">💝</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-6">
                Discover amazing products and save your favorites here for later.
              </p>
              <Link href="/shop">
                <Button>Browse Products</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => {
                const images = JSON.parse(item.product.images || '[]')
                const firstImage = images.length > 0 ? images[0] : null
                const firstVariant = item.product.variants[0]

                return (
                  <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <Link href={`/products/${item.product.id}`}>
                      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                        {firstImage ? (
                          <img 
                            src={firstImage} 
                            alt={item.product.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        ) : (
                          <span className="text-6xl">🎨</span>
                        )}
                      </div>
                    </Link>
                    
                    <div className="p-4">
                      <Link href={`/products/${item.product.id}`}>
                        <h3 className="font-medium text-gray-900 mb-2 hover:text-gray-600 transition-colors">
                          {item.product.title}
                        </h3>
                      </Link>
                      
                      <p className="text-sm text-gray-500 mb-2 capitalize">
                        {item.product.type.replace('_', ' ')}
                      </p>
                      
                      <p className="text-lg font-semibold text-gray-900 mb-4">
                        €{item.product.basePrice.toFixed(2)}
                      </p>

                      <div className="space-y-2">
                        <Button
                          onClick={() => moveToCart(item)}
                          disabled={!firstVariant || firstVariant.stock === 0}
                          className="w-full"
                          size="sm"
                        >
                          {!firstVariant || firstVariant.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => removeFromWishlist(item.productId)}
                          disabled={removingItem === item.productId}
                          className="w-full"
                          size="sm"
                        >
                          {removingItem === item.productId ? 'Removing...' : 'Remove'}
                        </Button>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Added {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}