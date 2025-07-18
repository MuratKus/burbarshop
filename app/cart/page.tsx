'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Header, Footer } from '@/components/ui/header'
import { useCart } from '@/components/CartProvider'
import { Container, Section } from '@/components/ui/layout'
import { ScrollAnimation } from '@/components/ui/scroll-animations'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InventoryNotification } from '@/components/InventoryNotification'
import { validateCartInventory } from '@/lib/inventory-validation'
import { useToast } from '@/components/Toast'
import { ShoppingCart, Trash2, Plus, Minus, Truck, AlertCircle } from 'lucide-react'

interface CartItemWithDetails {
  productId: string
  variantId: string
  quantity: number
  product: {
    id: string
    slug: string
    title: string
    images: string
    type: string
  }
  variant: {
    id: string
    size: string
    price: number
    stock: number
  }
}

interface InventoryIssue {
  productTitle: string
  variantSize: string
  requestedQuantity: number
  availableStock: number
  correctedQuantity: number
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartItemCount, isLoading } = useCart()
  const { success } = useToast()
  const [cartWithDetails, setCartWithDetails] = useState<CartItemWithDetails[]>([])
  const [loadingDetails, setLoadingDetails] = useState(true)
  const [inventoryIssues, setInventoryIssues] = useState<InventoryIssue[]>([])
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const hasFetchedDetails = useRef(false)

  const decodeHtmlEntities = (text: string) => {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    return textarea.value
  }

  // Calculate proper cart total from detailed items
  const cartTotal = cartWithDetails.reduce((total, item) => {
    return total + (item.variant.price * item.quantity)
  }, 0)

  useEffect(() => {
    if (cart.length > 0 && !hasFetchedDetails.current) {
      fetchCartDetails()
      hasFetchedDetails.current = true
    } else if (cart.length === 0) {
      setCartWithDetails([])
      setLoadingDetails(false)
      hasFetchedDetails.current = false
    }
  }, [cart.length])

  const fetchCartDetails = async () => {
    setLoadingDetails(true)
    try {
      // Single API call to get all products
      const productsResponse = await fetch('/api/products')
      if (productsResponse.ok) {
        const allProducts = await productsResponse.json()
        
        // Map cart items to detailed items using the products data
        const detailedItems = cart.map((item) => {
          const product = allProducts.find((p: any) => p.id === item.productId)
          if (product) {
            const variant = product.variants.find((v: any) => v.id === item.variantId)
            
            if (variant) {
              return {
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                product: {
                  id: product.id,
                  slug: product.slug,
                  title: product.title,
                  images: product.images,
                  type: product.type
                },
                variant: {
                  id: variant.id,
                  size: variant.size,
                  price: variant.price,
                  stock: variant.stock
                }
              }
            }
          }
          return null
        }).filter(item => item !== null) as CartItemWithDetails[]
        
        // Validate inventory and auto-correct quantities
        const cartItemsWithStock = detailedItems.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          product: {
            id: item.product.id,
            title: item.product.title
          },
          variant: {
            id: item.variant.id,
            size: item.variant.size,
            stock: item.variant.stock
          }
        }))

        const validation = validateCartInventory(cartItemsWithStock)
        
        if (validation.hasIssues) {
          // Update cart with corrected quantities
          validation.correctedCart.forEach(correctedItem => {
            updateQuantity(correctedItem.productId, correctedItem.variantId, correctedItem.quantity)
          })
          
          // Show notification
          setInventoryIssues(validation.issues)
          setShowInventoryModal(true)
          
          // Update local state with corrected cart
          const correctedDetailedItems = detailedItems.map(item => {
            const correctedItem = validation.correctedCart.find(
              c => c.productId === item.productId && c.variantId === item.variantId
            )
            return correctedItem ? { ...item, quantity: correctedItem.quantity } : item
          }).filter(item => item.quantity > 0)
          
          setCartWithDetails(correctedDetailedItems)
        } else {
          setCartWithDetails(detailedItems)
        }
      }
    } catch (error) {
      console.error('Error fetching cart details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleQuantityChange = (productId: string, variantId: string, newQuantity: number) => {
    // Optimistic update - update local state immediately
    setCartWithDetails(prevItems => 
      prevItems.map(item => 
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
    
    // Then update the actual cart
    updateQuantity(productId, variantId, newQuantity)
  }

  const handleRemoveItem = (productId: string, variantId: string) => {
    // Optimistic update - remove from local state immediately
    setCartWithDetails(prevItems => 
      prevItems.filter(item => 
        !(item.productId === productId && item.variantId === variantId)
      )
    )
    
    // Then update the actual cart
    removeFromCart(productId, variantId)
  }

  const shippingCost = cartTotal >= 50 ? 0 : 5.99
  const finalTotal = cartTotal + shippingCost

  if (isLoading || loadingDetails) {
    return (
      <main className="public-layout">
        <Header />
        <Section>
          <Container>
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="loading-spinner w-8 h-8 mr-4"></div>
                <div className="body-elegant text-lg text-neutral-gray">Loading your cart...</div>
              </div>
            </div>
          </Container>
        </Section>
      </main>
    )
  }

  return (
    <main className="public-layout">
      <Header />

      {/* Page Header */}
      <Section className="bg-primary-sage text-white py-16">
        <Container>
          <ScrollAnimation animation="fadeIn">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Shopping Cart
              </h1>
              <p className="text-white/90 text-lg">
                Review your selected artwork before checkout
              </p>
            </div>
          </ScrollAnimation>
        </Container>
      </Section>

      <Section>
        <Container>
          {cartWithDetails.length === 0 ? (
            /* Empty Cart */
            <ScrollAnimation animation="fadeIn">
              <div className="max-w-md mx-auto">
                <Card className="text-center">
                  <CardContent className="p-12">
                    <div className="w-20 h-20 mx-auto mb-6 bg-primary-sage rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
                    <p className="text-lg text-gray-600 mb-8">Ready to discover some beautiful art? Let&apos;s find the perfect pieces for you!</p>
                    <Button size="lg" asChild>
                      <Link href="/shop">
                        Start Shopping
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </ScrollAnimation>
          ) : (
            /* Cart with Items */
            <div className="max-w-6xl mx-auto">
              <ScrollAnimation animation="fadeIn">
                <Card className="mb-8">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">Your Shopping Cart</h1>
                        <p className="text-gray-600 mt-1">{cartItemCount} beautiful piece{cartItemCount !== 1 ? 's' : ''} selected</p>
                      </div>
                      <Button
                        onClick={clearCart}
                        variant="outline"
                        size="sm"
                        className="text-neutral-gray hover:text-red-500"
                      >
                        Clear Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimation>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {cartWithDetails.map((item) => {
                    const images = JSON.parse(item.product.images || '[]')
                    const firstImage = images.length > 0 ? images[0] : null
                    
                    return (
                      <ScrollAnimation key={`${item.productId}-${item.variantId}`} animation="slideUp">
                        <Card className="hover-lift">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              {/* Product Image */}
                              <div className="w-20 h-20 bg-primary-cream rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                {firstImage ? (
                                  <img 
                                    src={firstImage} 
                                    alt={item.product.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-2xl opacity-50">🎨</span>
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      <Link 
                                        href={`/shop/${item.product.slug}`}
                                        className="hover:text-accent-coral transition-colors"
                                      >
                                        {decodeHtmlEntities(item.product.title)}
                                      </Link>
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {item.product.type.toLowerCase().replace('_', ' ')}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {item.variant.size}
                                      </Badge>
                                    </div>
                                    <p className="text-lg font-semibold text-accent-coral mt-2">
                                      €{item.variant.price.toFixed(2)}
                                    </p>
                                  </div>
                                  
                                  <Button
                                    onClick={() => handleRemoveItem(item.productId, item.variantId)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-red-500 p-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center justify-between mt-4">
                                  <div className="flex items-center space-x-4">
                                    <span className="text-sm font-medium text-gray-900">Quantity:</span>
                                    <div className="flex items-center border border-neutral-border-light rounded-lg bg-white shadow-sm">
                                      <Button
                                        onClick={() => handleQuantityChange(item.productId, item.variantId, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                        variant="ghost"
                                        size="sm"
                                        className="px-3 py-2 rounded-r-none text-gray-600 hover:text-primary-charcoal hover:bg-primary-sage/10 disabled:opacity-30"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </Button>
                                      <span className="px-4 py-2 text-gray-900 border-x border-neutral-border-light font-medium bg-primary-cream/30 min-w-[3rem] text-center">
                                        {item.quantity}
                                      </span>
                                      <Button
                                        onClick={() => handleQuantityChange(item.productId, item.variantId, item.quantity + 1)}
                                        disabled={item.quantity >= item.variant.stock}
                                        variant="ghost"
                                        size="sm"
                                        className="px-3 py-2 rounded-l-none text-gray-600 hover:text-primary-charcoal hover:bg-primary-sage/10 disabled:opacity-30"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="text-right">
                                    <p className="text-lg font-semibold text-gray-900">
                                      €{(item.variant.price * item.quantity).toFixed(2)}
                                    </p>
                                    {item.variant.stock <= 5 ? (
                                      <Badge variant="destructive" className="text-xs mt-1">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        Only {item.variant.stock} left
                                      </Badge>
                                    ) : (
                                      <p className="text-sm text-neutral-gray mt-1">
                                        {item.variant.stock} available
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </ScrollAnimation>
                    )
                  })}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <ScrollAnimation animation="slideRight">
                    <Card className="sticky top-8">
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between text-gray-600">
                            <span>Subtotal ({cartItemCount} items)</span>
                            <span>€{cartTotal.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span>
                              {shippingCost === 0 ? (
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                  Free
                                </Badge>
                              ) : (
                                `€${shippingCost.toFixed(2)}`
                              )}
                            </span>
                          </div>
                          
                          {cartTotal < 50 && (
                            <Alert variant="info" className="border-accent-coral/20 bg-accent-coral/5">
                              <Truck className="w-4 h-4" />
                              <AlertDescription className="text-sm font-medium">
                                Add €{(50 - cartTotal).toFixed(2)} more for free shipping!
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          <Separator />
                          
                          <div className="flex justify-between text-lg font-semibold text-gray-900">
                            <span>Total</span>
                            <span>€{finalTotal.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="mt-6 space-y-3">
                          <Button className="w-full" size="lg" asChild>
                            <Link href="/checkout">
                              <ShoppingCart className="w-5 h-5 mr-2" />
                              Proceed to Checkout
                            </Link>
                          </Button>
                          
                          <Button variant="outline" className="w-full" size="lg" asChild>
                            <Link href="/shop">
                              Continue Shopping
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollAnimation>
                </div>
              </div>
            </div>
          )}
        </Container>
      </Section>

      <Footer />
      
      {/* Inventory Notification Modal */}
      {showInventoryModal && (
        <InventoryNotification
          issues={inventoryIssues}
          onClose={() => setShowInventoryModal(false)}
          onContinue={() => {
            setShowInventoryModal(false)
            window.location.href = '/checkout'
          }}
        />
      )}
    </main>
  )
}