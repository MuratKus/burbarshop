import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminChat from '@/components/AdminChat'

async function getDashboardStats() {
  try {
    const [totalProducts, totalOrders, pendingOrders, totalRevenue] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } }
      })
    ])

    return {
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue: totalRevenue._sum.total || 0
    }
  } catch (error) {
    console.error('Database connection failed:', error)
    // Return placeholder data if database is not available
    return {
      totalProducts: 0,
      totalOrders: 0,
      pendingOrders: 0,
      totalRevenue: 0
    }
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your store admin panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📦</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📋</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-3xl mr-4">⏱️</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-3xl mr-4">💰</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">€{stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/admin/products/new" 
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center"
            >
              <div className="text-2xl mb-2">➕</div>
              <p className="font-medium">Add New Product</p>
            </Link>
            
            <a 
              href="/admin/orders" 
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📋</div>
              <p className="font-medium">View Orders</p>
            </a>
            
            <a 
              href="/admin/inventory" 
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📦</div>
              <p className="font-medium">Check Inventory</p>
            </a>
            
            <a 
              href="/admin/promos/new" 
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🎟️</div>
              <p className="font-medium">Create Promo Code</p>
            </a>
          </div>
        </div>

        {/* Admin Assistant Chat */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Assistant</h2>
          <AdminChat />
        </div>
      </div>
    </div>
  )
}