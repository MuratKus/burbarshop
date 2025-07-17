'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PromoCode {
  id: string
  code: string
  description: string | null
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number
  minOrder: number | null
  maxUses: number | null
  usedCount: number
  validFrom: string
  validUntil: string | null
  isActive: boolean
}

export default function PromosPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPromoCodes()
  }, [])

  const fetchPromoCodes = async () => {
    try {
      const response = await fetch('/api/admin/promo-codes')
      if (response.ok) {
        const data = await response.json()
        setPromoCodes(data)
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePromoStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })
      
      if (response.ok) {
        fetchPromoCodes()
      }
    } catch (error) {
      console.error('Error updating promo code:', error)
    }
  }

  const deletePromoCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return
    
    try {
      const response = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchPromoCodes()
      }
    } catch (error) {
      console.error('Error deleting promo code:', error)
    }
  }

  const getStatusColor = (promo: PromoCode) => {
    if (!promo.isActive) return 'bg-gray-100 text-gray-800'
    if (promo.validUntil && new Date(promo.validUntil) < new Date()) {
      return 'bg-red-100 text-red-800'
    }
    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return 'bg-orange-100 text-orange-800'
    }
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = (promo: PromoCode) => {
    if (!promo.isActive) return 'Inactive'
    if (promo.validUntil && new Date(promo.validUntil) < new Date()) {
      return 'Expired'
    }
    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return 'Used Up'
    }
    return 'Active'
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promo Codes</h1>
          <p className="text-gray-600 mt-2">Manage discount codes and promotions</p>
        </div>
        <Link 
          href="/admin/promos/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Promo Code
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valid Until
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {promoCodes.map((promo) => (
              <tr key={promo.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 font-mono">
                    {promo.code}
                  </div>
                  {promo.description && (
                    <div className="text-sm text-gray-500">
                      {promo.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {promo.type === 'PERCENTAGE' ? `${promo.value}%` : `$${promo.value.toFixed(2)}`} off
                  </div>
                  {promo.minOrder && (
                    <div className="text-xs text-gray-500">
                      Min order: ${promo.minOrder.toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {promo.usedCount}{promo.maxUses ? ` / ${promo.maxUses}` : ''}
                  </div>
                  <div className="text-xs text-gray-500">
                    {promo.maxUses ? 'uses' : 'unlimited'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {promo.validUntil ? new Date(promo.validUntil).toLocaleDateString() : 'No expiry'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(promo)}`}>
                    {getStatusText(promo)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => togglePromoStatus(promo.id, promo.isActive)}
                      className={`px-3 py-1 rounded text-xs ${
                        promo.isActive 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {promo.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deletePromoCode(promo.id)}
                      className="px-3 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {promoCodes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">🎟️</div>
            <p className="text-gray-500">No promo codes created yet. Create your first promotion!</p>
            <Link 
              href="/admin/promos/new"
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Promo Code
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}