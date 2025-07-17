'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { Navigation } from '@/components/Navigation'

export default function TrackOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    orderId: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('') // Clear error when user starts typing
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          orderId: formData.orderId.trim()
        })
      })

      if (response.ok) {
        const { orderId } = await response.json()
        router.push(`/orders/${orderId}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Order not found. Please check your email and order ID.')
      }
    } catch (error) {
      setError('Unable to track order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">📦</div>
              <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
              <p className="text-gray-600 mt-2">Enter your email and order ID to view order status</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="your@email.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The email address used when placing the order
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order ID
                </label>
                <input
                  type="text"
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="ABC12345 or full order ID"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Found in your order confirmation email
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || !formData.email || !formData.orderId}
                className="w-full"
                size="lg"
              >
                {loading ? 'Searching...' : 'Track Order'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Need help? Contact us at{' '}
                <a href="mailto:support@burbarshop.com" className="text-blue-600 hover:text-blue-800">
                  support@burbarshop.com
                </a>
              </p>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Don't have an account yet?{' '}
                  <Link href="/auth/register" className="text-blue-600 hover:text-blue-800">
                    Create one
                  </Link>
                  {' '}to easily track all your orders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}