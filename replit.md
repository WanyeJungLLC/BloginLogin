# BloginLogin

## Overview

BloginLogin is a portfolio blog application for sharing insights, articles, and creative work. It features a public-facing blog and portfolio showcase with an admin dashboard for content management. The application uses PostgreSQL for data storage, Replit Object Storage for image uploads, and a custom authentication system with bcrypt password hashing and database-backed sessions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: TanStack Query (React Query) for server state and data fetching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Fonts**: Playfair Display (serif) for headings, Inter (sans-serif) for body text

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom bcrypt-based authentication with HTTP-only cookie sessions
- **Build Process**: Custom build script using esbuild for server bundling, Vite for client

### Data Storage Strategy
- **PostgreSQL with Drizzle ORM**: Primary storage for all data
  - `site_owner`: Admin credentials (username, bcrypt password hash, recovery email)
  - `sessions`: Database-backed session storage for persistence across restarts
  - `author_posts`: Blog posts with title, slug, content, categories, featured images
  - `author_portfolio`: Portfolio items with title, description, images, project links
  - `author_media`: Media file metadata tracking for uploaded images
  - `recovery_tokens`: Time-limited tokens for password reset functionality
- **Replit Object Storage**: Image uploads organized by bucket
  - `blog-images/`: Blog post featured images
  - `portfolio-images/`: Portfolio item images
  - `profile-uploads/`: Profile and general uploads

### Authentication System
- **Password Security**: bcrypt with 12 salt rounds
- **Session Management**: PostgreSQL-backed sessions with HTTP-only cookies
- **Session Duration**: 7 days with automatic cleanup of expired sessions
- **Credential Management**: Password change, email change (requires current password verification)
- **Password Recovery**: Token-based reset flow (email integration pending)

### Content Structure
- **Blog Posts**: title, slug, excerpt, content (HTML), category, featuredImageUrl, isPublished, readTimeMinutes, createdAt, publishedAt
- **Portfolio Items**: title, slug, description, category, year, imageUrl, projectUrl, isPublished, sortOrder

### Key Design Patterns
- Component-based architecture with reusable UI components from shadcn/ui
- Custom hooks for mobile detection and toast notifications
- Server-side only authentication (credentials never exposed to client)
- RESTful API with protected routes using requireAuth middleware

### Admin Credentials
- **Username**: John Stamos
- **Recovery Email**: (set via Account Settings)
- **Login URL**: /admin/login

## External Dependencies

### Replit Services
- **PostgreSQL Database**: Primary data storage via DATABASE_URL
- **Object Storage**: Image uploads via Replit Object Storage integration

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (auto-configured by Replit)
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID`: Object storage bucket ID
- `PUBLIC_OBJECT_SEARCH_PATHS`: Public asset paths
- `PRIVATE_OBJECT_DIR`: Private object directory

### UI Component Libraries
- Radix UI primitives (accordion, dialog, dropdown, tabs, etc.)
- Lucide React for icons
- Embla Carousel for carousel functionality
- React Day Picker for calendar components

### Development Tools
- Replit-specific Vite plugins for error overlay, cartographer, and dev banner
- Custom meta images plugin for OpenGraph image handling
