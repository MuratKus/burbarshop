'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { Navigation } from '@/components/Navigation'
import { useCart } from '@/components/CartProvider'
import { StripeProvider } from '@/components/StripeProvider'
import { StripePaymentForm } from '@/components/StripePaymentForm'
import { useToast } from '@/components/Toast'

interface CheckoutFormData {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
  country: string
  phone: string
}

interface CartItemWithDetails {
  productId: string
  variantId: string
  quantity: number
  product: {
    id: string
    title: string
    images: string
    type: string
  }
  variant: {
    id: string
    size: string
    price: number
    stock: number
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, cartItemCount, clearCart } = useCart()
  const { error: showError } = useToast()
  const [cartWithDetails, setCartWithDetails] = useState<CartItemWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  const decodeHtmlEntities = (text: string) => {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    return textarea.value
  }

  // Calculate proper cart total from detailed items
  const cartTotal = cartWithDetails.reduce((total, item) => {
    return total + (item.variant.price * item.quantity)
  }, 0)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'DE',
    phone: ''
  })

  const shippingCost = cartTotal >= 50 ? 0 : 5.99
  const finalTotal = cartTotal + shippingCost

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart')
      return
    }
    fetchCartDetails()
  }, [cart, router])

  const fetchCartDetails = async () => {
    setLoading(true)
    try {
      const detailedItems = await Promise.all(
        cart.map(async (item) => {
          const productResponse = await fetch(`/api/products/${item.productId}`)
          if (productResponse.ok) {
            const product = await productResponse.json()
            const variant = product.variants.find((v: any) => v.id === item.variantId)
            
            if (variant) {
              return {
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                product: {
                  id: product.id,
                  title: product.title,
                  images: product.images,
                  type: product.type
                },
                variant: {
                  id: variant.id,
                  size: variant.size,
                  price: variant.price,
                  stock: variant.stock
                }
              }
            }
          }
          return null
        })
      )
      
      const validItems = detailedItems.filter(item => item !== null) as CartItemWithDetails[]
      setCartWithDetails(validItems)
    } catch (error) {
      console.error('Error fetching cart details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const [clientSecret, setClientSecret] = useState<string>('')
  const [paymentIntentId, setPaymentIntentId] = useState<string>('')
  const [showPayment, setShowPayment] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      // Create Stripe PaymentIntent
      const stripeResponse = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartWithDetails.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant.price
          })),
          email: formData.email,
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
            phone: formData.phone
          }
        })
      })

      if (stripeResponse.ok) {
        const { clientSecret, paymentIntentId } = await stripeResponse.json()
        setClientSecret(clientSecret)
        setPaymentIntentId(paymentIntentId)
        setShowPayment(true)
      } else {
        const errorData = await stripeResponse.json()
        console.error('Stripe error:', errorData)
        showError('Payment setup failed', 'Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      showError('Checkout failed', 'Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const [redirecting, setRedirecting] = useState(false)

  const handlePaymentSuccess = async () => {
    setRedirecting(true)
    
    try {
      // Create order in database
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId,
          items: cartWithDetails.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant.price
          })),
          email: formData.email,
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
            phone: formData.phone
          },
          subtotal: cartTotal,
          shippingCost,
          total: finalTotal
        })
      })
      
      if (orderResponse.ok) {
        const order = await orderResponse.json()
        
        // Clear cart after successful order creation
        clearCart()
        
        // Redirect to success page
        window.location.href = `/checkout/success?order_id=${order.id}&payment_intent=${paymentIntentId}`
      } else {
        const error = await orderResponse.json()
        setRedirecting(false)
        
        // Handle specific inventory errors
        if (error.error === 'Insufficient inventory' || error.error === 'Out of stock') {
          showError('Items unavailable', `Sorry, some items are no longer available: ${error.details}`)
        } else {
          showError('Order creation failed', error.message || 'Unknown error')
        }
        setRedirecting(false)
      }
    } catch (error) {
      console.error('Order creation error:', error)
      setRedirecting(false)
      showError('Order creation failed', 'Please contact support.')
    }
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    showError('Payment failed', error || 'Please try again.')
    setRedirecting(false)
  }


  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading checkout...</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/cart" className="hover:text-gray-700">Cart</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {!showPayment ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customer Information */}
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                          placeholder="your@email.com"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                          placeholder="+49 123 456 7890"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address *
                        </label>
                        <input
                          type="text"
                          name="address"
                          required
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                          placeholder="Street address"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            name="postalCode"
                            required
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country *
                        </label>
                        <select
                          name="country"
                          required
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        >
                          <option value="DE">Germany</option>
                          <option value="AT">Austria</option>
                          <option value="CH">Switzerland</option>
                          <option value="NL">Netherlands</option>
                          <option value="FR">France</option>
                          <option value="IT">Italy</option>
                          <option value="ES">Spain</option>
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="GB">United Kingdom</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                    
                    {/* Items */}
                    <div className="space-y-4 mb-6">
                      {cartWithDetails.map((item) => {
                        const images = JSON.parse(item.product.images || '[]')
                        const firstImage = images.length > 0 ? images[0] : null
                        
                        return (
                          <div key={`${item.productId}-${item.variantId}`} className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {firstImage ? (
                                <img 
                                  src={firstImage} 
                                  alt={item.product.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-lg">🎨</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {decodeHtmlEntities(item.product.title)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.variant.size} × {item.quantity}
                              </p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              €{(item.variant.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        )
                      })}
                    </div>

                    {/* Totals */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal ({cartItemCount} items)</span>
                        <span>€{cartTotal.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span>
                          {shippingCost === 0 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            `€${shippingCost.toFixed(2)}`
                          )}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                        <span>Total</span>
                        <span>€{finalTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={processing}
                      className="w-full mt-6"
                      size="lg"
                    >
                      {processing ? 'Processing...' : 'Continue to Payment'}
                    </Button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      By placing your order, you agree to our terms and conditions.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          ) : redirecting ? (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-lg shadow p-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-600 mb-4">Creating your order and preparing confirmation...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Please wait, do not refresh the page</p>
              </div>
            </div>
          ) : (
            <StripeProvider clientSecret={clientSecret}>
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
                  <p className="text-gray-600 mt-2">Secure checkout powered by Stripe</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Payment Form */}
                  <div>
                    <StripePaymentForm
                      total={finalTotal}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </div>

                  {/* Order Summary (Smaller) */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                    
                    <div className="space-y-3 mb-4">
                      {cartWithDetails.slice(0, 3).map((item) => {
                        const images = JSON.parse(item.product.images || '[]')
                        const firstImage = images.length > 0 ? images[0] : null
                        
                        return (
                          <div key={`${item.productId}-${item.variantId}`} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                              {firstImage ? (
                                <img 
                                  src={firstImage} 
                                  alt={item.product.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs">🎨</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">
                                {decodeHtmlEntities(item.product.title)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.variant.size} × {item.quantity}
                              </p>
                            </div>
                            <p className="text-xs font-medium text-gray-900">
                              €{(item.variant.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        )
                      })}
                      {cartWithDetails.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{cartWithDetails.length - 3} more items
                        </p>
                      )}
                    </div>

                    <div className="border-t pt-3 space-y-1 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span>€{cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping:</span>
                        <span>
                          {shippingCost === 0 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            `€${shippingCost.toFixed(2)}`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-gray-900 border-t pt-1">
                        <span>Total:</span>
                        <span>€{finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </StripeProvider>
          )}
        </div>
      </div>
    </main>
  )
}