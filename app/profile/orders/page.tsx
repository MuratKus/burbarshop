'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/Button'

interface Order {
  id: string
  email: string
  status: string
  total: number
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      title: string
      images: string
    }
    productVariant: {
      size: string
    }
  }>
}

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [linkingOrders, setLinkingOrders] = useState(false)
  const [linkMessage, setLinkMessage] = useState('')

  // Mock user data - in real app this would come from auth context
  const user = {
    id: 'user123',
    email: 'muratjj@gmail.com'
  }

  useEffect(() => {
    fetchUserOrders()
    // Auto-link guest orders when page loads
    linkGuestOrders()
  }, [])

  const fetchUserOrders = async () => {
    try {
      // For now, get orders by email since we don't have auth implemented
      const response = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const linkGuestOrders = async () => {
    setLinkingOrders(true)
    try {
      const response = await fetch('/api/user/link-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.linked > 0) {
          setLinkMessage(result.message)
          // Refresh orders to show newly linked ones
          fetchUserOrders()
        }
      }
    } catch (error) {
      console.error('Error linking guest orders:', error)
    } finally {
      setLinkingOrders(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PROCESSING': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'SHIPPED': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-orange-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="text-lg text-gray-700 font-medium">Loading your orders...</div>
              <div className="text-sm text-gray-500 mt-2">Including any previous guest orders</div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-orange-50">
      <Navigation />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-orange-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/profile" className="hover:text-orange-600">Profile</Link>
            <span className="mx-2">/</span>
            <span className="text-orange-700 font-medium">My Orders</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-600 mt-1">All your orders in one place 📦</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            {/* Link Message */}
            {linkMessage && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">✅ {linkMessage}</p>
              </div>
            )}

            {linkingOrders && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">🔗 Checking for guest orders to link to your account...</p>
              </div>
            )}
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-orange-500">
              <div className="w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
              <p className="text-gray-600 mb-8">Ready to start your art collection? Browse our beautiful prints!</p>
              <Link href="/shop">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  🎨 Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const orderDate = new Date(order.createdAt).toLocaleDateString()
                const firstItem = order.items[0]
                const images = firstItem?.product.images ? JSON.parse(firstItem.product.images) : []
                const firstImage = images.length > 0 ? images[0] : null

                return (
                  <div key={order.id} className="bg-white rounded-xl shadow-lg border border-orange-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-600">{orderDate}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 mb-4">
                        {firstImage && (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={firstImage} 
                              alt={firstItem.product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{firstItem?.product.title}</p>
                          <p className="text-sm text-gray-600">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">€{order.total.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Link href={`/orders/${order.id}`} className="flex-1">
                          <Button variant="outline" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50">
                            View Details
                          </Button>
                        </Link>
                        {order.status === 'DELIVERED' && (
                          <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                            ⭐ Review
                          </Button>
                        )}
                      </div>
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