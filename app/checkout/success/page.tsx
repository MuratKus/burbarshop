'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { Navigation } from '@/components/Navigation'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const paymentIntentId = searchParams.get('payment_intent')
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    } else {
      setLoading(false)
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrderDetails(data)
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
    } finally {
      setLoading(false)
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
              <div className="text-lg text-gray-700 font-medium">Loading your order details...</div>
              <div className="text-sm text-gray-500 mt-2">Just a moment while we prepare everything for you</div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-orange-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-orange-500">
            <div className="w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Order Confirmed! 🎉</h1>
            <p className="text-xl text-gray-600 mb-8">
              Thank you for supporting independent art! Your order has been successfully processed.
            </p>
            
            {orderDetails && (
              <div className="bg-orange-50 rounded-xl p-6 mb-8 text-left border border-orange-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Your Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-orange-200">
                    <span className="text-gray-700 font-medium">Order Number:</span>
                    <span className="font-bold text-orange-700">#{orderDetails.id?.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-orange-200">
                    <span className="text-gray-700 font-medium">Confirmation sent to:</span>
                    <span className="font-medium text-gray-900">{orderDetails.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-orange-200">
                    <span className="text-gray-700 font-medium">Order Total:</span>
                    <span className="font-bold text-lg text-gray-900">€{orderDetails.total?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-orange-200">
                    <span className="text-gray-700 font-medium">Status:</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      ✓ {orderDetails.status === 'PENDING' ? 'Confirmed' : orderDetails.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 font-medium">Items Ordered:</span>
                    <span className="font-medium text-gray-900">{orderDetails.items?.length || 0} beautiful pieces</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">📧 Confirmation Email Sent!</h3>
                <p className="text-sm text-blue-800 mb-3">
                  A detailed confirmation has been sent to <strong>{orderDetails?.email}</strong> with your order details and what to expect next.
                </p>
                <p className="text-xs text-blue-700">
                  Don&apos;t see it? Check your spam folder or contact us for help.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 mb-6 border border-orange-200">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">🎨 What Happens Next?</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• Your beautiful art prints will be carefully prepared</p>
                  <p>• We&apos;ll send you tracking information once shipped</p>
                  <p>• Expected delivery: 3-7 business days</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Link href="/shop" className="w-full">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" size="lg">
                  🛍️ Continue Shopping
                </Button>
              </Link>
              
              {orderDetails?.id && (
                <Link href={`/orders/${orderDetails.id}`} className="w-full">
                  <Button variant="outline" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50">
                    📦 Track Your Order
                  </Button>
                </Link>
              )}
              
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                  🏠 Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}