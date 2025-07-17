'use client'

import * as React from "react"
import { OptimizedImage } from "./image"
import { Container, Section } from "./layout"
import { cn } from "@/lib/utils"
import { X, ChevronLeft, ChevronRight, ZoomIn, Download, Share2 } from "lucide-react"

interface GalleryImage {
  id: string
  src: string
  alt: string
  title?: string
  description?: string
  category?: string
  width?: number
  height?: number
}

interface ImageGalleryProps {
  images: GalleryImage[]
  title?: string
  subtitle?: string
  className?: string
  layout?: 'masonry' | 'grid' | 'carousel'
  columns?: 2 | 3 | 4 | 5
  spacing?: 'sm' | 'md' | 'lg'
  showCategories?: boolean
  showLightbox?: boolean
  showImageInfo?: boolean
}

export function ImageGallery({
  images,
  title,
  subtitle,
  className,
  layout = 'masonry',
  columns = 3,
  spacing = 'md',
  showCategories = true,
  showLightbox = true,
  showImageInfo = true
}: ImageGalleryProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = images.map(img => img.category).filter(Boolean)
    return [...new Set(cats)] as string[]
  }, [images])

  // Filter images by category
  const filteredImages = React.useMemo(() => {
    if (!selectedCategory) return images
    return images.filter(img => img.category === selectedCategory)
  }, [images, selectedCategory])

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const spacingClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const columnClasses = {
    2: 'columns-1 md:columns-2',
    3: 'columns-1 md:columns-2 lg:columns-3',
    4: 'columns-1 md:columns-2 lg:columns-3 xl:columns-4',
    5: 'columns-1 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5'
  }

  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
  }

  return (
    <Section className={cn("bg-white", className)}>
      <Container>
        {/* Header */}
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

        {/* Category Filter */}
        {showCategories && categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-4 py-2 rounded-full transition-all duration-200 font-medium",
                !selectedCategory 
                  ? "bg-accent-coral text-white" 
                  : "bg-neutral-border-light text-primary-charcoal hover:bg-primary-sage hover:text-white"
              )}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full transition-all duration-200 font-medium capitalize",
                  selectedCategory === category 
                    ? "bg-accent-coral text-white" 
                    : "bg-neutral-border-light text-primary-charcoal hover:bg-primary-sage hover:text-white"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className={cn(
            layout === 'masonry' && `${columnClasses[columns]} ${spacingClasses[spacing]}`,
            layout === 'grid' && `grid ${gridClasses[columns]} ${spacingClasses[spacing]}`
          )}>
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "loading-skeleton",
                  layout === 'masonry' && "mb-4 break-inside-avoid",
                  layout === 'grid' && "aspect-square"
                )}
                style={{
                  height: layout === 'masonry' ? `${200 + Math.random() * 200}px` : undefined
                }}
              />
            ))}
          </div>
        )}

        {/* Gallery */}
        {!isLoading && (
          <div className={cn(
            layout === 'masonry' && `${columnClasses[columns]} ${spacingClasses[spacing]}`,
            layout === 'grid' && `grid ${gridClasses[columns]} ${spacingClasses[spacing]}`
          )}>
            {filteredImages.map((image, index) => (
              <GalleryImageCard
                key={image.id}
                image={image}
                index={index}
                layout={layout}
                showImageInfo={showImageInfo}
                onLightboxOpen={showLightbox ? () => setLightboxIndex(index) : undefined}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredImages.length === 0 && (
          <div className="text-center py-12">
            <p className="body-elegant text-neutral-gray text-lg">
              No images found for the selected category.
            </p>
          </div>
        )}

        {/* Lightbox */}
        {showLightbox && lightboxIndex !== null && (
          <Lightbox
            images={filteredImages}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}
      </Container>
    </Section>
  )
}

interface GalleryImageCardProps {
  image: GalleryImage
  index: number
  layout: 'masonry' | 'grid' | 'carousel'
  showImageInfo: boolean
  onLightboxOpen?: () => void
}

function GalleryImageCard({ 
  image, 
  index, 
  layout, 
  showImageInfo, 
  onLightboxOpen 
}: GalleryImageCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg",
        layout === 'masonry' && "mb-4 break-inside-avoid",
        layout === 'grid' && "aspect-square"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onLightboxOpen}
    >
      <OptimizedImage
        src={image.src}
        alt={image.alt}
        fill={layout === 'grid'}
        width={layout === 'masonry' ? image.width : undefined}
        height={layout === 'masonry' ? image.height : undefined}
        className={cn(
          "transition-transform duration-300 group-hover:scale-105",
          layout === 'grid' && "object-cover"
        )}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* Overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 transition-opacity duration-300",
        isHovered ? "opacity-100" : "opacity-0"
      )}>
        {/* Zoom Icon */}
        <div className="absolute top-4 right-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <ZoomIn className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Image Info */}
        {showImageInfo && (image.title || image.description) && (
          <div className="absolute bottom-4 left-4 right-4 text-white">
            {image.title && (
              <h3 className="font-semibold text-lg mb-1">{image.title}</h3>
            )}
            {image.description && (
              <p className="text-sm text-white/90 line-clamp-2">{image.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface LightboxProps {
  images: GalleryImage[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

function Lightbox({ images, currentIndex, onClose, onNavigate }: LightboxProps) {
  const currentImage = images[currentIndex]

  const nextImage = () => {
    onNavigate((currentIndex + 1) % images.length)
  }

  const prevImage = () => {
    onNavigate((currentIndex - 1 + images.length) % images.length)
  }

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, onClose, prevImage, nextImage])

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Image */}
      <div className="relative max-w-4xl max-h-full">
        <OptimizedImage
          src={currentImage.src}
          alt={currentImage.alt}
          width={currentImage.width || 800}
          height={currentImage.height || 600}
          className="object-contain max-h-screen"
        />
      </div>

      {/* Image Info */}
      {(currentImage.title || currentImage.description) && (
        <div className="absolute bottom-4 left-4 right-4 text-white text-center">
          {currentImage.title && (
            <h3 className="font-semibold text-xl mb-2">{currentImage.title}</h3>
          )}
          {currentImage.description && (
            <p className="text-white/90">{currentImage.description}</p>
          )}
        </div>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-4 text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}