export interface Product {
  id: string
  title: string
  description: string | null
  images: string
  basePrice: number
  type: string
  createdAt: Date
  updatedAt: Date
  variants: ProductVariant[]
}

export interface ProductVariant {
  id: string
  productId: string
  size: string
  price: number
  stock: number
}

export interface CartItem {
  productId: string
  variantId: string
  quantity: number
  product?: Product
  variant?: ProductVariant
}

export interface Order {
  id: string
  userId: string | null
  email: string
  status: string
  subtotal: number
  shippingCost: number
  total: number
  shippingAddress: string
  paymentMethod: string
  paymentId: string | null
  createdAt: Date
  updatedAt: Date
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productVariantId: string
  quantity: number
  price: number
}

export interface ShippingZone {
  id: string
  name: string
  countries: string
  rate: number
}

export interface PromoCode {
  id: string
  code: string
  description: string | null
  type: string
  value: number
  minOrder: number | null
  maxUses: number | null
  usedCount: number
  validFrom: Date
  validUntil: Date | null
  isActive: boolean
  createdAt: Date
}