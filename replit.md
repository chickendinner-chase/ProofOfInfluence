# Web3 Link-in-Bio Platform

## Overview

This is a Web3-enabled link-in-bio platform similar to Linktree, allowing users to create personalized showcase pages with integrated wallet functionality. Users can authenticate via Replit Auth (Google OAuth), connect Web3 wallets, manage their profile and links, and track analytics. The platform features a public profile view for sharing and a dashboard for content management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, built using Vite for fast development and optimized production builds.

**UI Framework**: Shadcn UI components built on Radix UI primitives with Tailwind CSS for styling. The design follows a mobile-first approach with gradient-driven visual identity inspired by Linktree's simplicity and Rainbow.me's Web3 aesthetics.

**State Management**: TanStack Query (React Query) for server state management with built-in caching, optimistic updates, and automatic refetching. No additional global state management library is used.

**Routing**: Wouter for lightweight client-side routing with two main routes:
- `/` - Landing page (unauthenticated) or Dashboard (authenticated)
- `/:username` - Public profile pages

**Key Design Decisions**:
- Component-based architecture with reusable UI primitives
- Custom design system with CSS variables for theming (light/dark mode)
- Mobile-first responsive design with Tailwind breakpoints
- Type-safe prop interfaces for all components

### Backend Architecture

**Framework**: Express.js server with TypeScript, running on Node.js.

**Authentication System**: 
- Primary: Replit Auth integration using OpenID Connect (OIDC) with Passport.js strategy
- Secondary: Web3 wallet authentication via MetaMask signature verification
- Session management using express-session with PostgreSQL storage (connect-pg-simple)

**API Design**: RESTful API with the following endpoint categories:
- `/api/auth/*` - Authentication (login, logout, user session)
- `/api/profile/*` - Profile management (CRUD operations)
- `/api/links/*` - Link management and click tracking
- `/api/wallet/*` - Wallet connection and management
- `/api/analytics` - Analytics data retrieval

**Middleware Stack**:
- JSON body parsing with raw body preservation for webhook verification
- Session middleware with secure cookie configuration
- Request logging with response time tracking
- Passport.js authentication middleware

**Key Design Decisions**:
- Stateless API design with session-based authentication
- Separation of concerns: routes → storage layer → database
- Storage abstraction pattern (IStorage interface) for potential database swapping
- Automatic profile creation on first login

### Data Storage

**Database**: PostgreSQL accessed via Neon serverless driver with WebSocket support for serverless environments.

**ORM**: Drizzle ORM for type-safe database queries and schema management.

**Schema Design**:

1. **users table**: Core authentication table
   - Stores Replit Auth data (email, firstName, lastName, profileImageUrl)
   - Custom fields: username (unique), walletAddress (unique)
   - Timestamps: createdAt, updatedAt, lastLoginAt

2. **profiles table**: Public showcase information
   - Links to users table with cascade delete
   - Profile data: name, bio, avatarUrl
   - Social links: googleUrl, twitterUrl, weiboUrl, tiktokUrl
   - Analytics: totalViews, isPublic flag
   - Timestamps for tracking updates

3. **links table**: User's curated links
   - Links to users table with cascade delete
   - Link data: title, url, displayOrder (for custom ordering)
   - Analytics: clicks counter
   - Visibility: isVisible flag for draft links
   - Timestamps for tracking

4. **sessions table**: Session persistence (required for Replit Auth)
   - Standard connect-pg-simple schema
   - Indexed on expire column for efficient cleanup

**Key Design Decisions**:
- User-profile separation allows authentication without requiring complete profile setup
- Username is optional initially but required to make profile public
- Wallet address stored at user level for cross-platform identity
- Click tracking and view counting at database level for accuracy
- Cascade deletes ensure data integrity when users are removed

### External Dependencies

**Authentication & Identity**:
- **Replit Auth (OIDC)**: Primary authentication provider via Google OAuth
  - Uses openid-client library for OIDC flow
  - Provides user email, name, and profile image
  - Session-based authentication with PostgreSQL storage

**Database**:
- **Neon Serverless PostgreSQL**: Cloud PostgreSQL database
  - WebSocket-based connection for serverless compatibility
  - Managed via Drizzle Kit migrations

**Web3 Integration**:
- **MetaMask** (client-side): Browser wallet for Web3 authentication
  - Uses window.ethereum API for wallet connection
  - Signature-based verification for wallet ownership
  - Optional binding to existing accounts

**Payment Processing** (Planned):
- **Stripe**: Payment infrastructure mentioned in PRD for future implementation
  - One-time payments and subscriptions
  - Webhook handling for payment status updates

**UI & Styling**:
- **Radix UI**: Headless UI components for accessibility
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library
- **React Icons**: Additional social media icons (Google, Twitter, Weibo, TikTok)

**Development Tools**:
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **Drizzle Kit**: Database migration tool
- **Replit Dev Tools**: Cartographer and dev banner for development environment

**Key Integration Decisions**:
- Dual authentication system (traditional OAuth + Web3) for flexibility
- Serverless-compatible database connection for Replit deployment
- Shadcn UI for maintainable, customizable component library
- Session storage in database rather than memory for horizontal scaling
- Environment variable configuration for all external services