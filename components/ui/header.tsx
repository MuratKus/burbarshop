'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { ShoppingCart, User, Search, Menu, Heart } from "lucide-react"

interface HeaderProps {
  className?: string
}

interface NavItem {
  title: string
  href: string
}

const navItems: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Shop", href: "/shop" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
]

export function Header({ className }: HeaderProps) {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  return (
    <header className={cn("bg-white/95 backdrop-blur-sm border-b border-neutral-border-light sticky top-0 z-50", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-sage rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-heading text-xl font-semibold text-primary-charcoal">
                Burcinbar
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "font-body font-medium transition-colors",
                    isActive 
                      ? "text-accent-coral" 
                      : "text-primary-charcoal hover:text-accent-coral"
                  )}
                >
                  {item.title}
                </Link>
              )
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search - Desktop only */}
            <button className="hidden md:block p-2 text-primary-charcoal hover:text-accent-coral transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link 
              href="/wishlist" 
              className="p-2 text-primary-charcoal hover:text-accent-coral transition-colors"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* User Account */}
            <Link 
              href="/auth/login" 
              className="p-2 text-primary-charcoal hover:text-accent-coral transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link 
              href="/cart" 
              className="relative p-2 text-primary-charcoal hover:text-accent-coral transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {/* Cart badge - would be dynamic */}
              <span className="absolute -top-1 -right-1 bg-accent-coral text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                2
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-primary-charcoal hover:text-accent-coral transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-border-light">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 font-body font-medium transition-colors rounded-lg",
                      isActive 
                        ? "text-accent-coral bg-accent-coral/10" 
                        : "text-primary-charcoal hover:text-accent-coral hover:bg-accent-coral/5"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

interface HeroProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
  backgroundImage?: string
}

export function Hero({ title, subtitle, children, className, backgroundImage }: HeroProps) {
  return (
    <section 
      className={cn(
        "relative bg-primary-sage text-white py-24 overflow-hidden",
        className
      )}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-primary-sage/80" />
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="font-body text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("bg-primary-charcoal text-white py-16", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-sage rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-heading text-xl font-semibold">Burcinbar</span>
            </div>
            <p className="font-body text-gray-300 mb-4 max-w-md">
              Unique art prints and postcards by artist Burcinbar. Each piece is carefully crafted to bring beauty and creativity to your space.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="font-body text-gray-300 hover:text-white transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="font-body text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="font-body text-gray-300 hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="font-body text-gray-300 hover:text-white transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="font-body text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="font-body text-gray-300">
            © 2024 Burcinbar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}