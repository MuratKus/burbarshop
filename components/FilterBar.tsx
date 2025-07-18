'use client'

import { useState, useEffect } from 'react'

interface FilterOptions {
  types: string[]
  sizes: string[]
  priceRanges: string[]
}

interface FilterBarProps {
  onFilterChange?: (filters: any) => void
  className?: string
  products?: any[]
}

const DEFAULT_PRICE_RANGES = ['Under €15', '€15 - €30', '€30+']

export function FilterBar({ onFilterChange, className, products = [] }: FilterBarProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
  const [availableFilters, setAvailableFilters] = useState<FilterOptions>({
    types: [],
    sizes: [],
    priceRanges: DEFAULT_PRICE_RANGES
  })

  // Extract available filter options from products
  useEffect(() => {
    if (!products.length) return

    const types = new Set<string>()
    const sizes = new Set<string>()

    products.forEach(product => {
      if (product.type) types.add(product.type)
      if (product.variants) {
        product.variants.forEach((variant: any) => {
          if (variant.size) sizes.add(variant.size)
        })
      }
    })

    setAvailableFilters({
      types: Array.from(types),
      sizes: Array.from(sizes),
      priceRanges: DEFAULT_PRICE_RANGES
    })
  }, [products])

  const handleTypeChange = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type]
    
    setSelectedTypes(newTypes)
    onFilterChange?.({
      types: newTypes,
      sizes: selectedSizes,
      priceRanges: selectedPriceRanges
    })
  }

  const handleSizeChange = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size]
    
    setSelectedSizes(newSizes)
    onFilterChange?.({
      types: selectedTypes,
      sizes: newSizes,
      priceRanges: selectedPriceRanges
    })
  }

  const handlePriceRangeChange = (range: string) => {
    const newRanges = selectedPriceRanges.includes(range)
      ? selectedPriceRanges.filter(r => r !== range)
      : [...selectedPriceRanges, range]
    
    setSelectedPriceRanges(newRanges)
    onFilterChange?.({
      types: selectedTypes,
      sizes: selectedSizes,
      priceRanges: newRanges
    })
  }

  const clearAllFilters = () => {
    setSelectedTypes([])
    setSelectedSizes([])
    setSelectedPriceRanges([])
    onFilterChange?.({
      types: [],
      sizes: [],
      priceRanges: []
    })
  }

  const hasActiveFilters = selectedTypes.length > 0 || selectedSizes.length > 0 || selectedPriceRanges.length > 0

  return (
    <div className={`bg-white border border-neutral-border-light rounded-xl p-6 shadow-elegant ${className || ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-lg font-semibold text-primary-charcoal">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-accent-coral hover:text-accent-terracotta transition-colors font-medium"
          >
            Clear all
          </button>
        )}
      </div>
      
      {/* Product Type Filter */}
      <div className="mb-6">
        <h4 className="font-medium text-primary-charcoal mb-3">Type</h4>
        <div className="space-y-1">
          {availableFilters.types.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTypes.includes(type)
                  ? 'bg-primary-sage text-white shadow-sm'
                  : 'text-neutral-gray hover:bg-primary-sage/10 hover:text-primary-charcoal'
              }`}
            >
              {type.toLowerCase().replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div className="mb-6">
        <h4 className="font-medium text-primary-charcoal mb-3">Size</h4>
        <div className="space-y-1">
          {availableFilters.sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedSizes.includes(size)
                  ? 'bg-primary-sage text-white shadow-sm'
                  : 'text-neutral-gray hover:bg-primary-sage/10 hover:text-primary-charcoal'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-medium text-primary-charcoal mb-3">Price Range</h4>
        <div className="space-y-1">
          {availableFilters.priceRanges.map((range) => (
            <button
              key={range}
              onClick={() => handlePriceRangeChange(range)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedPriceRanges.includes(range)
                  ? 'bg-primary-sage text-white shadow-sm'
                  : 'text-neutral-gray hover:bg-primary-sage/10 hover:text-primary-charcoal'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}