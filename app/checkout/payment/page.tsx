'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/Button'

function MockPaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')

  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })

  useEffect(() => {
    if (sessionId) {
      fetchSessionData()
    }
  }, [sessionId])

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`/api/stripe/session/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setOrderData(data)
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    let formattedValue = value
    
    // Format card number
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
      formattedValue = formattedValue.substring(0, 16)
      formattedValue = formattedValue.replace(/(.{4})/g, '$1 ').trim()
    }
    
    // Format expiry date
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '')
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4)
      }
    }
    
    // Format CVV
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 3)
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      // Process mock payment
      const response = await fetch('/api/stripe/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          paymentMethod: formData
        })
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/checkout/success?session_id=${sessionId}`)
      } else {
        alert('Payment failed. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading payment...</div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">Payment session not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
              <p className="text-gray-600 mt-2">Secure checkout powered by Stripe (Mock)</p>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">Order Summary</h2>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>€{orderData.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>€{orderData.shippingCost?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Total:</span>
                  <span>€{orderData.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="4242 4242 4242 4242"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="cardholderName"
                  value={formData.cardholderName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  required
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Test Mode:</strong> Use card number 4242 4242 4242 4242 with any future expiry date and any CVV.
                </p>
              </div>

              <Button
                type="submit"
                disabled={processing}
                className="w-full"
                size="lg"
              >
                {processing ? 'Processing...' : `Pay €${orderData.total?.toFixed(2)}`}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                🔒 Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MockPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment page...</p>
        </div>
      </div>
    }>
      <MockPaymentContent />
    </Suspense>
  )
}