'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/Button'
import { useToast } from '@/components/Toast'

interface LowStockItem {
  id: string
  size: string
  stock: number
  product: {
    title: string
    type: string
  }
}

export default function AdminInventoryPage() {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [threshold, setThreshold] = useState(5)
  const [updatingStock, setUpdatingStock] = useState<string | null>(null)
  const { success, error: showError } = useToast()

  useEffect(() => {
    fetchLowStockItems()
  }, [threshold])

  const fetchLowStockItems = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/inventory/low-stock?threshold=${threshold}`)
      if (response.ok) {
        const data = await response.json()
        setLowStockItems(data.items)
      }
    } catch (error) {
      console.error('Error fetching low stock items:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStock = async (variantId: string, newStock: number) => {
    setUpdatingStock(variantId)
    try {
      const response = await fetch(`/api/admin/inventory/update-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, stock: newStock })
      })

      if (response.ok) {
        // Refresh the list
        fetchLowStockItems()
        success('Stock updated successfully!')
      } else {
        const error = await response.json()
        showError('Error updating stock', error.message)
      }
    } catch (error) {
      console.error('Error updating stock:', error)
      showError('Failed to update stock')
    } finally {
      setUpdatingStock(null)
    }
  }

  return (
    <main className="min-h-screen bg-orange-50">
      <Navigation />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-orange-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/admin" className="hover:text-orange-600">Admin</Link>
            <span className="mx-2">/</span>
            <span className="text-orange-700 font-medium">Inventory Management</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                <p className="text-gray-600 mt-1">Monitor and manage product stock levels 📦</p>
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Low Stock Threshold:
                  </label>
                  <select
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                  >
                    <option value={3}>3 or less</option>
                    <option value={5}>5 or less</option>
                    <option value={10}>10 or less</option>
                    <option value={20}>20 or less</option>
                  </select>
                </div>
                <Button
                  onClick={fetchLowStockItems}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  🔄 Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-200">
            <div className="p-6 border-b border-orange-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Low Stock Alert ({lowStockItems.length} items)
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="text-lg text-gray-700">Loading inventory data...</div>
              </div>
            ) : lowStockItems.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All good! ✅</h3>
                <p className="text-gray-600">No items with stock ≤ {threshold}</p>
              </div>
            ) : (
              <div className="divide-y divide-orange-100">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.product.title}</h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {item.product.type.toLowerCase().replace('_', ' ')} • {item.size}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            item.stock === 0 ? 'text-red-600' : 
                            item.stock <= 3 ? 'text-red-500' : 'text-orange-500'
                          }`}>
                            {item.stock}
                          </div>
                          <div className="text-xs text-gray-500">in stock</div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            defaultValue={item.stock}
                            className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-900"
                            id={`stock-${item.id}`}
                          />
                          <Button
                            onClick={() => {
                              const input = document.getElementById(`stock-${item.id}`) as HTMLInputElement
                              const newStock = parseInt(input.value)
                              if (!isNaN(newStock) && newStock >= 0) {
                                updateStock(item.id, newStock)
                              }
                            }}
                            disabled={updatingStock === item.id}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1"
                          >
                            {updatingStock === item.id ? '...' : 'Update'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">⚠️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {lowStockItems.filter(item => item.stock === 0).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">📉</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {lowStockItems.filter(item => item.stock > 0 && item.stock <= threshold).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Threshold</p>
                  <p className="text-2xl font-bold text-gray-900">≤ {threshold}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}