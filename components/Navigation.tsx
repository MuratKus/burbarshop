'use client'

import Link from 'next/link'
import { useCart } from './CartProvider'
import { useEffect, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
}

export function Navigation() {
  const { cartItemCount } = useCart()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        localStorage.removeItem('user')
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <nav className="bg-white border-b border-orange-100 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition-colors">
            🎨 Burbarshop
          </Link>
          <div className="flex space-x-8 items-center">
            <Link href="/shop" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
              Shop
            </Link>
            {!user && (
              <Link href="/track-order" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
                Track Order
              </Link>
            )}
            <Link href="/about" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
              About
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile/orders" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
                  📦 My Orders
                </Link>
                <Link href="/wishlist" className="text-gray-600 hover:text-red-500 transition-colors text-lg">
                  ♥
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-600 transition-colors text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/auth/magic" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                Sign In
              </Link>
            )}
            
            <Link href="/cart" className="bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-2 rounded-full transition-colors relative flex items-center space-x-2">
              <span className="text-base">🛒</span>
              <span className="font-medium">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}