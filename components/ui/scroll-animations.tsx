'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollAnimationProps {
  children: React.ReactNode
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'rotateIn'
  duration?: number
  delay?: number
  threshold?: number
  className?: string
  once?: boolean
}

export function ScrollAnimation({
  children,
  animation = 'fadeIn',
  duration = 600,
  delay = 0,
  threshold = 0.1,
  className,
  once = true
}: ScrollAnimationProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [hasAnimated, setHasAnimated] = React.useState(false)
  const elementRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!hasAnimated || !once) {
            setIsVisible(true)
            setHasAnimated(true)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin: '50px',
      }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [threshold, once, hasAnimated])

  const animationClasses = {
    fadeIn: {
      initial: 'opacity-0',
      animate: 'opacity-100',
      transform: ''
    },
    slideUp: {
      initial: 'opacity-0',
      animate: 'opacity-100',
      transform: isVisible ? 'translate-y-0' : 'translate-y-8'
    },
    slideDown: {
      initial: 'opacity-0',
      animate: 'opacity-100',
      transform: isVisible ? 'translate-y-0' : '-translate-y-8'
    },
    slideLeft: {
      initial: 'opacity-0',
      animate: 'opacity-100',
      transform: isVisible ? 'translate-x-0' : 'translate-x-8'
    },
    slideRight: {
      initial: 'opacity-0',
      animate: 'opacity-100',
      transform: isVisible ? 'translate-x-0' : '-translate-x-8'
    },
    scaleIn: {
      initial: 'opacity-0',
      animate: 'opacity-100',
      transform: isVisible ? 'scale-100' : 'scale-95'
    },
    rotateIn: {
      initial: 'opacity-0',
      animate: 'opacity-100',
      transform: isVisible ? 'rotate-0' : 'rotate-3'
    }
  }

  const selectedAnimation = animationClasses[animation]

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all ease-out',
        isVisible ? selectedAnimation.animate : selectedAnimation.initial,
        selectedAnimation.transform,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

interface ParallaxProps {
  children: React.ReactNode
  speed?: number
  className?: string
}

export function Parallax({ children, speed = 0.5, className }: ParallaxProps) {
  const [offsetY, setOffsetY] = React.useState(0)
  const elementRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const rate = scrollTop * speed
        setOffsetY(rate)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <div
      ref={elementRef}
      className={cn('relative', className)}
      style={{
        transform: `translateY(${offsetY}px)`,
      }}
    >
      {children}
    </div>
  )
}

interface StaggeredAnimationProps {
  children: React.ReactNode
  staggerDelay?: number
  animation?: 'fadeIn' | 'slideUp' | 'scaleIn'
  className?: string
}

export function StaggeredAnimation({
  children,
  staggerDelay = 100,
  animation = 'slideUp',
  className
}: StaggeredAnimationProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const elementRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={elementRef} className={cn('space-y-4', className)}>
      {React.Children.map(children, (child, index) => (
        <ScrollAnimation
          animation={animation}
          delay={isVisible ? index * staggerDelay : 0}
          duration={600}
        >
          {child}
        </ScrollAnimation>
      ))}
    </div>
  )
}

interface CounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function Counter({ value, duration = 2000, className, prefix = '', suffix = '' }: CounterProps) {
  const [count, setCount] = React.useState(0)
  const [isVisible, setIsVisible] = React.useState(false)
  const elementRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.1,
      }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (!isVisible) return

    const startTime = Date.now()
    const endTime = startTime + duration

    const timer = setInterval(() => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      setCount(Math.floor(progress * value))

      if (now >= endTime) {
        setCount(value)
        clearInterval(timer)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [isVisible, value, duration])

  return (
    <div ref={elementRef} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  )
}

interface TypewriterProps {
  text: string
  speed?: number
  className?: string
  cursor?: boolean
  onComplete?: () => void
}

export function Typewriter({ 
  text, 
  speed = 100, 
  className, 
  cursor = true, 
  onComplete 
}: TypewriterProps) {
  const [displayText, setDisplayText] = React.useState('')
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isVisible, setIsVisible] = React.useState(false)
  const elementRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.1,
      }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (!isVisible) return

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, isVisible, onComplete])

  return (
    <div ref={elementRef} className={className}>
      {displayText}
      {cursor && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  )
}

interface MagneticProps {
  children: React.ReactNode
  strength?: number
  className?: string
}

export function Magnetic({ children, strength = 0.3, className }: MagneticProps) {
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const elementRef = React.useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!elementRef.current) return

    const rect = elementRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength
    
    setPosition({ x: deltaX, y: deltaY })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <div
      ref={elementRef}
      className={cn('transition-transform duration-300 ease-out', className)}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

interface FloatingElementProps {
  children: React.ReactNode
  amplitude?: number
  speed?: number
  className?: string
}

export function FloatingElement({ 
  children, 
  amplitude = 10, 
  speed = 3, 
  className 
}: FloatingElementProps) {
  const [offset, setOffset] = React.useState(0)
  const elementRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000
      const newOffset = Math.sin(elapsed * speed) * amplitude
      setOffset(newOffset)
      
      requestAnimationFrame(animate)
    }

    const animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [amplitude, speed])

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        transform: `translateY(${offset}px)`,
      }}
    >
      {children}
    </div>
  )
}