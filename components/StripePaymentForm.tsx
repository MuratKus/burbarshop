'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/Button'

interface StripePaymentFormProps {
  total: number
  onSuccess: () => void
  onError: (error: string) => void
}

export function StripePaymentForm({ total, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      console.error('Stripe not loaded')
      onError('Stripe not loaded')
      return
    }

    console.log('Starting payment confirmation...')
    setProcessing(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      console.log('Payment confirmation result:', { error, paymentIntent })

      if (error) {
        console.error('Payment error:', error)
        onError(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded, calling onSuccess')
        onSuccess()
      } else {
        console.error('Payment not completed:', paymentIntent?.status)
        onError('Payment was not completed')
      }
    } catch (err) {
      console.error('Payment exception:', err)
      onError('An unexpected error occurred')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
          }}
        />
      </div>

      {/* Test Mode Notice */}
      <div className="bg-blue-50 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          <strong>Test Mode:</strong> Use card number 4242 4242 4242 4242 with any future expiry date and any CVV.
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full"
        size="lg"
      >
        {processing ? 'Processing...' : `Pay €${total.toFixed(2)}`}
      </Button>

      {/* Security Notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          🔒 Your payment information is secure and encrypted by Stripe
        </p>
      </div>
    </form>
  )
}