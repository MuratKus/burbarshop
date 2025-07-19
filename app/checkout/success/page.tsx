'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header, Footer } from '@/components/ui/header'
import { useCart } from '@/components/CartProvider'
import { Container, Section } from '@/components/ui/layout'
import { ScrollAnimation } from '@/components/ui/scroll-animations'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const orderId = searchParams?.get('order_id')
  const paymentIntentId = searchParams?.get('payment_intent')
  const shouldClearCart = searchParams?.get('clear_cart')
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cartCleared, setCartCleared] = useState(false)

  useEffect(() => {
    // Clear cart if coming from successful checkout (only once)
    if (shouldClearCart === 'true' && !cartCleared) {
      clearCart()
      setCartCleared(true)
    }
    
    if (orderId) {
      fetchOrderDetails()
    } else {
      setLoading(false)
    }
  }, [orderId, shouldClearCart, cartCleared]) // Fixed dependency array

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
      <main className="public-layout">
        <Header />
        <Section>
          <Container>
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-sage rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="text-lg text-neutral-gray font-medium">Loading your order details...</div>
                <div className="text-sm text-neutral-gray/70 mt-2">Just a moment while we prepare everything for you</div>
              </div>
            </div>
          </Container>
        </Section>
      </main>
    )
  }

  return (
    <main className="public-layout">
      <Header />
      
      {/* Page Header */}
      <Section className="bg-primary-sage text-white py-16">
        <Container>
          <ScrollAnimation animation="fadeIn">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Order Confirmed! 🎉
              </h1>
              <p className="text-white/90 text-lg">
                Thank you for supporting independent art!
              </p>
            </div>
          </ScrollAnimation>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="max-w-3xl mx-auto">
            <ScrollAnimation animation="fadeIn">
              <div className="bg-white rounded-xl shadow-elegant p-8 text-center border border-neutral-border-light">
                <div className="w-20 h-20 mx-auto mb-6 bg-primary-sage/10 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-primary-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <p className="text-xl text-neutral-gray mb-8">
                  Your order has been successfully processed and is being prepared with care.
                </p>
            
                {orderDetails && (
                  <div className="bg-primary-cream/30 rounded-xl p-6 mb-8 text-left border border-primary-sage/20">
                    <h2 className="text-xl font-semibold text-primary-charcoal mb-4 text-center">Your Order Summary</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-primary-sage/20">
                        <span className="text-neutral-gray font-medium">Order Number:</span>
                        <span className="font-bold text-primary-sage">#{orderDetails.id?.slice(-8).toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-primary-sage/20">
                        <span className="text-neutral-gray font-medium">Confirmation sent to:</span>
                        <span className="font-medium text-primary-charcoal">{orderDetails.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-primary-sage/20">
                        <span className="text-neutral-gray font-medium">Order Total:</span>
                        <span className="font-bold text-lg text-primary-charcoal">€{orderDetails.total?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-primary-sage/20">
                        <span className="text-neutral-gray font-medium">Status:</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-sage/20 text-primary-sage">
                          ✓ {orderDetails.status === 'PENDING' ? 'Confirmed' : orderDetails.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-neutral-gray font-medium">Items Ordered:</span>
                        <span className="font-medium text-primary-charcoal">{orderDetails.items?.length || 0} beautiful pieces</span>
                      </div>
                    </div>
                  </div>
                )}
            
                <div className="bg-accent-coral/10 rounded-xl p-6 mb-6 border border-accent-coral/20">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-accent-coral/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-accent-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-primary-charcoal mb-2">📧 Confirmation Email Sent!</h3>
                    <p className="text-sm text-neutral-gray mb-3">
                      A detailed confirmation has been sent to <strong>{orderDetails?.email}</strong> with your order details and what to expect next.
                    </p>
                    <p className="text-xs text-neutral-gray/70">
                      Don&apos;t see it? Check your spam folder or contact us for help.
                    </p>
                  </div>
                </div>
            
                <div className="bg-gradient-to-r from-primary-cream to-primary-sage/10 rounded-xl p-6 mb-6 border border-neutral-border-light">
                  <div className="text-center">
                    <h3 className="font-semibold text-primary-charcoal mb-2">🎨 What Happens Next?</h3>
                    <div className="space-y-2 text-sm text-neutral-gray">
                      <p>• Your beautiful art prints will be carefully prepared</p>
                      <p>• We&apos;ll send you tracking information once shipped</p>
                      <p>• Expected delivery: 3-7 business days</p>
                    </div>
                  </div>
                </div>
            
                <div className="space-y-4">
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/shop">
                      🛍️ Continue Shopping
                    </Link>
                  </Button>
                  
                  {orderDetails?.id && (
                    <Button variant="outline" className="w-full border-primary-sage text-primary-sage hover:bg-primary-sage/5" asChild>
                      <Link href={`/orders/${orderDetails.id}`}>
                        📦 Track Your Order
                      </Link>
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full border-neutral-border-light text-neutral-gray hover:bg-neutral-gray/5" asChild>
                    <Link href="/">
                      🏠 Back to Home
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </Container>
      </Section>
      
      <Footer />
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-primary-cream/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-sage mx-auto mb-4"></div>
          <p className="text-neutral-gray">Loading order details...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}