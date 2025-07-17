// Core UI Components
export { Button, buttonVariants } from './button'
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'
export { Input } from './input'
export { Label } from './label'

// Layout Components
export { Layout, Container, Grid, Section } from './layout'

// Navigation Components
export { Header, Hero, Footer } from './header'
export { AdminSidebar, AdminLayout } from './admin-sidebar'

// Hero Components
export { HeroSection, ArtistHero } from './hero-section'

// Product Components
export { ProductShowcase } from './product-showcase'
export { ArtworkCarousel } from './artwork-carousel'

// Form Components
export { 
  Form, 
  FormField, 
  FormInput, 
  FormTextarea, 
  FormSelect, 
  FormCheckbox, 
  FormSubmit 
} from './form'

// Image Components
export { 
  OptimizedImage, 
  ProductImage, 
  HeroImage, 
  AvatarImage, 
  ImageGallery 
} from './image'

// Interactive Components
export { NewsletterSignup } from './newsletter-signup'

// Animation Components
export { 
  ScrollAnimation, 
  Parallax, 
  StaggeredAnimation, 
  Counter, 
  Typewriter, 
  Magnetic, 
  FloatingElement 
} from './scroll-animations'

// Design System Types
export interface DesignTokens {
  colors: {
    primary: {
      sage: string
      cream: string
      charcoal: string
    }
    accent: {
      coral: string
      navy: string
    }
    neutral: {
      gray: string
      borderLight: string
    }
    admin: {
      sidebar: string
      background: string
      white: string
    }
  }
  fonts: {
    heading: string
    body: string
    mono: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  shadows: {
    elegant: string
    elegantHover: string
    adminCard: string
  }
}

// Component Variants
export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'admin' | 'sage'
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'
export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6
export type SectionPadding = 'sm' | 'md' | 'lg' | 'xl'
export type AnimationType = 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'rotateIn'