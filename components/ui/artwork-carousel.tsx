'use client'

import * as React from "react"
import Link from "next/link"
import { OptimizedImage } from "./image"
import { Button } from "./button"
import { Container, Section } from "./layout"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, ExternalLink } from "lucide-react"

interface ArtworkItem {
  id: string
  title: string
  type: string
  price: number
  image: string
  slug: string
  description?: string
  isNew?: boolean
  isFeatured?: boolean
}

interface ArtworkCarouselProps {
  artworks: ArtworkItem[]
  title?: string
  subtitle?: string
  className?: string
  autoPlay?: boolean
  autoPlayInterval?: number
  showDots?: boolean
  showArrows?: boolean
  itemsPerView?: number
}

export function ArtworkCarousel({
  artworks,
  title = "Featured Artwork",
  subtitle = "Discover our latest collection",
  className,
  autoPlay = true,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  itemsPerView = 3
}: ArtworkCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isHovered, setIsHovered] = React.useState(false)
  const [touchStart, setTouchStart] = React.useState(0)
  const [touchEnd, setTouchEnd] = React.useState(0)

  const totalSlides = Math.ceil(artworks.length / itemsPerView)

  // Auto-play functionality
  React.useEffect(() => {
    if (!autoPlay || isHovered) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, isHovered, totalSlides])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  return (
    <Section className={cn("bg-primary-cream", className)}>
      <Container>
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="heading-elegant text-3xl md:text-4xl font-bold mb-4">
            {title}
          </h2>
          <p className="body-elegant text-lg text-neutral-gray max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Carousel */}
        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div 
            className="overflow-hidden rounded-2xl"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(-${currentIndex * 100}%)`,
                width: `${totalSlides * 100}%`
              }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div 
                  key={slideIndex} 
                  className={cn(
                    "grid gap-6",
                    itemsPerView === 1 && "grid-cols-1",
                    itemsPerView === 2 && "grid-cols-1 md:grid-cols-2",
                    itemsPerView === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                    itemsPerView === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                  )}
                  style={{ width: `${100 / totalSlides}%` }}
                >
                  {artworks
                    .slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView)
                    .map((artwork) => (
                      <ArtworkCard key={artwork.id} artwork={artwork} />
                    ))}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {showArrows && totalSlides > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-elegant z-10"
                onClick={prevSlide}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-elegant z-10"
                onClick={nextSlide}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {/* Dots Navigation */}
        {showDots && totalSlides > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-200",
                  index === currentIndex 
                    ? "bg-accent-coral scale-125" 
                    : "bg-neutral-border-light hover:bg-primary-sage"
                )}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link href="/shop">
              View All Artwork
              <ExternalLink className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </Container>
    </Section>
  )
}

interface ArtworkCardProps {
  artwork: ArtworkItem
  className?: string
}

function ArtworkCard({ artwork, className }: ArtworkCardProps) {
  const [isWishlisted, setIsWishlisted] = React.useState(false)

  return (
    <div className={cn("group relative", className)}>
      <div className="card-elegant overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square">
          <OptimizedImage
            src={artwork.image}
            alt={artwork.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {artwork.isNew && (
              <span className="bg-accent-coral text-white px-3 py-1 rounded-full text-sm font-medium">
                New
              </span>
            )}
            {artwork.isFeatured && (
              <span className="bg-primary-sage text-white px-3 py-1 rounded-full text-sm font-medium">
                Featured
              </span>
            )}
          </div>

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

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Quick Actions */}
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button size="sm" className="flex-1" asChild>
              <Link href={`/shop/${artwork.slug}`}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Quick View
              </Link>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-2">
            <p className="text-sm text-primary-sage uppercase tracking-wide font-medium">
              {artwork.type}
            </p>
            <h3 className="heading-elegant text-lg font-semibold group-hover:text-accent-coral transition-colors">
              <Link href={`/shop/${artwork.slug}`}>
                {artwork.title}
              </Link>
            </h3>
          </div>

          {artwork.description && (
            <p className="body-elegant text-neutral-gray text-sm mb-4 line-clamp-2">
              {artwork.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="heading-elegant text-xl font-bold text-accent-coral">
              €{artwork.price.toFixed(2)}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/shop/${artwork.slug}`}>
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}