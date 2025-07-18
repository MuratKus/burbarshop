'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, ShoppingCart } from 'lucide-react'
import { useCart } from '@/components/CartProvider'

interface CartToastProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  productColor?: string
  productSize?: string
  quantity: number
}

export function CartToast({ isOpen, onClose, productName, productColor, productSize, quantity }: CartToastProps) {
  const { cartItemCount } = useCart()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300) // Wait for animation to complete
  }

  if (!isOpen) return null

  return (
    <>
      {/* Toast positioned top-right, no backdrop */}
      <div 
        className={`fixed top-4 right-4 z-50 w-[400px] max-w-[90vw] bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-600 tracking-wide uppercase">
            Just Added to Your Cart
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-teal-600 mb-2">
                {productName}
              </h3>
              
              {/* Product Attributes */}
              <div className="space-y-1 text-sm text-gray-600">
                {productColor && (
                  <p>Color: {productColor}</p>
                )}
                {productSize && (
                  <p>Size: {productSize}</p>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">Qty: {quantity}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Link
              href="/cart"
              onClick={handleClose}
              className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              View Cart ({cartItemCount})
            </Link>
            
            <button
              onClick={handleClose}
              className="w-full text-gray-600 hover:text-gray-800 transition-colors py-2 text-sm font-medium underline"
            >
              Continue shopping
            </button>
          </div>
        </div>
      </div>
    </>
  )
}