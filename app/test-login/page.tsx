'use client'

import { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/Button'

export default function TestLoginPage() {
  const [email, setEmail] = useState('muratjj@gmail.com')

  const handleLogin = () => {
    // Simulate login by setting user in localStorage
    const user = {
      id: 'user-' + Date.now(),
      name: 'Murat',
      email: email
    }
    
    localStorage.setItem('user', JSON.stringify(user))
    window.location.href = '/profile/orders'
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.reload()
  }

  return (
    <main className="min-h-screen bg-orange-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Login</h1>
            <p className="text-gray-600 mb-6">This is a test page to simulate logging in as a user to see the guest order linking feature.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                />
              </div>
              
              <Button 
                onClick={handleLogin}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                🔐 Login as {email}
              </Button>
              
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                🚪 Logout
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">How to Test:</h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Make sure you have guest orders with email: {email}</li>
                <li>2. Click &quot;Login&quot; above</li>
                <li>3. You&apos;ll be redirected to &quot;My Orders&quot; page</li>
                <li>4. Guest orders will be automatically linked to your account</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}