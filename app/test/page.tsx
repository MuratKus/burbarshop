'use client'

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        } else {
          setError('Failed to load products')
        }
      } catch (err) {
        setError('Error: ' + err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Test Page</h1>
      
      <div className="mb-4 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">API Test</h2>
        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {!loading && !error && (
          <div>
            <p className="text-gray-900 mb-2">Products loaded: {products.length}</p>
            <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto text-sm text-gray-800 max-h-64">
              {JSON.stringify(products, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mb-4 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Styling Test</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-100 p-4 rounded text-blue-900">Blue</div>
          <div className="bg-green-100 p-4 rounded text-green-900">Green</div>
          <div className="bg-red-100 p-4 rounded text-red-900">Red</div>
        </div>
      </div>
    </div>
  )
}