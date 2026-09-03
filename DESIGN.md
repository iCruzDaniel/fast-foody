# Fast Foodiy - Design System

## Visual World

**Canon Fast Food App** - Proven patterns from Chipotle, McDonald's, and Taco Bell

### Core Principles
- **Efficiency First**: Every interaction should be fast and intuitive
- **Visual Hierarchy**: Bold typography, clear categories, scannable menu
- **Appetizing Photography**: Food images are the primary visual element
- **Mobile-First**: Designed for thumb-friendly interactions

### Color Palette

**Primary Colors**
- Brand Red: `#E31837` (McDonald's-inspired energy)
- Brand Green: `#006B3F` (Chipotle-inspired freshness)
- Warm Orange: `#FF6B35` (Taco Bell-inspired playfulness)

**Neutral Colors**
- Background: `#FFFFFF` (Clean white)
- Surface: `#F8F9FA` (Light gray)
- Text Primary: `#1A1A1A` (Near black)
- Text Secondary: `#6C757D` (Gray)

**Accent Colors**
- Success: `#28A745`
- Warning: `#FFC107`
- Error: `#DC3545`

### Typography

**Font Stack**
- Headings: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
- Body: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`

**Type Scale**
- Display: `3rem / 3.5rem` (Bold, 700)
- H1: `2.25rem / 2.5rem` (Bold, 700)
- H2: `1.5rem / 1.75rem` (Semi-bold, 600)
- H3: `1.25rem / 1.5rem` (Semi-bold, 600)
- Body: `1rem / 1.5rem` (Regular, 400)
- Small: `0.875rem / 1.25rem` (Regular, 400)

### Spacing System

8px grid system:
- `4px` (0.5)
- `8px` (1)
- `12px` (1.5)
- `16px` (2)
- `24px` (3)
- `32px` (4)
- `48px` (6)
- `64px` (8)
- `96px` (12)

### Component Patterns

**Navigation**
- Bottom tab bar on mobile (Menu, Cart, Orders, Profile)
- Sticky header with logo and cart icon on desktop
- Category pills for menu filtering

**Cards**
- Product cards with image, name, price, and quick-add button
- No shadows, clean borders or subtle elevation
- Hover states with scale transform

**Buttons**
- Primary: Filled with brand color, white text
- Secondary: Outlined with brand color
- Ghost: Text only with hover background
- Large touch targets (48px minimum)

**Forms**
- Clean input fields with labels
- Inline validation
- Clear error states

### Layout Patterns

**Mobile (First)**
- Single column layout
- Bottom navigation
- Full-width cards
- Swipeable category tabs

**Tablet**
- Two-column grid for products
- Side navigation option

**Desktop**
- Three-column layout: Categories | Products | Cart
- Persistent cart sidebar
- Hover states for interactions

### Motion

- **Micro-interactions**: Button press, card hover, tab switching
- **Page transitions**: Slide-in from right for checkout
- **Loading states**: Skeleton screens, not spinners
- **Feedback**: Toast notifications for actions

### Accessibility

- **Contrast**: AA compliant (4.5:1 for text)
- **Focus states**: Visible keyboard navigation
- **Touch targets**: Minimum 48px
- **Screen reader**: Proper ARIA labels
- **Reduced motion**: Respect prefers-reduced-motion

### Image Treatment

- **Food Photography**: High-quality, appetizing images
- **Aspect Ratio**: 16:9 for hero, 1:1 for product cards
- **Fallbacks**: Colored placeholders with food icons
- **Lazy Loading**: Progressive loading for performance

### Error States

- **Empty Cart**: Friendly illustration with CTA
- **Network Error**: Clear message with retry button
- **Out of Stock**: Grayed out with "Sold Out" badge
- **Form Errors**: Inline validation with helpful messages

### Brand Elements

- **Logo**: Clean, modern wordmark
- **Icons**: Outlined style, 24px grid
- **Illustrations**: Simple, friendly style for empty states
- **Photography Style**: Bright, natural lighting, close-up food shots