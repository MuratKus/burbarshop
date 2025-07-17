'use client'

import * as React from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Container, Section } from "./layout"
import { OptimizedImage } from "./image"
import { cn } from "@/lib/utils"
import { Mail, Check, ArrowRight, Gift, Sparkles, Bell } from "lucide-react"

interface NewsletterSignupProps {
  title?: string
  subtitle?: string
  description?: string
  benefits?: string[]
  backgroundImage?: string
  variant?: 'default' | 'minimal' | 'hero' | 'sidebar'
  className?: string
  onSubmit?: (email: string) => Promise<void>
}

export function NewsletterSignup({
  title = "Stay Inspired",
  subtitle = "Join our creative community",
  description = "Get exclusive access to new artwork, behind-the-scenes content, and special offers delivered to your inbox.",
  benefits = [
    "Early access to new artwork",
    "Exclusive discounts and offers",
    "Artist insights and stories",
    "Monthly creative inspiration"
  ],
  backgroundImage,
  variant = 'default',
  className,
  onSubmit
}: NewsletterSignupProps) {
  const [email, setEmail] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSubscribed, setIsSubscribed] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (onSubmit) {
        await onSubmit(email)
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      
      setIsSubscribed(true)
      setEmail('')
    } catch (err) {
      setError('Failed to subscribe. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (variant === 'minimal') {
    return (
      <div className={cn("bg-white p-6 rounded-lg shadow-elegant", className)}>
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-sage rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h3 className="heading-elegant text-xl font-semibold mb-2">{title}</h3>
          <p className="body-elegant text-neutral-gray">{description}</p>
        </div>

        {!isSubscribed ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </Button>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
          </form>
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="body-elegant text-green-600 font-medium">
              Thanks for subscribing! Check your email for confirmation.
            </p>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn("bg-primary-cream p-6 rounded-lg", className)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-accent-coral rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <h3 className="heading-elegant text-lg font-semibold">{title}</h3>
        </div>

        <p className="body-elegant text-neutral-gray text-sm mb-4">{description}</p>

        {!isSubscribed ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-sm"
            />
            <Button type="submit" disabled={isSubmitting} size="sm" className="w-full">
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
        ) : (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Successfully subscribed!</span>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'hero') {
    return (
      <Section className={cn("relative bg-primary-sage text-white overflow-hidden", className)}>
        {backgroundImage && (
          <div className="absolute inset-0">
            <OptimizedImage
              src={backgroundImage}
              alt="Newsletter background"
              fill
              className="object-cover opacity-20"
            />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-br from-primary-sage/95 via-primary-sage/90 to-primary-sage/95" />
        
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-accent-coral rounded-full flex items-center justify-center animate-pulse-soft">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h2 className="heading-elegant text-3xl md:text-4xl font-bold mb-4">
              {title}
            </h2>
            
            <p className="body-elegant text-white/90 text-lg md:text-xl mb-8">
              {description}
            </p>

            {!isSubscribed ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-accent-coral hover:bg-accent-coral/90 text-white"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 text-white">
                <Check className="w-5 h-5" />
                <span className="text-lg font-medium">Thanks for subscribing!</span>
              </div>
            )}

            {error && (
              <p className="text-red-300 text-sm mt-4">{error}</p>
            )}
          </div>
        </Container>
      </Section>
    )
  }

  // Default variant
  return (
    <Section className={cn("bg-white", className)}>
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-sage rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="heading-elegant text-2xl md:text-3xl font-bold">
                    {title}
                  </h2>
                  <p className="body-elegant text-neutral-gray">{subtitle}</p>
                </div>
              </div>
              
              <p className="body-elegant text-neutral-gray text-lg mb-8">
                {description}
              </p>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-accent-coral rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="body-elegant text-primary-charcoal">{benefit}</span>
                  </div>
                ))}
              </div>

              {!isSubscribed ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isSubmitting} className="sm:w-auto">
                      {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                  {error && (
                    <p className="text-red-600 text-sm">{error}</p>
                  )}
                  <p className="text-neutral-gray text-sm">
                    By subscribing, you agree to our privacy policy. Unsubscribe at any time.
                  </p>
                </form>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="body-elegant text-green-600 font-medium">
                      Thanks for subscribing!
                    </p>
                    <p className="body-elegant text-green-600 text-sm">
                      Check your email for confirmation.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Visual Element */}
            <div className="relative">
              <div className="aspect-square bg-primary-cream rounded-2xl flex items-center justify-center overflow-hidden">
                {backgroundImage ? (
                  <OptimizedImage
                    src={backgroundImage}
                    alt="Newsletter illustration"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-primary-sage rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                      <Gift className="w-12 h-12 text-white" />
                    </div>
                    <p className="body-elegant text-neutral-gray font-medium">
                      Join our creative community
                    </p>
                  </div>
                )}
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-accent-coral rounded-full animate-pulse-soft" />
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-primary-sage rounded-full animate-float" />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}