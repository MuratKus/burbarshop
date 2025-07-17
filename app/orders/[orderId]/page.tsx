import { prisma } from '@/lib/prisma'
import { Navigation } from '@/components/Navigation'
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
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'PROCESSING': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'SHIPPED': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200'
    case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
    <main className="min-h-screen bg-orange-50">
      <Navigation />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-orange-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-600">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-orange-700 font-medium">Order Details</span>
          </nav>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Order #{order.id.slice(-8).toUpperCase()}
                </h1>
                <p className="text-gray-600 mt-1">Thank you for your order! 🎨</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Order Date:</span>
                <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium text-gray-900">{order.email}</p>
              </div>
              <div>
                <span className="text-gray-600">Total:</span>
                <p className="font-medium text-gray-900">€{order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Status Progress */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-orange-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Status</h2>
            
            <div className="relative">
              <div className="flex justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Order Placed</span>
                <span className="text-sm font-medium text-gray-700">Processing</span>
                <span className="text-sm font-medium text-gray-700">Shipped</span>
                <span className="text-sm font-medium text-gray-700">Delivered</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-orange-500 h-3 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${statusProgress}%` }}
                ></div>
              </div>
              
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-600">
                  Your order is currently <span className="font-medium text-orange-700">{order.status.toLowerCase()}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Beautiful Items</h2>
              
              <div className="space-y-4">
                {order.items.map((item) => {
                  const images = item.product.images ? JSON.parse(item.product.images) : []
                  const firstImage = images.length > 0 ? images[0] : null
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-4 border-b border-orange-100 pb-4 last:border-b-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {firstImage ? (
                          <img 
                            src={firstImage} 
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">🎨</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product.title}</h3>
                        <p className="text-sm text-gray-600">{item.productVariant.size}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-gray-900">€{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-4 pt-4 border-t border-orange-200">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Subtotal:</span>
                  <span>€{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Shipping:</span>
                  <span>€{order.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total:</span>
                  <span>€{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium text-gray-900">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Address:</span>
                  <p className="font-medium text-gray-900">{shippingAddress.address}</p>
                  <p className="font-medium text-gray-900">{shippingAddress.city}, {shippingAddress.postalCode}</p>
                  <p className="font-medium text-gray-900">{shippingAddress.country}</p>
                </div>
                {shippingAddress.phone && (
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium text-gray-900">{shippingAddress.phone}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-orange-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium text-gray-900 capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-medium text-gray-900">{order.paymentId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8 border border-orange-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/shop"
                className="flex-1 bg-orange-500 text-white text-center py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                🛍️ Continue Shopping
              </Link>
              
              {order.status === 'DELIVERED' && (
                <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
                  ⭐ Leave a Review
                </button>
              )}
              
              {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                <button className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium">
                  ❌ Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}