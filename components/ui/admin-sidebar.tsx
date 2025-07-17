'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  ShoppingBag, 
  Package, 
  Users, 
  Settings, 
  BarChart3, 
  Gift,
  Truck,
  FileText,
  Home
} from "lucide-react"

interface AdminSidebarProps {
  className?: string
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: Home },
  { title: "Orders", href: "/admin/orders", icon: FileText },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Inventory", href: "/admin/inventory", icon: ShoppingBag },
  { title: "Customers", href: "/admin/customers", icon: Users },
  { title: "Promotions", href: "/admin/promos", icon: Gift },
  { title: "Shipping", href: "/admin/shipping", icon: Truck },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("admin-sidebar w-64 h-screen fixed left-0 top-0 z-40 flex flex-col", className)}>
      {/* Logo/Brand */}
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-accent-coral rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-heading text-xl font-semibold">Burbar Shop</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors font-body",
                isActive 
                  ? "bg-accent-coral text-white" 
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
              {item.badge && (
                <span className="ml-auto bg-accent-coral text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 bg-primary-sage rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Admin</p>
            <p className="text-xs text-gray-400">admin@burbar.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface AdminLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AdminLayout({ children, className }: AdminLayoutProps) {
  return (
    <div className="admin-layout flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <main className={cn("min-h-screen p-8", className)}>
          {children}
        </main>
      </div>
    </div>
  )
}