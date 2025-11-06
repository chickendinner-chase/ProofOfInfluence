# Design Guidelines: Web3 Link-in-Bio Platform

## Design Approach

**Reference-Based Design:** POI-centric Web3 Profile design with Rainbow.me's Web3 aesthetics, Gradient.page's modern visual treatment, and emphasis on on-chain influence display and Gradient.page's modern visual treatment

**Core Principles:** 
- Mobile-first centered hierarchy
- Gradient-driven visual identity
- Crypto-native with mainstream accessibility
- Wallet-first interaction model
- Professional polish with playful gradients

## Typography System

**Font Families:**
- Primary: Inter (universal readability, extensive weights)
- Accent: JetBrains Mono for wallet addresses/technical elements

**Type Scale:**
- Profile Name: text-3xl md:text-4xl font-bold
- Bio: text-lg md:text-xl font-normal leading-relaxed
- Link Labels: text-base md:text-lg font-semibold
- Wallet Address: text-sm font-mono tracking-tight
- Metadata/Analytics: text-xs md:text-sm
- Section Headers: text-xl font-bold
- Button Text: text-base font-semibold

## Layout System

**Spacing Primitives:** Consistent use of 4, 6, 8, and 12 units
- Container padding: p-6 md:p-8
- Section spacing: space-y-6 md:space-y-8
- Component gaps: gap-4 to gap-6
- Link stack: space-y-4

**Container Strategy:**
- Public Profile: max-w-lg (512px) centered, px-4 md:px-6
- Edit Mode Main: max-w-6xl with two-column layout
- Analytics Dashboard: max-w-5xl
- Mobile: Full-width with horizontal padding

**Responsive Grid:**
- Public: Single column throughout
- Edit Desktop: 40% preview (sticky) + 60% controls (scrollable)
- Analytics: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Edit Mobile: Stacked single column

## Component Library

### Navigation & Header

**Top Navigation Bar (Edit Mode):**
- Fixed position with backdrop blur effect
- Three-section layout: Logo (left) + Page Title (center) + Actions (right)
- Right actions: Preview toggle, Wallet connection, Publish button
- Height: h-16 with px-6 horizontal padding
- Subtle border-bottom separator

**Wallet Connection Component:**
- Disconnected: "Connect Wallet" with wallet icon, px-6 py-2.5
- Connected: Truncated address (0x1234...5678) with network badge
- Dropdown menu: Full address with copy, ENS display, network switcher, disconnect
- Success feedback toast on copy action
- Network indicator badge (Ethereum/Polygon) with chain icon

### Profile Section (Public View)

**Profile Header:**
- Avatar: w-28 h-28 md:w-32 md:h-32, circular with gradient border ring
- Name: Directly below avatar, text-3xl md:text-4xl, font-bold, text-center
- Bio: Max-w-md, text-lg, leading-relaxed, text-center, mt-3
- Wallet Display: Truncated address with copy button, mt-4
- Connected badge with pulse animation indicating active wallet
- Total engagement metrics: "X total clicks" in subtle text-sm

**Gradient Background Treatment:**
- Animated mesh gradient covering full viewport
- Subtle grain texture overlay for depth
- Content maintains high contrast readability
- Gradient shifts based on user's theme selection

### Link Components

**Primary Link Button:**
- Full-width within container, rounded-2xl
- Padding: py-4 md:py-5, px-6
- Glass-morphism effect: backdrop-blur with semi-transparent background
- Platform icon (24x24) aligned left with mr-4
- Link title: font-semibold, text-base md:text-lg
- Click counter badge: absolute right-4, text-xs in pill shape
- Hover: Lift effect (-translate-y-1) with increased backdrop blur
- Active: Slight scale-down (scale-98)

**Social Link Variants:**
- Platform-specific branded treatments for Google, X, Weibo, TikTok
- Icon + platform name + username/handle display
- Verified badge indicator for claimed profiles
- Direct link-through on click

**Custom Link Buttons:**
- Support for custom icons (uploaded or emoji)
- Thumbnail preview option (40x40, rounded-lg, left-aligned)
- External link indicator icon on right
- Title + optional subtitle layout

**Special Web3 Links:**
- Payment request links: Show crypto amount + currency
- NFT showcase: Thumbnail + collection name
- Token gating indicator: Lock icon for exclusive content

### Edit Mode Interface

**Live Preview Panel (Left, Sticky):**
- Exact replica of public profile view
- Sticky positioning: top-16 (below nav), max-h-screen, overflow-auto
- Bordered container with subtle shadow
- Scale factor: 0.85 on desktop for context
- Real-time updates as user edits

**Controls Panel (Right, Scrollable):**

**Profile Settings Card:**
- Avatar upload zone: Circular dropzone, 120x120 preview
- Drag-drop support with file size limit display
- Name input: Large text-2xl preview style
- Bio textarea: 200 character limit with counter, 4 rows min-height
- Wallet connection status display

**Links Manager:**
- Draggable card list with grab handles (6-dot grid icon, left edge)
- Each card contains:
  - Drag handle (w-8)
  - Platform/type selector dropdown (icons + labels)
  - Title input field
  - URL input (font-mono, text-sm)
  - Visibility toggle switch (iOS-style)
  - Analytics preview (click count)
  - Delete button (trash icon, right edge)
- Cards: p-5, rounded-xl, border, space-y-3 internal
- Drag state: opacity-70, scale-102, cursor-grabbing
- Drop indicators: Dashed borders with highlight between cards

**Add Link Section:**
- Full-width dashed-border button
- Text: "Add New Link" with plus icon, py-8
- Dropdown menu showing link type options:
  - Social platforms (with icons)
  - Custom URL
  - Web3 payment
  - Email/Contact

**Appearance Customizer:**
- Theme preset gallery: 3x3 grid of gradient thumbnails
- Each thumbnail: 80x80, rounded-lg, clickable
- Selected state: Ring outline with checkmark overlay
- Custom gradient builder: Dual color picker + angle slider
- Background pattern selector: Grid, dots, mesh options
- Button style variants: Glass, solid, outlined

**Analytics Dashboard Card:**
- Summary metrics row: Total views, total clicks, unique visitors
- Per-link performance: Table layout with columns: Link name, Clicks, CTR
- Time period selector: Segmented control (7D, 30D, All Time)
- Top performing link highlight with trophy icon
- Export data button (download CSV)

### Airdrop Eligibility Section

**Wallet Verification Panel:**
- Large checkmark icon when wallet connected
- "Eligible for Airdrops" status message
- Connected wallet address display with verification badge
- Airdrop criteria checklist:
  - Wallet connected (checkmark)
  - Profile published (checkmark)
  - Minimum 3 links added (progress indicator)
- Notification opt-in toggle for airdrop announcements

### Footer Component (Public Profile)

**Branding Footer:**
- Centered text: "Built with [Platform Name]"
- Small logo mark + wordmark
- Link to create own profile
- Spacing: mt-16, py-8, text-center, text-sm

### Forms & Inputs

**Text Input Fields:**
- Border style with focus ring expansion
- Padding: py-3.5 px-4, rounded-lg
- Label: text-sm font-semibold, mb-2
- Helper text: text-xs, mt-1.5
- Error state: Shake animation + error message below

**Toggle Switches:**
- iOS-style sliding toggle, w-11 h-6
- Smooth transition: transition-all duration-200
- Active state clearly indicated
- Label positioned left with mr-3

### Buttons

**Primary CTA (Publish, Save):**
- Gradient background treatment
- Padding: py-3.5 px-8, rounded-xl
- Font: text-base font-bold
- Shadow on hover: Larger, softer shadow
- Full-width on mobile, auto on desktop

**Secondary Actions:**
- Ghost style with border
- Same size/padding as primary
- Hover: Backdrop fill effect

**Icon-Only Buttons:**
- Square: w-10 h-10, rounded-lg
- Icon size: 20x20, centered
- Used for: copy, external link, delete, settings

### Drag-and-Drop System

**Visual Feedback:**
- Grab cursor on hover over handle
- Dragging: Reduced opacity, slight rotation (rotate-2)
- Drop zones: Animated dashed borders
- Reorder animation: smooth transform with spring physics
- Ghost placeholder during drag

### Analytics Visualizations

**Click Chart:**
- Horizontal bar chart showing top 5 links
- Bars: Rounded-lg, gradient fills
- Labels: Link titles (left), click counts (right)
- Hover: Tooltip with percentage breakdown

**Metrics Cards:**
- Grid layout: 3 columns on desktop, stacked mobile
- Each card: Large number (text-4xl font-bold) + label (text-sm)
- Icons for each metric type
- Subtle background gradients

## Images

**Profile Avatar:**
- User-uploaded, 128x128 minimum resolution
- Circular crop interface in edit mode
- Supports PNG, JPG, WebP
- 5MB file size limit with compression

**Social Platform Icons:**
- Use official brand icon libraries via CDN
- Size: 24x24 for link buttons, 20x20 for smaller contexts
- Maintain platform brand guidelines

**Link Thumbnails:**
- 48x48 custom uploaded icons/logos
- Displayed left of link text
- Automatic favicon fallback for URLs

**Background Patterns:**
- Procedurally generated mesh gradients (CSS-based)
- Subtle noise texture overlay for depth
- No static image backgrounds

**No Hero Section:** This is a single-page profile application with centered content focus, not a marketing site requiring hero treatment

## Accessibility & Interaction

- Minimum touch target: 44x44px for all interactive elements
- Focus visible on all controls with 2px offset ring
- Keyboard navigation: Tab order follows visual hierarchy
- Drag-drop keyboard alternative: Arrow keys + Space to grab/release
- ARIA labels on icon-only buttons
- Screen reader announcements for wallet status changes
- Live region updates for analytics data
- Skip links for main content navigation

## Animation Philosophy

**Subtle Motion Design:**
- Gradient background: Slow 20-second loop animation
- Link hover: Lift transform (-translate-y-1) in 150ms
- Wallet connection: Pulse animation on connected badge
- Drag reorder: Smooth 250ms spring animation
- Toast notifications: Slide-in-down with fade
- Loading states: Subtle spinner or skeleton screens

**Avoided Animations:**
- No parallax scrolling
- No auto-playing carousels
- No excessive micro-interactions
- No scroll-triggered reveals

## Responsive Breakpoints

- Mobile (base): Single column, touch-optimized spacing
- Tablet (md: 768px): Enhanced typography, preview panel appears
- Desktop (lg: 1024px): Two-column edit layout, optimal analytics grid

This design creates a professional Web3-native link platform that balances crypto sophistication with mainstream usability through gradient-driven aesthetics and wallet-first architecture.