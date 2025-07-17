'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from '@/components/ProductCard'
import { FilterBar } from '@/components/FilterBar'
import { Header, Footer } from '@/components/ui/header'
import { Container, Section, Grid } from '@/components/ui/layout'
import { ScrollAnimation } from '@/components/ui/scroll-animations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown } from 'lucide-react'

interface Product {
  id: string
  slug: string
  title: string
  type: string
  basePrice: number
  images: string
  variants: Array<{
    id: string
    size: string
    price: number
    stock: number
  }>
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('featured')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({
    types: [],
    sizes: [],
    priceRanges: []
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
        setFilteredProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = products

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(query) ||
        product.type.toLowerCase().includes(query)
      )
    }

    // Filter by type
    if (activeFilters.types.length > 0) {
      filtered = filtered.filter(product => activeFilters.types.includes(product.type))
    }

    // Filter by size
    if (activeFilters.sizes.length > 0) {
      filtered = filtered.filter(product => 
        product.variants.some(variant => activeFilters.sizes.includes(variant.size))
      )
    }

    // Filter by price range
    if (activeFilters.priceRanges.length > 0) {
      filtered = filtered.filter(product => {
        return activeFilters.priceRanges.some((range: string) => {
          switch (range) {
            case 'Under €15':
              return product.basePrice < 15
            case '€15 - €30':
              return product.basePrice >= 15 && product.basePrice <= 30
            case '€30+':
              return product.basePrice > 30
            default:
              return true
          }
        })
      })
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.basePrice - b.basePrice)
        break
      case 'price-high':
        filtered.sort((a, b) => b.basePrice - a.basePrice)
        break
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        break
      default:
        // Keep original order for 'featured'
        break
    }

    setFilteredProducts(filtered)
  }

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const clearAllFilters = () => {
    setActiveFilters({ types: [], sizes: [], priceRanges: [] })
    setSearchQuery('')
    setSortBy('featured')
  }

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters()
  }, [products, activeFilters, sortBy, searchQuery])

  const handleSortChange = (sortValue: string) => {
    setSortBy(sortValue)
  }

  if (loading) {
    return (
      <main className="public-layout">
        <Header />
        <Section>
          <Container>
            <div className="flex justify-center items-center h-64">
              <div className="loading-spinner w-8 h-8 mr-4"></div>
              <div className="body-elegant text-lg text-neutral-gray">Loading products...</div>
            </div>
          </Container>
        </Section>
      </main>
    )
  }

  return (
    <main className="public-layout">
      <Header />
      
      {/* Page Header */}
      <Section className="bg-primary-sage text-white py-16">
        <Container>
          <ScrollAnimation animation="fadeIn">
            <div className="text-center">
              <h1 className="heading-elegant text-4xl md:text-5xl font-bold mb-4">
                Art Collection
              </h1>
              <p className="body-elegant text-white/90 text-lg max-w-2xl mx-auto">
                Discover unique prints, postcards, and riso artwork crafted with love and attention to detail
              </p>
            </div>
          </ScrollAnimation>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-64">
              <ScrollAnimation animation="slideLeft">
                <div className="p-6 sticky top-8">
                  <FilterBar onFilterChange={handleFilterChange} products={products} />
                </div>
              </ScrollAnimation>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
                {/* Header with sorting */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <span className="body-elegant text-neutral-gray">
                      {filteredProducts.length} products found
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="body-elegant text-sm text-neutral-gray">Sort by:</span>
                    <div className="relative">
                      <select 
                        className="appearance-none bg-white border border-neutral-border-light rounded-lg px-4 py-2 pr-8 text-sm text-primary-charcoal focus:outline-none focus:ring-2 focus:ring-accent-coral focus:border-accent-coral"
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                      >
                        <option value="featured">Featured</option>
                        <option value="newest">Newest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name">Name: A to Z</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-gray pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <Grid cols={3} gap="lg">
                  {filteredProducts.map((product) => {
                    const images = JSON.parse(product.images || '[]')
                    const firstImage = images.length > 0 ? images[0] : null
                    
                    return (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        slug={product.slug}
                        title={product.title}
                        type={product.type}
                        basePrice={product.basePrice}
                        image={firstImage}
                        variants={product.variants}
                      />
                    )
                  })}
                </Grid>

                {/* Empty State */}
                {filteredProducts.length === 0 && !loading && (
                  <ScrollAnimation animation="fadeIn">
                    <div className="text-center py-16">
                      <div className="card-elegant p-12 max-w-md mx-auto">
                        {products.length === 0 ? (
                          <>
                            <div className="text-6xl mb-6 opacity-50">🎨</div>
                            <h3 className="heading-elegant text-xl font-semibold mb-4">
                              No products available yet
                            </h3>
                            <p className="body-elegant text-neutral-gray mb-6">
                              Check back soon for new arrivals!
                            </p>
                            <Button variant="outline" onClick={() => window.location.reload()}>
                              Refresh Page
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="text-6xl mb-6 opacity-50">🔍</div>
                            <h3 className="heading-elegant text-xl font-semibold mb-4">
                              No products found
                            </h3>
                            <p className="body-elegant text-neutral-gray mb-6">
                              Try adjusting your search criteria or filters
                            </p>
                            <Button variant="outline" onClick={clearAllFilters}>
                              Clear All Filters
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </ScrollAnimation>
                )}
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </main>
  )
}