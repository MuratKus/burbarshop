'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type PromoType = 'PERCENTAGE' | 'FIXED_AMOUNT'

export default function NewPromoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE' as PromoType,
    value: 0,
    minOrder: '',
    maxUses: '',
    validUntil: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          description: formData.description || null,
          type: formData.type,
          value: formData.value,
          minOrder: formData.minOrder ? parseFloat(formData.minOrder) : null,
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null
        })
      })

      if (response.ok) {
        router.push('/admin/promos')
      } else {
        const error = await response.json()
        alert(error.message || 'Error creating promo code')
      }
    } catch (error) {
      alert('Error creating promo code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Promo Code</h1>
        <p className="text-gray-600 mt-2">Set up a new discount code for your customers</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 max-w-2xl">
        <div className="space-y-6">
          {/* Promo Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Promo Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder="SUMMER20"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">Will be converted to uppercase</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Summer sale discount"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as PromoType }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.type === 'PERCENTAGE' ? 'Percentage' : 'Dollar Amount'} *
              </label>
              <input
                type="number"
                step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                min="0"
                max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                required
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>

          {/* Minimum Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Order Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.minOrder}
              onChange={(e) => setFormData(prev => ({ ...prev, minOrder: e.target.value }))}
              placeholder="50.00"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for no minimum</p>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Uses
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxUses}
                onChange={(e) => setFormData(prev => ({ ...prev, maxUses: e.target.value }))}
                placeholder="100"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid Until
              </label>
              <input
                type="datetime-local"
                value={formData.validUntil}
                onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for no expiry</p>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
            <div className="text-sm text-gray-600">
              <p>
                <strong>Code:</strong> {formData.code || 'PROMO_CODE'}
              </p>
              <p>
                <strong>Discount:</strong>{' '}
                {formData.type === 'PERCENTAGE' 
                  ? `${formData.value}% off` 
                  : `$${formData.value.toFixed(2)} off`
                }
              </p>
              {formData.minOrder && (
                <p><strong>Minimum order:</strong> ${parseFloat(formData.minOrder).toFixed(2)}</p>
              )}
              {formData.maxUses && (
                <p><strong>Usage limit:</strong> {formData.maxUses} uses</p>
              )}
              {formData.validUntil && (
                <p><strong>Expires:</strong> {new Date(formData.validUntil).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Promo Code'}
          </button>
        </div>
      </form>
    </div>
  )
}