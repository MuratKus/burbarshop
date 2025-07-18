'use client'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { ReactNode } from 'react'

// Safely initialize Stripe with fallback
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

interface StripeProviderProps {
  children: ReactNode
  clientSecret?: string
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  // Don't render if Stripe is not configured
  if (!stripePromise) {
    console.error('Stripe publishable key not found')
    return <div>Payment system not configured</div>
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#f97316', // Orange-500 from Tailwind
        colorBackground: '#ffffff',
        colorText: '#111827', // Gray-900
        colorDanger: '#ef4444', // Red-500
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '6px',
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={clientSecret ? options : undefined}>
      {children}
    </Elements>
  )
}