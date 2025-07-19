import { prisma } from '@/lib/prisma'
import { Header, Footer } from '@/components/ui/header'
import { Container, Section } from '@/components/ui/layout'
import { ScrollAnimation } from '@/components/ui/scroll-animations'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface OrderPageProps {
  params: Promise<{
    orderId: string
  }>
}

async function getOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
          productVariant: true
        }
      }
    }
  })

  return order
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING': return 'bg-accent-coral/20 text-accent-coral border-accent-coral/30'
    case 'PROCESSING': return 'bg-primary-sage/20 text-primary-sage border-primary-sage/30'
    case 'SHIPPED': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200'
    case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-neutral-gray/20 text-neutral-gray border-neutral-gray/30'
  }
}

function getStatusProgress(status: string) {
  switch (status) {
    case 'PENDING': return 25
    case 'PROCESSING': return 50
    case 'SHIPPED': return 75
    case 'DELIVERED': return 100
    case 'CANCELLED': return 0
    default: return 0
  }
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderId } = await params
  const order = await getOrder(orderId)

  if (!order) {
    notFound()
  }

  const shippingAddress = JSON.parse(order.shippingAddress)
  const statusProgress = getStatusProgress(order.status)

  return (
    <main className="public-layout">
      <Header />
      
      {/* Page Header */}
      <Section className="bg-primary-sage text-white py-12">
        <Container>
          <ScrollAnimation animation="fadeIn">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-white/90">
                Track your beautiful art prints
              </p>
            </div>
          </ScrollAnimation>
        </Container>
      </Section>
      
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation animation="fadeIn">
              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-elegant p-8 mb-8 border border-neutral-border-light">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-neutral-gray mb-2">Thank you for your order! 🎨</p>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium text-primary-charcoal">Status:</span>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
            
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <span className="text-neutral-gray font-medium">Order Date</span>
                    <p className="text-primary-charcoal font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-neutral-gray font-medium">Email</span>
                    <p className="text-primary-charcoal font-semibold">{order.email}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-neutral-gray font-medium">Total</span>
                    <p className="text-primary-charcoal font-semibold text-lg">€{order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={200}>
              {/* Status Progress */}
              <div className="bg-white rounded-xl shadow-elegant p-8 mb-8 border border-neutral-border-light">
                <h2 className="text-xl font-semibold text-primary-charcoal mb-6">Order Progress</h2>
                
                <div className="relative">
                  <div className="flex justify-between mb-4">
                    <span className="text-sm font-medium text-neutral-gray">Order Placed</span>
                    <span className="text-sm font-medium text-neutral-gray">Processing</span>
                    <span className="text-sm font-medium text-neutral-gray">Shipped</span>
                    <span className="text-sm font-medium text-neutral-gray">Delivered</span>
                  </div>
                  
                  <div className="w-full bg-primary-cream rounded-full h-3">
                    <div 
                      className="bg-primary-sage h-3 rounded-full transition-all duration-500 ease-in-out"
                      style={{ width: `${statusProgress}%` }}
                    ></div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-neutral-gray">
                      Your order is currently <span className="font-semibold text-primary-sage">{order.status.toLowerCase()}</span>
                    </p>
                  </div>
                </div>
              </div>
            </ScrollAnimation>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ScrollAnimation animation="slideLeft" delay={300}>
                {/* Order Items */}
                <div className="bg-white rounded-xl shadow-elegant p-8 border border-neutral-border-light">
                  <h2 className="text-xl font-semibold text-primary-charcoal mb-6">Your Beautiful Items</h2>
              
              <div className="space-y-4">
                {order.items.map((item) => {
                  const images = item.product.images ? JSON.parse(item.product.images) : []
                  const firstImage = images.length > 0 ? images[0] : null
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-4 border-b border-primary-cream pb-4 last:border-b-0">
                      <div className="w-20 h-20 bg-primary-cream/50 rounded-xl flex items-center justify-center overflow-hidden">
                        {firstImage ? (
                          <img 
                            src={firstImage} 
                            alt={item.product.title}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <span className="text-2xl">🎨</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary-charcoal">{item.product.title}</h3>
                        <p className="text-sm text-neutral-gray">{item.productVariant.size}</p>
                        <p className="text-sm text-neutral-gray">Quantity: {item.quantity}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-primary-charcoal">€{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              
                  <div className="mt-6 pt-6 border-t border-primary-cream space-y-3">
                    <div className="flex justify-between text-neutral-gray">
                      <span>Subtotal:</span>
                      <span className="font-medium">€{order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-gray">
                      <span>Shipping:</span>
                      <span className="font-medium">€{order.shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-primary-charcoal pt-2 border-t border-primary-cream">
                      <span>Total:</span>
                      <span>€{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>

              <ScrollAnimation animation="slideRight" delay={300}>
                {/* Shipping Information */}
                <div className="bg-white rounded-xl shadow-elegant p-8 border border-neutral-border-light">
                  <h2 className="text-xl font-semibold text-primary-charcoal mb-6">Shipping Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-neutral-gray font-medium">Name</span>
                      <p className="font-semibold text-primary-charcoal">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                    </div>
                    <div>
                      <span className="text-neutral-gray font-medium">Address</span>
                      <div className="space-y-1">
                        <p className="font-semibold text-primary-charcoal">{shippingAddress.address}</p>
                        <p className="font-semibold text-primary-charcoal">{shippingAddress.city}, {shippingAddress.postalCode}</p>
                        <p className="font-semibold text-primary-charcoal">{shippingAddress.country}</p>
                      </div>
                    </div>
                    {shippingAddress.phone && (
                      <div>
                        <span className="text-neutral-gray font-medium">Phone</span>
                        <p className="font-semibold text-primary-charcoal">{shippingAddress.phone}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-primary-cream space-y-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-gray font-medium">Payment Method</span>
                      <span className="font-semibold text-primary-charcoal capitalize">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-gray font-medium">Payment ID</span>
                      <span className="font-medium text-primary-charcoal text-xs">{order.paymentId}</span>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            </div>

            <ScrollAnimation animation="fadeIn" delay={400}>
              {/* Actions */}
              <div className="bg-white rounded-xl shadow-elegant p-8 mt-8 border border-neutral-border-light">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/shop"
                    className="flex-1 bg-primary-sage text-white text-center py-3 px-6 rounded-xl hover:bg-primary-sage/90 transition-colors font-medium"
                  >
                    🛍️ Continue Shopping
                  </Link>
                  
                  {order.status === 'DELIVERED' && (
                    <button className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-colors font-medium">
                      ⭐ Leave a Review
                    </button>
                  )}
                  
                  {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                    <button className="flex-1 bg-red-600 text-white py-3 px-6 rounded-xl hover:bg-red-700 transition-colors font-medium">
                      ❌ Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </Container>
      </Section>
      
      <Footer />
    </main>
  )
}