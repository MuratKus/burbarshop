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
        className={`fixed top-4 right-4 z-50 w-[320px] max-w-[85vw] sm:w-[360px] sm:max-w-[90vw] bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-600 tracking-wide uppercase">
            Added to Cart
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Product Details */}
        <div className="p-3 sm:p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <h3 className="text-sm sm:text-base font-medium text-teal-600 mb-1 sm:mb-2 line-clamp-2">
                {productName}
              </h3>
              
              {/* Product Attributes */}
              <div className="space-y-0.5 text-xs sm:text-sm text-gray-600">
                {productColor && (
                  <p>Color: {productColor}</p>
                )}
                {productSize && (
                  <p>Size: {productSize}</p>
                )}
              </div>
            </div>
            
            <div className="text-right flex-shrink-0">
              <p className="text-xs sm:text-sm text-gray-600">Qty: {quantity}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Link
              href="/cart"
              onClick={handleClose}
              className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
              View Cart ({cartItemCount})
            </Link>
            
            <button
              onClick={handleClose}
              className="w-full text-gray-600 hover:text-gray-800 transition-colors py-1.5 text-xs sm:text-sm font-medium underline"
            >
              Continue shopping
            </button>
          </div>
        </div>
      </div>
    </>
  )
}