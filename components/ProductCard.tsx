'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from './Button'
import { useCart } from './CartProvider'
import { useToast } from './Toast'
import { Heart } from 'lucide-react'

interface ProductCardProps {
  id: string
  slug: string
  title: string
  type: string
  basePrice: number
  image?: string
  className?: string
  variants?: Array<{
    id: string
    size: string
    price: number
    stock: number
  }>
}

interface ProductCardComponent extends ProductCardProps {
  totalStock: number
  isOutOfStock: boolean
}

export function ProductCard({ 
  id, 
  slug,
  title, 
  type, 
  basePrice, 
  image, 
  className,
  variants 
}: ProductCardProps) {
  const totalStock = variants?.reduce((sum, variant) => sum + variant.stock, 0) || 0
  const isOutOfStock = totalStock === 0
  const { addToCart } = useCart()
  const { success } = useToast()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  
  const formatType = (type: string) => {
    return type.toLowerCase().replace('_', ' ')
  }

  const formatPrice = (price: number) => {
    return `€${price.toFixed(2)}`
  }

  const decodeHtmlEntities = (text: string) => {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    return textarea.value
  }

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setWishlistLoading(true)
    try {
      // Simple toggle for demo - you can implement real wishlist API later
      setIsInWishlist(!isInWishlist)
      success(
        isInWishlist ? 'Removed from wishlist' : 'Added to wishlist', 
        decodeHtmlEntities(title)
      )
    } catch (error) {
      console.error('Wishlist error:', error)
    } finally {
      setWishlistLoading(false)
    }
  }

  return (
    <div className={`product-card group ${className || ''}`}>
      {/* Enhanced card with better visual distinction */}
      <div className="bg-primary-warm border border-neutral-border-light/40 rounded-xl p-4 shadow-elegant hover:shadow-elegant-hover transition-all duration-300 group-hover:border-accent-ochre/50 group-hover:bg-white group-hover:scale-[1.02]">
        <div className="relative">
          <Link href={`/shop/${slug}`}>
          <div className="relative aspect-square rounded-lg mb-3 overflow-hidden bg-primary-cream">
            {image ? (
              <Image
                src={image}
                alt={title}
                fill
                className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                  isOutOfStock ? 'grayscale opacity-60' : ''
                }`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized={image.includes('etsystatic.com')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className={`text-6xl opacity-50 ${
                  isOutOfStock ? 'grayscale' : ''
                }`}>{image || '🎨'}</span>
              </div>
            )}
            
            {/* Sold Out Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  SOLD OUT
                </span>
              </div>
            )}
            
            {/* Wishlist Heart Icon - appears on hover */}
            <button
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-sm z-10"
            >
              <Heart 
                className={`w-4 h-4 transition-all duration-200 ${
                  isInWishlist 
                    ? 'text-red-500 fill-red-500' 
                    : 'text-gray-600 hover:text-red-500'
                }`} 
              />
            </button>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>
        </div>
        
        <div className="space-y-2 px-1">
          <div className="space-y-1">
            <Link href={`/shop/${slug}`}>
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-accent-coral transition-colors line-clamp-2 leading-relaxed">
                {decodeHtmlEntities(title)}
              </h3>
            </Link>
            
            {/* Product type badge with brand colors */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-sage/20 text-primary-charcoal/80">
                {formatType(type)}
              </span>
              {isOutOfStock && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-600">
                  No Stock
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-1">
            <p className="text-lg font-semibold text-gray-900">
              {formatPrice(basePrice)}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              disabled={isOutOfStock}
              className={`opacity-0 group-hover:opacity-100 transition-all duration-200 text-xs h-7 px-2 border-gray-200 hover:border-accent-coral hover:text-accent-coral ${
                isOutOfStock ? 'cursor-not-allowed opacity-50' : ''
              }`}
              onClick={(e) => {
                e.preventDefault()
                if (isOutOfStock) return
                const firstVariant = variants?.[0]
                if (firstVariant && firstVariant.stock > 0) {
                  addToCart({
                    productId: id,
                    variantId: firstVariant.id,
                    quantity: 1
                  })
                  success('Added to cart!', `${decodeHtmlEntities(title)} (${firstVariant.size})`, true)
                }
              }}
            >
              {isOutOfStock ? 'Sold Out' : 'Quick Add'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}