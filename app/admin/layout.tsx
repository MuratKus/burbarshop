'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                Burbarshop Admin
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                View Store
              </Link>
              <button 
                onClick={() => {
                  document.cookie = 'admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
                  window.location.href = '/admin/login'
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/admin" 
                  className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  <span className="mr-3">📊</span>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/products" 
                  className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  <span className="mr-3">📦</span>
                  Products
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/orders" 
                  className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  <span className="mr-3">📋</span>
                  Orders
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/shipping" 
                  className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  <span className="mr-3">🚚</span>
                  Shipping
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/promos" 
                  className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  <span className="mr-3">🎟️</span>
                  Promo Codes
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}