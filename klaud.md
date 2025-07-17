# Notes for Claude Code

- **Codebase Understanding**: You have full access to the project structure and can make multi-file edits
- **MCP Integration**: Use the configured MCP servers for order management and payment processing
- **UI Consistency**: Follow shadcn/ui patterns and Tailwind conventions
- **Error Handling**: Always include proper error states and loading indicators
- **Performance**: Use React Server Components where appropriate, implement proper caching
- **Business Logic**: Prefer library solutions over custom implementations where possible

---

# Professional Design Implementation

## Design Reference Screenshots
The project should follow the sophisticated aesthetic shown in the provided reference images:
- Etsy Shop Manager interface for admin design
- Professional artist portfolio sites for public-facing pages  
- High-quality product showcases for shop layout
- Clean, minimalist typography and spacing throughout

## Visual Identity

### Color Palette
```css
/* Primary Colors */
--primary-sage: #B8C5B0;      /* Sage green from artist site */
--primary-cream: #F8F6F1;     /* Warm cream background */
--primary-charcoal: #2C2C2C;  /* Charcoal text */

/* Secondary Colors */
--accent-coral: #E85A4F;      /* For highlights and CTAs */
--accent-navy: #1E3A8A;       /* For links and actions */
--neutral-gray: #6B7280;      /* For secondary text */
--border-light: #E5E7EB;      /* For subtle borders */

/* Admin Interface */
--admin-sidebar: #1F2937;     /* Dark sidebar like Etsy */
--admin-background: #F9FAFB;  /* Light admin background */
--admin-white: #FFFFFF;       /* Content areas */
```

### Typography
```css
/* Headings - Elegant serif for artistic feel */
font-family: 'Playfair Display', serif;
/* Body - Clean sans-serif for readability */
font-family: 'Inter', sans-serif;
/* Monospace - For code and data */
font-family: 'JetBrains Mono', monospace;
```

## Page-Specific Design Requirements

### 1. Homepage Design
**Reference**: Artist portfolio site aesthetic from screenshots

- **Hero Section**: Full-width with sage green background, elegant serif typography for artist name
- **Featured Products**: Carousel with high-quality images and subtle shadows
- **About Section**: Two-column layout with generous whitespace
- **CTA Buttons**: Coral accent color with smooth hover effects

### 2. Shop Page Design
**Reference**: Professional product showcase from screenshots

- **Layout**: Sidebar filters with responsive product grid
- **Filter Sidebar**: Clean white background with subtle borders, sticky positioning
- **Product Grid**: 3-4 responsive columns with consistent image ratios
- **Product Cards**: Minimal design with hover effects, elegant typography

### 3. Admin Dashboard Design
**Reference**: Etsy Shop Manager interface from screenshots

- **Layout**: Dark sidebar navigation (#1F2937) with light main content (#F9FAFB)
- **Sidebar**: White text with proper spacing, coral accent for active states
- **Content Areas**: White cards with subtle shadows
- **Data Tables**: Clean striped rows with hover effects

### 4. Product Detail Page
- **Image Gallery**: Large main image with horizontal thumbnail row
- **Product Info**: Elegant serif typography for titles, coral accent for pricing
- **Add to Cart**: Prominent coral button with smooth interactions

### 5. Checkout Design
- **Layout**: Two-column form and order summary
- **Forms**: Clean inputs with proper validation feedback
- **Order Summary**: Sage-tinted background with clear typography hierarchy

## Component Design Standards

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--accent-coral);
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--primary-charcoal);
  border: 1px solid var(--border-light);
}
```

### Cards
```css
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

## Implementation Priority
1. **Design System Foundation** (Week 1)
   - Color palette and typography setup with CSS custom properties
   - Component library using shadcn/ui with custom variants
   - Responsive layout system with proper spacing

2. **Public Pages** (Week 2)
   - Professional homepage with hero section and carousel
   - Elegant shop page with sidebar filters and product grid
   - Sophisticated product detail pages with image galleries

3. **Admin Interface** (Week 3)
   - Etsy-style dashboard with dark sidebar navigation
   - Order management interface with status workflows
   - Product management with image upload capabilities

4. **Polish & Optimization** (Week 4)
   - Smooth animations and micro-interactions
   - Performance optimization and image handling
   - Accessibility improvements and mobile responsiveness

## Quality Standards

### Visual Quality
- ✅ High-quality product images with consistent styling and proper aspect ratios
- ✅ Elegant typography hierarchy using Playfair Display and Inter fonts
- ✅ Consistent color usage throughout following the sage/coral palette
- ✅ Adequate whitespace and visual breathing room on all pages
- ✅ Professional shadows and depth effects on interactive elements

### User Experience
- ✅ Intuitive navigation with clear user flows and breadcrumbs
- ✅ Fast loading times with optimized images and smooth animations
- ✅ Clear feedback for all user actions with proper loading states
- ✅ Accessible design meeting WCAG guidelines
- ✅ Mobile-first responsive design for all screen sizes

### Brand Consistency
- ✅ Sophisticated art gallery aesthetic throughout the application
- ✅ Professional presentation of artwork with high-quality imagery
- ✅ Consistent voice and tone reflecting the artist's brand
- ✅ High-end boutique shopping experience with premium feel
- ✅ Artist-focused storytelling elements and personal touches

## Claude Code Commands for Design Implementation

Use these commands in Claude Code to implement the professional design:

```bash
# Foundation setup
/project:implement-professional-design

# Specific page implementations
/project:create-homepage-hero
/project:build-admin-dashboard
/project:optimize-product-showcase
```

## Technical Implementation Notes

### CSS Framework Approach
- Use Tailwind CSS with custom design tokens defined in tailwind.config.js
- Create component variants for different contexts (admin vs public)
- Implement CSS custom properties for the color system
- Use CSS Grid and Flexbox for responsive layouts

### Component Architecture
- Build reusable components with shadcn/ui as the foundation
- Create a comprehensive design system with consistent props
- Implement proper TypeScript interfaces for all components
- Use compound components for complex UI patterns

### Performance Considerations
- Optimize all images using next/image with proper sizing
- Implement lazy loading for product galleries and carousels
- Use CSS-in-JS sparingly, prefer Tailwind utilities
- Bundle size optimization for production builds

---

# Do Not Touch

- `.vercel/` folder (deployment config)
- `node_modules/`, `.next/`, `out/` (generated artifacts)
- `.claude/` folder structure (Claude Code configuration)
- `.mcp.json` format (MCP server definitions)