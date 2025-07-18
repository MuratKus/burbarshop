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
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className || ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-orange-600 hover:text-orange-700 transition-colors font-medium"
          >
            Clear all
          </button>
        )}
      </div>
      
      {/* Product Type Filter */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Type</h4>
        <div className="space-y-1">
          {availableFilters.types.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                selectedTypes.includes(type)
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {type.toLowerCase().replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Size</h4>
        <div className="space-y-1">
          {availableFilters.sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                selectedSizes.includes(size)
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Price Range</h4>
        <div className="space-y-1">
          {availableFilters.priceRanges.map((range) => (
            <button
              key={range}
              onClick={() => handlePriceRangeChange(range)}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                selectedPriceRanges.includes(range)
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-gray-900'
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