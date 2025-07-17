'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary-cream flex items-center justify-center">
      <div className="text-center">
        <h1 className="heading-elegant text-6xl font-bold text-primary-charcoal mb-4">
          404
        </h1>
        <h2 className="heading-elegant text-2xl font-semibold text-primary-charcoal mb-6">
          Page Not Found
        </h2>
        <p className="body-elegant text-neutral-gray mb-8 max-w-md">
          Sorry, the page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center justify-center bg-accent-coral text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-coral/90 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}