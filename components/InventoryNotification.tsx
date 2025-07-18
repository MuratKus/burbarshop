'use client'

import React from 'react'
import { AlertTriangle, X, ShoppingCart } from 'lucide-react'
import { Button } from './ui/button'

interface InventoryIssue {
  productTitle: string
  variantSize: string
  requestedQuantity: number
  availableStock: number
  correctedQuantity: number
}

interface InventoryNotificationProps {
  issues: InventoryIssue[]
  onClose: () => void
  onContinue: () => void
}

export function InventoryNotification({ 
  issues, 
  onClose, 
  onContinue 
}: InventoryNotificationProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Cart Updated</h3>
              <p className="text-sm text-gray-600">Some quantities were adjusted</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            {issues.map((issue, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ShoppingCart className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {issue.productTitle}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      Size: {issue.variantSize}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-600">
                        Requested: <span className="line-through text-red-500">{issue.requestedQuantity}</span>
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600 font-medium">
                        Available: {issue.availableStock}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>We have automatically updated your cart</strong> to reflect current inventory levels. 
              You can still proceed to checkout with the adjusted quantities.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onContinue}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            >
              Continue to Checkout
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Review Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}