'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { Navigation } from '@/components/Navigation'

export default function MagicLinkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to send magic link')
      }
    } catch (error) {
      setError('Failed to send magic link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-4xl mb-4">📧</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h1>
              <p className="text-gray-600 mb-6">
                We've sent a magic link to <strong>{email}</strong>. 
                Click the link in your email to sign in instantly.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>🔗 Magic Link:</strong> The link will expire in 15 minutes for security.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Send Another Link
                </Button>
                
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

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">✨</div>
              <h1 className="text-2xl font-bold text-gray-900">Magic Link Sign In</h1>
              <p className="text-gray-600 mt-2">
                Enter your email and we'll send you a secure sign-in link
              </p>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="your@email.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll create an account for you if you don't have one
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full"
                size="lg"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <Link href="/auth/register" className="block text-sm text-blue-600 hover:text-blue-800">
                  Create account with password
                </Link>
                <Link href="/auth/login" className="block text-sm text-blue-600 hover:text-blue-800">
                  Sign in with password
                </Link>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/track-order" className="text-sm text-gray-500 hover:text-gray-700">
                Just want to track an order?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}