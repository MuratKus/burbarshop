'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

type ProductType = 'POSTCARD' | 'FINE_PRINT' | 'RISO_PRINT'
type VariantSize = 'A4' | 'A5' | 'SQUARE' | 'CUSTOM'

interface ProductVariant {
  id?: string
  size: VariantSize
  price: number
  stock: number
}

interface Product {
  id: string
  title: string
  description: string | null
  type: ProductType
  basePrice: number
  images: string[]
  variants: ProductVariant[]
}

interface EditProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter()
  const { id: productId } = use(params)
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'POSTCARD' as ProductType,
    basePrice: 0,
    images: [''] // Will be populated from product data
  })
  const [variants, setVariants] = useState<ProductVariant[]>([
    { size: 'A4', price: 0, stock: 0 }
  ])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}`)
      if (response.ok) {
        const productData = await response.json()
        setProduct(productData)
        
        // Populate form with existing data
        setFormData({
          title: productData.title,
          description: productData.description || '',
          type: productData.type,
          basePrice: productData.basePrice,
          images: JSON.parse(productData.images || '[]')
        })
        setVariants(productData.variants || [])
      } else {
        alert('Product not found')
        router.push('/admin/products')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      alert('Error loading product')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setFormData(prev => ({
          ...prev,
          images: [...prev.images.filter(img => img !== ''), result]
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    // Also remove from uploaded files if it's a new upload
    const existingImages = typeof product?.images === 'string' ? JSON.parse(product.images || '[]') : (product?.images || [])
    if (index >= existingImages.length) {
      const newFileIndex = index - existingImages.length
      setUploadedFiles(prev => prev.filter((_, i) => i !== newFileIndex))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let imageUrls = [...formData.images.filter(img => !img.startsWith('data:'))]
      
      // Upload new images if any
      if (uploadedFiles.length > 0) {
        const formDataUpload = new FormData()
        uploadedFiles.forEach(file => {
          formDataUpload.append('images', file)
        })
        
        const uploadResponse = await fetch('/api/admin/upload-images', {
          method: 'POST',
          body: formDataUpload
        })
        
        if (uploadResponse.ok) {
          const { urls } = await uploadResponse.json()
          imageUrls = [...imageUrls, ...urls]
        }
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: imageUrls,
          variants
        })
      })

      if (response.ok) {
        router.push('/admin/products')
      } else {
        alert('Error updating product')
      }
    } catch (error) {
      alert('Error updating product')
    } finally {
      setSaving(false)
    }
  }

  const addVariant = () => {
    setVariants(prev => [...prev, { size: 'A4', price: 0, stock: 0 }])
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ))
  }

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading product...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Product not found</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600 mt-2">Update product information and settings</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ProductType }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="POSTCARD">Postcard</option>
                <option value="FINE_PRINT">Fine Print</option>
                <option value="RISO_PRINT">Riso Print</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price (€)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.basePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
            
            {/* Current Images */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={image} 
                      alt={`Product ${index + 1}`} 
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload New Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload New Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">Select multiple images to upload</p>
            </div>
          </div>
        </div>

        {/* Product Variants */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Variants</h3>
          
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="flex gap-4 items-end p-4 border border-gray-200 rounded-md">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size
                  </label>
                  <select
                    value={variant.size}
                    onChange={(e) => updateVariant(index, 'size', e.target.value as VariantSize)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="A4">A4</option>
                    <option value="A5">A5</option>
                    <option value="SQUARE">Square</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={variant.price}
                    onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addVariant}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400"
            >
              + Add Variant
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  )
}