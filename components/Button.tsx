'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'admin' | 'sage'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none font-body'
  
  const variants = {
    primary: 'bg-accent-coral text-white hover:bg-accent-coral/90 shadow-elegant hover:shadow-elegant-hover focus:ring-accent-coral',
    secondary: 'bg-transparent text-primary-charcoal border border-neutral-border-light hover:bg-neutral-border-light hover:shadow-elegant focus:ring-accent-coral',
    outline: 'border border-accent-coral text-accent-coral bg-transparent hover:bg-accent-coral hover:text-white focus:ring-accent-coral',
    ghost: 'hover:bg-neutral-border-light hover:text-primary-charcoal focus:ring-accent-coral',
    admin: 'bg-admin-sidebar text-white hover:bg-admin-sidebar/90 shadow-admin-card focus:ring-admin-sidebar',
    sage: 'bg-primary-sage text-white hover:bg-primary-sage/90 shadow-elegant focus:ring-primary-sage'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm h-9',
    md: 'px-6 py-3 text-base h-12',
    lg: 'px-8 py-4 text-lg h-14'
  }

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}