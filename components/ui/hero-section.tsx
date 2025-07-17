'use client'

import * as React from "react"
import Link from "next/link"
import { OptimizedImage } from "./image"
import { Button } from "./button"
import { Container } from "./layout"
import { cn } from "@/lib/utils"
import { ArrowRight, Play } from "lucide-react"

interface HeroSectionProps {
  title: string
  subtitle?: string
  description?: string
  backgroundImage?: string
  heroImage?: string
  ctaText?: string
  ctaLink?: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
  showVideo?: boolean
  className?: string
}

export function HeroSection({
  title,
  subtitle,
  description,
  backgroundImage,
  heroImage,
  ctaText = "Shop Now",
  ctaLink = "/shop",
  secondaryCtaText = "Learn More",
  secondaryCtaLink = "/about",
  showVideo = false,
  className
}: HeroSectionProps) {
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false)

  return (
    <section className={cn("relative min-h-screen flex items-center justify-center overflow-hidden", className)}>
      {/* Background with texture overlay */}
      <div className="absolute inset-0 bg-primary-sage">
        {backgroundImage && (
          <OptimizedImage
            src={backgroundImage}
            alt="Hero background"
            fill
            className="object-cover opacity-20"
            priority
          />
        )}
        
        {/* Texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-sage/95 via-primary-sage/90 to-primary-sage/95" />
        
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          {/* Content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in">
            {subtitle && (
              <p className="text-white/90 text-lg font-body tracking-wide uppercase">
                {subtitle}
              </p>
            )}
            
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              {title}
            </h1>
            
            {description && (
              <p className="text-white/90 text-xl md:text-2xl font-body max-w-2xl leading-relaxed">
                {description}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-accent-coral text-white hover:bg-accent-coral/90 shadow-elegant-hover group"
                asChild
              >
                <Link href={ctaLink}>
                  {ctaText}
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary-sage"
                asChild
              >
                <Link href={secondaryCtaLink}>
                  {secondaryCtaText}
                </Link>
              </Button>
            </div>

            {/* Video CTA */}
            {showVideo && (
              <button
                onClick={() => setIsVideoPlaying(true)}
                className="flex items-center justify-center lg:justify-start gap-3 text-white/90 hover:text-white transition-colors group"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Play className="w-5 h-5 ml-0.5" />
                </div>
                <span className="font-body text-lg">Watch Artist Story</span>
              </button>
            )}
          </div>

          {/* Hero Image */}
          <div className="relative animate-slide-up">
            {heroImage && (
              <div className="relative aspect-square lg:aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <OptimizedImage
                  src={heroImage}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Floating elements */}
                <div className="absolute top-8 right-8 w-16 h-16 bg-white/20 rounded-full animate-float" />
                <div className="absolute bottom-12 left-8 w-12 h-12 bg-accent-coral/60 rounded-full animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-4 w-8 h-8 bg-white/30 rounded-full animate-float" style={{ animationDelay: '2s' }} />
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-body">Scroll to explore</span>
          <div className="w-px h-12 bg-white/30" />
        </div>
      </div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Video would go here */}
            <div className="w-full h-full flex items-center justify-center text-white">
              <p>Video player would be implemented here</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

interface ArtistHeroProps {
  artistName: string
  tagline?: string
  description?: string
  portfolioImage?: string
  backgroundImage?: string
  className?: string
}

export function ArtistHero({
  artistName,
  tagline = "Contemporary Artist",
  description = "Creating unique prints and postcards that bring beauty and creativity to your space",
  portfolioImage,
  backgroundImage,
  className
}: ArtistHeroProps) {
  return (
    <HeroSection
      title={artistName}
      subtitle={tagline}
      description={description}
      heroImage={portfolioImage}
      backgroundImage={backgroundImage}
      ctaText="View Portfolio"
      ctaLink="/shop"
      secondaryCtaText="About Artist"
      secondaryCtaLink="/about"
      showVideo={true}
      className={className}
    />
  )
}