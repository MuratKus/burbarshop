'use client'

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Grid, Section, Container } from "./layout"
import { ChevronLeft, ChevronRight, Star, Heart } from "lucide-react"

interface Product {
  id: string
  slug: string
  title: string
  type: string
  basePrice: number
  image?: string
  images?: string[]
  description?: string
  rating?: number
  reviews?: number
  variants?: Array<{
    id: string
    size: string
    price: number
    stock: number
  }>
}

interface ProductShowcaseProps {
  products: Product[]
  title?: string
  subtitle?: string
  className?: string
  layout?: 'grid' | 'carousel'
  columns?: 2 | 3 | 4
}

export function ProductShowcase({ 
  products, 
  title, 
  subtitle, 
  className,
  layout = 'grid',
  columns = 3
}: ProductShowcaseProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
  }

  if (layout === 'carousel') {
    return (
      <Section className={className}>
        <Container>
          {(title || subtitle) && (
            <div className="text-center mb-12">
              {title && (
                <h2 className="heading-elegant text-3xl md:text-4xl font-bold mb-4">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="body-elegant text-lg text-neutral-gray max-w-2xl mx-auto">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          <div className="relative">
            <div className="overflow-hidden rounded-lg">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {products.map((product, index) => (
                  <div key={product.id} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                      <div className="relative aspect-square">
                        <Image
                          src={product.image || '/placeholder.jpg'}
                          alt={product.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="space-y-6">
                        <div>
                          <p className="body-elegant text-sm text-primary-sage uppercase tracking-wide mb-2">
                            {product.type}
                          </p>
                          <h3 className="heading-elegant text-2xl md:text-3xl font-bold mb-4">
                            {product.title}
                          </h3>
                          <p className="body-elegant text-neutral-gray leading-relaxed">
                            {product.description || 'Beautiful artwork that brings creativity to your space.'}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className="heading-elegant text-3xl font-bold text-accent-coral">
                            €{product.basePrice.toFixed(2)}
                          </span>
                          {product.rating && (
                            <div className="flex items-center space-x-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "w-4 h-4",
                                      i < product.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="body-elegant text-sm text-neutral-gray">
                                ({product.reviews || 0})
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-4">
                          <Button asChild>
                            <Link href={`/shop/${product.slug}`}>
                              View Details
                            </Link>
                          </Button>
                          <Button variant="outline">
                            <Heart className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-elegant"
              onClick={prevSlide}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-elegant"
              onClick={nextSlide}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            {/* Dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {products.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    index === currentIndex ? "bg-accent-coral" : "bg-neutral-border-light"
                  )}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </div>
        </Container>
      </Section>
    )
  }

  return (
    <Section className={className}>
      <Container>
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="heading-elegant text-3xl md:text-4xl font-bold mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="body-elegant text-lg text-neutral-gray max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <Grid cols={columns}>
          {products.map((product) => (
            <ProductShowcaseCard key={product.id} product={product} />
          ))}
        </Grid>
      </Container>
    </Section>
  )
}

interface ProductShowcaseCardProps {
  product: Product
  className?: string
}

function ProductShowcaseCard({ product, className }: ProductShowcaseCardProps) {
  const [isWishlisted, setIsWishlisted] = React.useState(false)

  return (
    <div className={cn("group relative", className)}>
      <div className="card-elegant overflow-hidden">
        <div className="relative aspect-square">
          <Image
            src={product.image || '/placeholder.jpg'}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Wishlist Button */}
          <button
            className={cn(
              "absolute top-4 right-4 p-2 rounded-full transition-all duration-200",
              isWishlisted 
                ? "bg-accent-coral text-white" 
                : "bg-white/80 text-primary-charcoal hover:bg-white"
            )}
            onClick={() => setIsWishlisted(!isWishlisted)}
          >
            <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
          </button>

          {/* Quick View Button */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button className="w-full" asChild>
              <Link href={`/shop/${product.slug}`}>
                Quick View
              </Link>
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-2">
            <p className="body-elegant text-sm text-primary-sage uppercase tracking-wide">
              {product.type}
            </p>
            <h3 className="heading-elegant text-lg font-semibold group-hover:text-accent-coral transition-colors">
              <Link href={`/shop/${product.slug}`}>
                {product.title}
              </Link>
            </h3>
          </div>

          {product.rating && (
            <div className="flex items-center space-x-1 mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < product.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="body-elegant text-sm text-neutral-gray">
                ({product.reviews || 0})
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="heading-elegant text-xl font-bold text-accent-coral">
              €{product.basePrice.toFixed(2)}
            </span>
            <Button variant="outline" size="sm">
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}