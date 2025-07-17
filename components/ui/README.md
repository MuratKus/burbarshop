# Burbar Shop Design System

A professional, art gallery-inspired design system built with Tailwind CSS and React components.

## Color Palette

### Primary Colors
- **Sage**: `#B8C5B0` - Main brand color, used for highlights and accents
- **Cream**: `#F8F6F1` - Background color for public pages
- **Charcoal**: `#2C2C2C` - Primary text color

### Accent Colors
- **Coral**: `#E85A4F` - Call-to-action buttons and important highlights
- **Navy**: `#1E3A8A` - Links and secondary actions

### Neutral Colors
- **Gray**: `#6B7280` - Secondary text and subtle elements
- **Border Light**: `#E5E7EB` - Borders and dividers

### Admin Colors
- **Sidebar**: `#1F2937` - Admin navigation background
- **Background**: `#F9FAFB` - Admin main content background
- **White**: `#FFFFFF` - Admin cards and content areas

## Typography

### Fonts
- **Heading**: Playfair Display (serif) - For titles and headings
- **Body**: Inter (sans-serif) - For body text and UI elements
- **Mono**: JetBrains Mono (monospace) - For code and data

### Usage
```tsx
<h1 className="heading-elegant">Main Title</h1>
<p className="body-elegant">Body text content</p>
```

## Components

### Buttons
```tsx
import { Button } from '@/components/ui/button'

<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Outlined Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="admin">Admin Button</Button>
<Button variant="sage">Sage Button</Button>
```

### Cards
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

### Layout
```tsx
import { Layout, Container, Grid, Section } from '@/components/ui/layout'

<Layout type="public">
  <Section>
    <Container>
      <Grid cols={3}>
        {/* Content */}
      </Grid>
    </Container>
  </Section>
</Layout>
```

### Forms
```tsx
import { Form, FormInput, FormSubmit } from '@/components/ui/form'

<Form onSubmit={handleSubmit}>
  <FormInput 
    label="Email" 
    type="email" 
    required 
    error={errors.email}
  />
  <FormSubmit loading={isSubmitting}>
    Submit
  </FormSubmit>
</Form>
```

### Images
```tsx
import { OptimizedImage, ProductImage } from '@/components/ui/image'

<ProductImage 
  src="/path/to/image.jpg" 
  alt="Product name" 
  priority={true}
/>
```

## Animations

### Utility Classes
- `animate-fade-in` - Fade in animation
- `animate-slide-up` - Slide up animation
- `animate-float` - Floating animation
- `animate-pulse-soft` - Soft pulse animation
- `animate-shimmer` - Shimmer loading animation

### Hover Effects
- `hover-lift` - Lift on hover
- `hover-glow` - Glow effect on hover
- `hover-scale` - Scale on hover
- `elegant-hover` - Combined shadow and scale hover

### Loading States
- `loading-skeleton` - Skeleton loading animation
- `loading-spinner` - Spinner animation

## Usage Examples

### Product Showcase
```tsx
import { ProductShowcase } from '@/components/ui/product-showcase'

<ProductShowcase 
  products={products}
  title="Featured Products"
  subtitle="Discover our latest artwork"
  layout="grid"
  columns={3}
/>
```

### Admin Layout
```tsx
import { AdminLayout } from '@/components/ui/admin-sidebar'

<AdminLayout>
  <div className="admin-card">
    <h1 className="heading-elegant text-2xl mb-6">Dashboard</h1>
    {/* Admin content */}
  </div>
</AdminLayout>
```

### Public Header
```tsx
import { Header, Hero, Footer } from '@/components/ui/header'

<Header />
<Hero 
  title="Welcome to Burcinbar"
  subtitle="Unique art prints and postcards"
>
  <Button size="lg">Shop Now</Button>
</Hero>
<Footer />
```

## Best Practices

1. **Use semantic HTML** - Always use proper HTML elements
2. **Consistent spacing** - Use the spacing scale (xs, sm, md, lg, xl)
3. **Proper contrast** - Ensure text meets accessibility standards
4. **Responsive design** - All components are mobile-first
5. **Performance** - Use OptimizedImage for all images
6. **Loading states** - Always provide loading and error states
7. **Focus management** - Use focus-ring utility for keyboard navigation

## Accessibility

- All components include proper ARIA attributes
- Keyboard navigation is fully supported
- Color contrast meets WCAG guidelines
- Screen reader friendly markup
- Focus indicators are visible and clear

## Development

To extend or modify components:

1. Follow the existing patterns
2. Use the design tokens consistently
3. Add proper TypeScript types
4. Include error handling
5. Test across different screen sizes
6. Ensure accessibility compliance