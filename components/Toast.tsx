'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import Link from 'next/link'
import { ShoppingCart, Eye } from 'lucide-react'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  showCartActions?: boolean
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  success: (title: string, message?: string, showCartActions?: boolean) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [removeToast])

  const success = useCallback((title: string, message?: string, showCartActions?: boolean) => {
    addToast({ type: 'success', title, message, showCartActions })
  }, [addToast])

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message, duration: 7000 })
  }, [addToast])

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message })
  }, [addToast])

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message })
  }, [addToast])

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      success,
      error,
      warning,
      info
    }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast, onRemove: (id: string) => void }) {
  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-primary-sage/10 border-primary-sage/30 text-primary-charcoal'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-accent-ochre/10 border-accent-ochre/30 text-primary-charcoal'
      case 'info':
        return 'bg-primary-cream border-neutral-border-light text-primary-charcoal'
      default:
        return 'bg-primary-warm border-neutral-border-light text-primary-charcoal'
    }
  }

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  return (
    <div className={`
      w-full rounded-xl border shadow-lg transition-all duration-300 transform translate-x-0
      ${getToastStyles(toast.type)}
      animate-in slide-in-from-right-full backdrop-blur-sm
    `}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-lg">{getIcon(toast.type)}</span>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.message && (
              <p className="text-sm mt-1 opacity-80">{toast.message}</p>
            )}
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="flex-shrink-0 ml-2 text-sm opacity-50 hover:opacity-100 transition-opacity text-primary-charcoal hover:text-accent-coral"
          >
            ✕
          </button>
        </div>
        
        {/* Cart Actions for success toasts */}
        {toast.type === 'success' && toast.showCartActions && (
          <div className="mt-3 flex gap-2">
            <Link
              href="/cart"
              className="flex-1 bg-white/90 hover:bg-white text-primary-charcoal text-xs font-medium py-2 px-3 rounded-lg border border-primary-sage/30 hover:border-primary-sage/50 transition-all duration-200 flex items-center justify-center gap-1 shadow-sm"
            >
              <ShoppingCart className="w-3 h-3" />
              View Cart
            </Link>
            <Link
              href="/checkout"
              className="flex-1 bg-accent-coral hover:bg-accent-coral/90 text-white text-xs font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 shadow-sm"
            >
              <Eye className="w-3 h-3" />
              Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}