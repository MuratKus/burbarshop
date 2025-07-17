'use client'

import { useState, useEffect } from 'react'
import { TrackingModal } from '@/components/TrackingModal'

interface Order {
  id: string
  email: string
  status: string
  total: number
  shippingCost: number
  createdAt: string
  trackingNumber?: string
  trackingUrl?: string
  items: Array<{
    quantity: number
    product: {
      title: string
    }
    productVariant: {
      size: string
    }
  }>
  user?: {
    name: string
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800'
    case 'PROCESSING': return 'bg-blue-100 text-blue-800'
    case 'SHIPPED': return 'bg-purple-100 text-purple-800'
    case 'DELIVERED': return 'bg-green-100 text-green-800'
    case 'CANCELLED': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [trackingModal, setTrackingModal] = useState<{ isOpen: boolean; orderId: string }>({
    isOpen: false,
    orderId: ''
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // If marking as shipped, open tracking modal
    if (newStatus === 'SHIPPED') {
      setTrackingModal({ isOpen: true, orderId })
      return
    }

    setUpdatingStatus(orderId)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        // Update the order in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        )
        console.log(`Order ${orderId} status updated to ${newStatus}`)
      } else {
        const errorData = await response.json()
        alert(`Failed to update status: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleTrackingSubmit = async (trackingData: { trackingNumber: string; trackingUrl: string }) => {
    const orderId = trackingModal.orderId
    setUpdatingStatus(orderId)
    
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'SHIPPED',
          trackingNumber: trackingData.trackingNumber,
          trackingUrl: trackingData.trackingUrl
        })
      })

      if (response.ok) {
        // Update the order in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { 
                  ...order, 
                  status: 'SHIPPED',
                  trackingNumber: trackingData.trackingNumber,
                  trackingUrl: trackingData.trackingUrl
                }
              : order
          )
        )
        console.log(`Order ${orderId} marked as shipped with tracking`)
      } else {
        const errorData = await response.json()
        alert(`Failed to update status: ${errorData.error}`)
        throw new Error(errorData.error)
      }
    } catch (error) {
      console.error('Error updating order with tracking:', error)
      throw error // Re-throw to let modal handle the error
    } finally {
      setUpdatingStatus(null)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-2">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-2">Manage customer orders and fulfillment</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tracking
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    #{order.id.slice(-8).toUpperCase()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.email}</div>
                  {order.user?.name && (
                    <div className="text-sm text-gray-500">{order.user.name}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div key={idx}>
                        {item.quantity}x {item.product.title} ({item.productVariant.size})
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div>... and {order.items.length - 2} more</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    €{order.total.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Shipping: €{order.shippingCost.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {order.trackingNumber ? (
                    <div>
                      <div className="text-gray-900 font-medium text-xs">
                        #{order.trackingNumber}
                      </div>
                      {order.trackingUrl && (
                        <a 
                          href={order.trackingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          🔗 Track
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <select 
                    value={order.status}
                    disabled={updatingStatus === order.id}
                    className={`text-sm border border-gray-300 rounded px-2 py-1 text-gray-900 ${
                      updatingStatus === order.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  {updatingStatus === order.id && (
                    <div className="text-xs text-blue-600 mt-1">Updating...</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">📋</div>
            <p className="text-gray-500">No orders yet. Orders will appear here when customers make purchases.</p>
          </div>
        )}
      </div>

      <TrackingModal
        isOpen={trackingModal.isOpen}
        onClose={() => setTrackingModal({ isOpen: false, orderId: '' })}
        onSubmit={handleTrackingSubmit}
        orderId={trackingModal.orderId}
      />
    </div>
  )
}