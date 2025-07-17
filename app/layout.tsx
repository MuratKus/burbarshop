import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/components/CartProvider'
import { ToastProvider } from '@/components/Toast'

export const metadata: Metadata = {
  title: 'Burbarshop - Art Prints & Postcards',
  description: 'Beautiful art prints, postcards, and riso prints by Burcinbar',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ToastProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  )
}