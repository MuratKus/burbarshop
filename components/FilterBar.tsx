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
    <div className={`bg-gray-50 p-6 rounded-lg ${className || ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        )}
      </div>
      
      {/* Product Type Filter */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Type</h4>
        <div className="space-y-2">
          {availableFilters.types.map((type) => (
            <label key={type} className="flex items-center">
              <input 
                type="checkbox" 
                className="mr-2 text-gray-900"
                checked={selectedTypes.includes(type)}
                onChange={() => handleTypeChange(type)}
              />
              <span className="text-sm capitalize text-gray-900">
                {type.toLowerCase().replace('_', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Size</h4>
        <div className="space-y-2">
          {availableFilters.sizes.map((size) => (
            <label key={size} className="flex items-center">
              <input 
                type="checkbox" 
                className="mr-2 text-gray-900"
                checked={selectedSizes.includes(size)}
                onChange={() => handleSizeChange(size)}
              />
              <span className="text-sm text-gray-900">{size}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-medium text-gray-700 mb-2">Price Range</h4>
        <div className="space-y-2">
          {availableFilters.priceRanges.map((range) => (
            <label key={range} className="flex items-center">
              <input 
                type="checkbox" 
                className="mr-2 text-gray-900"
                checked={selectedPriceRanges.includes(range)}
                onChange={() => handlePriceRangeChange(range)}
              />
              <span className="text-sm text-gray-900">{range}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}