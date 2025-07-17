import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCard } from '../ProductCard'
import React from 'react'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock the contexts
const mockAddToCart = jest.fn()
const mockSuccess = jest.fn()

jest.mock('../CartProvider', () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    cart: [],
    updateQuantity: jest.fn(),
    removeFromCart: jest.fn(),
    clearCart: jest.fn(),
    totalPrice: 0,
    totalItems: 0,
    isCartOpen: false,
    setIsCartOpen: jest.fn(),
  }),
}))

jest.mock('../Toast', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: jest.fn(),
    info: jest.fn(),
  }),
}))

const mockProduct = {
  id: 'test-id',
  slug: 'test-product',
  title: 'Test Product',
  type: 'POSTCARD',
  basePrice: 15.99,
  variants: [
    {
      id: 'variant-1',
      size: 'A4',
      price: 15.99,
      stock: 10
    }
  ]
}

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders product information', () => {
    render(<ProductCard {...mockProduct} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('postcard')).toBeInTheDocument()
    expect(screen.getByText('€15.99')).toBeInTheDocument()
  })

  test('renders product image when provided', () => {
    render(<ProductCard {...mockProduct} image="https://example.com/image.jpg" />)

    const image = screen.getByAltText('Test Product')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  test('renders emoji when no image provided', () => {
    render(<ProductCard {...mockProduct} />)

    expect(screen.getByText('🎨')).toBeInTheDocument()
  })

  test('formats product type correctly', () => {
    render(<ProductCard {...mockProduct} type="FINE_PRINT" />)

    expect(screen.getByText('fine print')).toBeInTheDocument()
  })

  test('shows add to cart button on hover', () => {
    render(<ProductCard {...mockProduct} />)

    const button = screen.getByRole('button', { name: 'Quick Add' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('opacity-0')
  })

  test('adds product to cart when button clicked', async () => {
    const user = userEvent.setup()
    
    render(<ProductCard {...mockProduct} />)

    const button = screen.getByRole('button', { name: 'Quick Add' })
    await user.click(button)
    
    expect(mockAddToCart).toHaveBeenCalledWith({
      productId: 'test-id',
      variantId: 'variant-1',
      quantity: 1
    })
    
    expect(mockSuccess).toHaveBeenCalledWith('Added to cart!', 'Test Product (A4)')
  })

  test('applies custom className', () => {
    const { container } = render(<ProductCard {...mockProduct} className="custom-class" />)

    expect(container.firstChild).toHaveClass('custom-class')
  })
})