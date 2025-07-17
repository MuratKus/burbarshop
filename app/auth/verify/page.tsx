'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { Navigation } from '@/components/Navigation'

function VerifyMagicLinkContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const token = searchParams?.get('token')
    const email = searchParams?.get('email')

    if (!token || !email) {
      setError('Invalid or missing verification link')
      setLoading(false)
      return
    }

    verifyMagicLink(token, email)
  }, [searchParams])

  const verifyMagicLink = async (token: string, email: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email })
      })

      if (response.ok) {
        const data = await response.json()
        // Store user session
        localStorage.setItem('user', JSON.stringify(data.user))
        setSuccess(true)
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Verification failed')
      }
    } catch (error) {
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-4xl mb-4">🔄</div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Verifying...</h1>
              <p className="text-gray-600">Please wait while we verify your magic link.</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Burbarshop!</h1>
              <p className="text-gray-600 mb-6">
                You&apos;ve been successfully signed in. Redirecting to your dashboard...
              </p>
              
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>✨ Success:</strong> Your account is now active and you can track all your orders.
                </p>
              </div>
              
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full"
                size="lg"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Verification Failed</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Common Issues:</strong>
              </p>
              <ul className="text-sm text-red-700 mt-2 text-left list-disc list-inside">
                <li>The link may have expired (valid for 15 minutes)</li>
                <li>The link may have already been used</li>
                <li>The link may be malformed</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <Link href="/auth/magic" className="w-full">
                <Button className="w-full">Get New Magic Link</Button>
              </Link>
              
              <Link href="/auth/login" className="w-full">
                <Button variant="outline" className="w-full">
                  Sign In with Password
                </Button>
              </Link>
              
              <Link href="/track-order" className="w-full">
                <Button variant="outline" className="w-full">
                  Track Order Instead
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function VerifyMagicLinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification page...</p>
        </div>
      </div>
    }>
      <VerifyMagicLinkContent />
    </Suspense>
  )
}