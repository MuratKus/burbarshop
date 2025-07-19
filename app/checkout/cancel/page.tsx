'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/Navigation'

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
            <p className="text-lg text-gray-600 mb-6">
              Your payment was cancelled. No charges were made to your account.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-700">
                Your items are still in your cart and will be saved for 24 hours. 
                You can continue shopping or try checking out again.
              </p>
            </div>
            
            <div className="space-y-4">
              <Button className="w-full" size="lg">
                <Link href="/cart">Return to Cart</Link>
              </Button>
              
              <Button variant="outline" className="w-full">
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}