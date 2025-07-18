# Burbar Shop - Styling Guide

## Design System Overview

This guide ensures consistent styling across the entire application and prevents common issues like white-on-white text problems.

---

## Color Palette & Contrast Rules

### Primary Colors
- **Background**: `bg-white`, `bg-gray-50`, `bg-gray-100`
- **Text on Light**: `text-gray-900`, `text-gray-800`, `text-gray-700`
- **Text on Dark**: `text-white`, `text-gray-100`
- **Accent**: `text-orange-600`, `bg-orange-500`

### ⚠️ **NEVER DO**: White on White Prevention
```css
/* ❌ NEVER - These combinations cause invisible text */
.bg-white + .text-white
.bg-gray-50 + .text-gray-50
.bg-gray-100 + .text-gray-100

/* ✅ ALWAYS - Ensure proper contrast */
.bg-white + .text-gray-900
.bg-gray-50 + .text-gray-800
.bg-gray-100 + .text-gray-700
```

### Color Contrast Checklist
Before deploying any component:
- [ ] Text is readable on all backgrounds
- [ ] Buttons have proper contrast ratios
- [ ] Hover states maintain readability
- [ ] Focus states are visible

---

## Typography Scale

### Font Size Guidelines
Reduce overall font sizes for cleaner, more modern look:

```css
/* Headers */
.text-3xl → .text-2xl    /* Page titles */
.text-2xl → .text-xl     /* Section headers */
.text-xl → .text-lg      /* Subsection headers */

/* Body Text */
.text-lg → .text-base    /* Large body text */
.text-base → .text-sm    /* Regular body text */
.text-sm → .text-xs      /* Small text */

/* Specific Components */
.product-title: text-lg (was text-xl)
.product-description: text-sm (was text-base)
.product-price: text-base (was text-lg)
.button-text: text-sm (was text-base)
.filter-text: text-xs (was text-sm)
```

### Typography Hierarchy
1. **H1**: `text-2xl font-bold text-gray-900` (Page titles)
2. **H2**: `text-xl font-semibold text-gray-900` (Sections)
3. **H3**: `text-lg font-medium text-gray-900` (Subsections)
4. **Body**: `text-sm text-gray-700` (Regular content)
5. **Caption**: `text-xs text-gray-500` (Meta info)

---

## Component-Specific Guidelines

### Buttons
```css
/* Primary Button */
.btn-primary {
  @apply bg-orange-500 text-white text-sm px-4 py-2 rounded-md;
  @apply hover:bg-orange-600 focus:ring-2 focus:ring-orange-500;
}

/* Secondary Button */
.btn-secondary {
  @apply bg-gray-100 text-gray-900 text-sm px-4 py-2 rounded-md;
  @apply hover:bg-gray-200 focus:ring-2 focus:ring-gray-300;
}

/* Filter Button */
.btn-filter {
  @apply bg-white text-gray-700 text-xs px-3 py-2 border border-gray-300;
  @apply hover:bg-gray-50 focus:ring-2 focus:ring-orange-500;
}
```

### Cards & Containers
```css
/* Product Card */
.product-card {
  @apply bg-white border border-gray-200 rounded-lg p-4;
  @apply hover:shadow-md transition-shadow;
}

/* Filter Panel */
.filter-panel {
  @apply bg-white border-r border-gray-200 p-4;
}

/* Order Summary */
.order-summary {
  @apply bg-gray-50 border border-gray-200 rounded-lg p-4;
  /* Ensure all text inside uses dark colors */
  @apply text-gray-900;
}
```

### Product Descriptions
```css
/* Truncated Description */
.description-short {
  @apply text-sm text-gray-600 line-clamp-3;
}

/* Full Description (expanded) */
.description-full {
  @apply text-sm text-gray-600;
}

/* Read More Link */
.read-more-link {
  @apply text-xs text-orange-600 hover:text-orange-700 cursor-pointer;
}
```

---

## Layout & Spacing

### Grid & Spacing
```css
/* Shop Grid - Responsive */
.shop-grid-large {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.shop-grid-small {
  @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4;
}

/* Standard Spacing */
.section-padding: py-8 px-4
.card-padding: p-4
.button-padding: px-4 py-2
.input-padding: px-3 py-2
```

### Image Sizes
```css
/* Product Images - Large View */
.product-image-large {
  @apply aspect-square w-full object-cover rounded-lg;
}

/* Product Images - Small View */
.product-image-small {
  @apply aspect-square w-full object-cover rounded-md;
}
```

---

## Interactive States

### Hover & Focus States
```css
/* Always include hover states */
.interactive-element {
  @apply transition-colors duration-200;
  @apply hover:bg-gray-50 focus:outline-none focus:ring-2;
}

/* Button States */
.btn:hover {
  @apply transform scale-105 transition-transform;
}

.btn:focus {
  @apply ring-2 ring-offset-2;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}
```

---

## Responsive Breakpoints

### Mobile-First Approach
```css
/* Mobile (default) */
.mobile-default

/* Tablet */
@screen md {
  /* 768px and up */
}

/* Desktop */
@screen lg {
  /* 1024px and up */
}

/* Large Desktop */
@screen xl {
  /* 1280px and up */
}
```

### Component Responsiveness
- **Typography**: Reduce by 1 size on mobile
- **Spacing**: Reduce padding/margins by 25% on mobile
- **Grid**: Always stack on mobile, expand on larger screens

---

## Quality Checklist

### Before Every Component/Page:
- [ ] **Contrast Check**: No white on white anywhere
- [ ] **Typography**: Uses approved font sizes
- [ ] **Hover States**: All interactive elements have hover effects
- [ ] **Focus States**: Keyboard navigation works
- [ ] **Mobile**: Responsive on all screen sizes
- [ ] **Loading States**: Proper loading indicators
- [ ] **Error States**: Clear error messages with good contrast

### Testing Tools
1. **Browser DevTools**: Check contrast ratios
2. **Mobile Testing**: Test on actual devices
3. **Accessibility**: Use screen reader testing
4. **Color Blindness**: Test with color blindness simulators

---

## Implementation Examples

### ✅ Good Examples
```jsx
// Good: Clear contrast and hierarchy
<div className="bg-white p-4 border border-gray-200">
  <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Title</h2>
  <p className="text-sm text-gray-600 mb-4">Product description here...</p>
  <button className="bg-orange-500 text-white text-sm px-4 py-2 rounded-md hover:bg-orange-600">
    Add to Cart
  </button>
</div>
```

### ❌ Bad Examples
```jsx
// Bad: Poor contrast and inconsistent sizing
<div className="bg-gray-100 p-2">
  <h2 className="text-3xl text-gray-100 mb-1">Product Title</h2>  {/* Invisible text! */}
  <p className="text-lg text-white mb-2">Product description...</p>      {/* Poor contrast */}
  <button className="bg-gray-100 text-gray-100 text-lg p-6">     {/* Invisible button! */}
    Add to Cart
  </button>
</div>
```

---

## File Structure for Styles

```
styles/
├── globals.css           # Global styles and CSS variables
├── components.css        # Component-specific styles
└── utilities.css         # Custom utility classes

components/
├── ui/
│   ├── Button.tsx       # Standardized button component
│   ├── Card.tsx         # Standardized card component
│   └── Typography.tsx   # Standardized text components
```

---

## Notes

- **Always test in dark mode** if implementing
- **Use semantic HTML** for accessibility
- **Maintain consistent spacing** throughout the app
- **Test with real content** (long product names, descriptions)
- **Consider internationalization** (longer text in other languages)

---

*Last updated: January 2025*