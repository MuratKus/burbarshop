'use client'

import * as React from "react"
import Image, { ImageProps } from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends Omit<ImageProps, 'alt'> {
  alt: string
  className?: string
  fallback?: React.ReactNode
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto'
  quality?: number
  priority?: boolean
}

export function OptimizedImage({ 
  src, 
  alt, 
  className, 
  fallback,
  aspectRatio = 'auto',
  quality = 85,
  priority = false,
  ...props 
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)

  const aspectRatioClasses = {
    square: 'aspect-square',
    landscape: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: ''
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (hasError && fallback) {
    return <div className={cn("flex items-center justify-center bg-neutral-border-light", aspectRatioClasses[aspectRatio], className)}>
      {fallback}
    </div>
  }

  return (
    <div className={cn("relative overflow-hidden", aspectRatioClasses[aspectRatio], className)}>
      <Image
        src={src}
        alt={alt}
        quality={quality}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        {...props}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-neutral-border-light animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-sage border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

interface ProductImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
}

export function ProductImage({ src, alt, className, priority = false }: ProductImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      aspectRatio="square"
      quality={90}
      priority={priority}
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      fallback={
        <div className="flex flex-col items-center justify-center text-neutral-gray">
          <svg
            className="w-12 h-12 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">No image available</span>
        </div>
      }
    />
  )
}

interface HeroImageProps {
  src: string
  alt: string
  className?: string
  overlay?: boolean
}

export function HeroImage({ src, alt, className, overlay = true }: HeroImageProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        aspectRatio="landscape"
        quality={95}
        priority={true}
        className="object-cover"
        sizes="100vw"
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent" />
      )}
    </div>
  )
}

interface AvatarImageProps {
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function AvatarImage({ src, alt, size = 'md', className }: AvatarImageProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  return (
    <div className={cn("relative rounded-full overflow-hidden", sizeClasses[size], className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        aspectRatio="square"
        quality={90}
        className="object-cover"
        sizes={size === 'xl' ? '96px' : size === 'lg' ? '64px' : size === 'md' ? '48px' : '32px'}
        fallback={
          <div className="flex items-center justify-center bg-primary-sage text-white font-medium">
            {alt.charAt(0).toUpperCase()}
          </div>
        }
      />
    </div>
  )
}

interface ImageGalleryProps {
  images: string[]
  alt: string
  className?: string
}

export function ImageGallery({ images, alt, className }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image */}
      <div className="relative aspect-square">
        <OptimizedImage
          src={images[currentIndex]}
          alt={`${alt} - Image ${currentIndex + 1}`}
          fill
          quality={95}
          priority={currentIndex === 0}
          className="object-cover rounded-lg"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                index === currentIndex 
                  ? "border-accent-coral" 
                  : "border-neutral-border-light hover:border-primary-sage"
              )}
            >
              <OptimizedImage
                src={image}
                alt={`${alt} - Thumbnail ${index + 1}`}
                fill
                quality={70}
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}