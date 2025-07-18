'use client'

import Link from 'next/link'
import { useState, useEffect, use } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/CartProvider'
import { Header, Footer } from '@/components/ui/header'
import { ProductReviews } from '@/components/ProductReviews'
import { useToast } from '@/components/Toast'
import { CartToast } from '@/components/CartToast'
import { Container, Section } from '@/components/ui/layout'
import { ScrollAnimation } from '@/components/ui/scroll-animations'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Heart, Star, Truck, Shield, Award, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface ProductVariant {
  id: string
  size: string
  price: number
  stock: number
}

interface Product {
  id: string
  title: string
  description: string | null
  type: string
  basePrice: number
  images: string
  videos?: string
  variants: ProductVariant[]
}

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params)
  const { addToCart } = useCart()
  const { success, error } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [showCartToast, setShowCartToast] = useState(false)

  const decodeHtmlEntities = (text: string) => {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    return textarea.value
  }

  const nextImage = () => {
    if (!product) return
    const images = JSON.parse(product.images || '[]')
    const videos = JSON.parse(product.videos || '[]')
    const allMedia = [
      ...images.map(url => ({ type: 'image', url })), 
      ...videos.map(videoUrl => ({ type: 'video', url: videoUrl }))
    ]
    setSelectedImageIndex((prev) => (prev + 1) % allMedia.length)
  }

  const previousImage = () => {
    if (!product) return
    const images = JSON.parse(product.images || '[]')
    const videos = JSON.parse(product.videos || '[]')
    const allMedia = [
      ...images.map(url => ({ type: 'image', url })), 
      ...videos.map(videoUrl => ({ type: 'video', url: videoUrl }))
    ]
    setSelectedImageIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length)
  }

  useEffect(() => {
    fetchProduct()
    checkWishlistStatus()
  }, [slug])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/by-slug/${slug}`)
      if (response.ok) {
        const productData = await response.json()
        setProduct(productData)
        if (productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0])
        }
      } else {
        // Product not found
        setProduct(null)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const checkWishlistStatus = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) return

      const user = JSON.parse(userData)
      const response = await fetch(`/api/wishlist?userId=${user.id}`)
      if (response.ok) {
        const wishlistItems = await response.json()
        setIsInWishlist(wishlistItems.some((item: any) => item.productId === id))
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error)
    }
  }

  const toggleWishlist = async () => {
    if (!product) return

    const userData = localStorage.getItem('user')
    if (!userData) {
      alert('Please sign in to save items to your wishlist')
      return
    }

    setWishlistLoading(true)
    try {
      const user = JSON.parse(userData)

      if (isInWishlist) {
        const response = await fetch(`/api/wishlist?productId=${product.id}&userId=${user.id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setIsInWishlist(false)
        }
      } else {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            userId: user.id
          })
        })
        if (response.ok) {
          setIsInWishlist(true)
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      alert('Failed to update wishlist')
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return
    
    // Check if quantity exceeds available stock
    if (quantity > selectedVariant.stock) {
      error('Insufficient stock', `Only ${selectedVariant.stock} items available`)
      return
    }
    
    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      quantity
    })
    
    // Show the new cart toast instead of regular toast
    setShowCartToast(true)
  }

  if (loading) {
    return (
      <main className="public-layout bg-white">
        <Header />
        <Section>
          <Container>
            <div className="flex justify-center items-center h-64">
              <div className="loading-spinner w-8 h-8 mr-4"></div>
              <div className="body-elegant text-lg text-neutral-gray">Loading product...</div>
            </div>
          </Container>
        </Section>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="public-layout bg-white">
        <Header />
        <Section>
          <Container>
            <div className="text-center py-12">
              <div className="text-6xl mb-6 opacity-50">📦</div>
              <h1 className="heading-elegant text-2xl font-bold mb-4">Product not found</h1>
              <p className="body-elegant text-neutral-gray mb-8">Sorry, this product doesn&apos;t exist or has been removed.</p>
              <Button asChild>
                <Link href="/shop">Back to Shop</Link>
              </Button>
            </div>
          </Container>
        </Section>
      </main>
    )
  }

  const images = JSON.parse(product.images || '[]')
  const videos = JSON.parse(product.videos || '[]')
  const hasImages = images.length > 0
  const hasVideos = videos.length > 0
  const allMedia = [...images.map(url => ({ type: 'image', url })), ...videos.map(video => ({ type: 'video', ...video }))]
  const hasMedia = allMedia.length > 0

  return (
    <main className="public-layout bg-white">
      <Header />

      {/* Breadcrumb */}
      <Section className="py-4">
        <Container>
          <nav className="body-elegant text-sm text-neutral-gray">
            <Link href="/" className="hover:text-accent-coral transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/shop" className="hover:text-accent-coral transition-colors">Shop</Link>
            <span className="mx-2">/</span>
            <span className="text-primary-charcoal font-medium">{decodeHtmlEntities(product.title)}</span>
          </nav>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Media Gallery */}
            <ScrollAnimation animation="slideLeft">
              <div className="space-y-4">
                {/* Main Media */}
                <div className="relative bg-white border border-gray-50 aspect-square rounded-xl flex items-center justify-center overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
                  {hasMedia ? (
                    <>
                      {allMedia[selectedImageIndex]?.type === 'video' ? (
                        <video 
                          src={allMedia[selectedImageIndex].url}
                          className="w-full h-full object-cover"
                          controls
                          muted
                          preload="metadata"
                        />
                      ) : (
                        <img 
                          src={allMedia[selectedImageIndex]?.url || images[selectedImageIndex]} 
                          alt={decodeHtmlEntities(product.title)}
                          className={`w-full h-full object-cover transition-all duration-300 cursor-zoom-in ${
                            isZoomed ? 'scale-150' : 'hover:scale-105'
                          }`}
                          onClick={() => setIsZoomed(!isZoomed)}
                        />
                      )}
                      
                      {/* Zoom Icon - only show for images */}
                      {allMedia[selectedImageIndex]?.type !== 'video' && (
                        <button
                          onClick={() => setIsZoomed(!isZoomed)}
                          className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                        >
                          <ZoomIn className="w-4 h-4 text-gray-700" />
                        </button>
                      )}
                      
                      {/* Navigation Arrows - only show if multiple media */}
                      {allMedia.length > 1 && (
                        <>
                          <button
                            onClick={previousImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                          >
                            <ChevronLeft className="w-4 h-4 text-gray-700" />
                          </button>
                          
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                          >
                            <ChevronRight className="w-4 h-4 text-gray-700" />
                          </button>
                          
                          {/* Media Counter */}
                          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {selectedImageIndex + 1} / {allMedia.length}
                            {allMedia[selectedImageIndex]?.type === 'video' && ' 🎥'}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <span className="text-9xl opacity-50">🎨</span>
                  )}
                </div>
                
                {/* Thumbnail Media */}
                {hasMedia && allMedia.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {allMedia.map((media: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`bg-white border w-16 h-16 flex-shrink-0 rounded-lg flex items-center justify-center overflow-hidden transition-all duration-200 relative ${
                          selectedImageIndex === index 
                            ? 'border-accent-coral ring-2 ring-accent-coral/20 shadow-md' 
                            : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                        }`}
                      >
                        {media.type === 'video' ? (
                          <>
                            <video 
                              src={media.url} 
                              className="w-full h-full object-cover"
                              muted
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <span className="text-white text-xs">▶️</span>
                            </div>
                          </>
                        ) : (
                          <img 
                            src={media.url} 
                            alt={`${decodeHtmlEntities(product.title)} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollAnimation>

            {/* Product Info */}
            <ScrollAnimation animation="slideRight">
              <div className="space-y-6">
                <div className="bg-white border border-gray-50/50 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-50/70 text-gray-600">
                      {product.type.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 leading-tight">
                    {decodeHtmlEntities(product.title)}
                  </h1>
                  {product.description && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {decodeHtmlEntities(product.description)}
                    </p>
                  )}
                </div>

                {/* Size Selection */}
                {product.variants.length > 0 && (
                  <div className="bg-white border border-gray-50/50 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Size Options</h3>
                    <select
                      value={selectedVariant?.id || ''}
                      onChange={(e) => {
                        const variant = product.variants.find(v => v.id === e.target.value)
                        if (variant) setSelectedVariant(variant)
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-accent-coral focus:border-accent-coral"
                    >
                      <option value="" disabled>Select size...</option>
                      {product.variants.map((variant) => (
                        <option
                          key={variant.id}
                          value={variant.id}
                          disabled={variant.stock === 0}
                        >
                          {variant.size} - €{variant.price.toFixed(2)} ({variant.stock === 0 ? 'Out of stock' : `${variant.stock} left`})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Quantity & Price */}
                {selectedVariant && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-xs font-medium text-gray-900 mb-2">
                            Quantity
                          </label>
                          <select
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="border border-gray-200 rounded-lg px-4 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-accent-coral focus:border-accent-coral"
                          >
                            {[...Array(Math.min(selectedVariant.stock, 10))].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                            {selectedVariant.stock > 10 && (
                              <option value={selectedVariant.stock}>
                                {selectedVariant.stock} (Max)
                              </option>
                            )}
                          </select>
                          {selectedVariant.stock <= 5 && (
                            <p className="text-sm text-red-500 mt-2">
                              ⚠️ Only {selectedVariant.stock} left in stock!
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-gray-900">
                            €{(selectedVariant.price * quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedVariant.stock} in stock
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Add to Cart */}
                <div className="space-y-6">
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleAddToCart}
                      disabled={!selectedVariant || selectedVariant.stock === 0}
                      className="flex-1"
                      size="lg"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {!selectedVariant || selectedVariant.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                    
                    <Button
                      onClick={toggleWishlist}
                      disabled={wishlistLoading}
                      variant="outline"
                      size="lg"
                      className="px-4"
                    >
                      {wishlistLoading ? '...' : isInWishlist ? <Heart className="w-5 h-5 fill-current" /> : <Heart className="w-5 h-5" />}
                    </Button>
                  </div>
                  
                  {/* Product Features */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <Truck className="w-5 h-5 text-accent-coral" />
                      <span>Free shipping on orders over €50</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <Award className="w-5 h-5 text-accent-coral" />
                      <span>Printed on premium quality paper</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <Shield className="w-5 h-5 text-accent-coral" />
                      <span>30-day satisfaction guarantee</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </Container>
      </Section>

      {/* Reviews Section */}
      <Section className="bg-primary-cream border-t">
        <Container>
          <ScrollAnimation animation="fadeIn">
            <ProductReviews productId={product.id} />
          </ScrollAnimation>
        </Container>
      </Section>

      <Footer />
      
      {/* Cart Toast */}
      {product && selectedVariant && (
        <CartToast
          isOpen={showCartToast}
          onClose={() => setShowCartToast(false)}
          productName={decodeHtmlEntities(product.title)}
          productSize={selectedVariant.size}
          quantity={quantity}
        />
      )}
    </main>
  )
}