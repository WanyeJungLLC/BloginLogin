# BloginLogin - Technical Guide

This guide provides detailed technical documentation for developers who want to understand, modify, or extend BloginLogin.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Authentication System](#authentication-system)
- [File Storage](#file-storage)
- [Packages and Libraries](#packages-and-libraries)
- [Extending the Application](#extending-the-application)
- [Naming Conventions](#naming-conventions)

---

## Architecture Overview

BloginLogin follows a modern full-stack architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                               │
│  React + TypeScript + Tailwind CSS + shadcn/ui              │
│  Vite (dev server & bundler)                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Server                               │
│  Express.js + TypeScript                                     │
│  RESTful API + Session Authentication                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Database                              │
│  PostgreSQL + Drizzle ORM                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Object Storage                          │
│  Replit Object Storage (images, media)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Directory Structure

```
client/
├── src/
│   ├── components/           # UI components
│   │   ├── ui/               # shadcn/ui components (53 files)
│   │   ├── blog-list.tsx     # Blog post listing
│   │   ├── hero.tsx          # Homepage hero section
│   │   ├── image-upload.tsx  # Image upload component
│   │   ├── layout.tsx        # Page layout wrapper
│   │   ├── markdown-editor.tsx    # Markdown editor
│   │   ├── markdown-renderer.tsx  # Markdown display
│   │   ├── ObjectUploader.tsx     # File uploader
│   │   └── portfolio-grid.tsx     # Portfolio grid
│   ├── pages/                # Route pages
│   │   ├── home.tsx
│   │   ├── journal.tsx
│   │   ├── blog-post.tsx
│   │   ├── not-found.tsx
│   │   └── admin/            # Admin pages
│   ├── lib/                  # Utilities
│   │   ├── api.ts            # API client functions
│   │   ├── auth-context.tsx  # Authentication context
│   │   ├── data.ts           # Data utilities
│   │   ├── queryClient.ts    # TanStack Query setup
│   │   └── utils.ts          # General utilities
│   ├── hooks/                # Custom hooks
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   └── use-upload.ts
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
└── index.html
```

### Key Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool and dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | - | Component library |
| Wouter | 3.x | Client-side routing |
| TanStack Query | 5.x | Server state management |
| Lucide React | - | Icon library |

### Routing

Routes are defined in `client/src/App.tsx`:

```typescript
<Switch>
  <Route path="/" component={Home} />
  <Route path="/journal" component={Journal} />
  <Route path="/journal/:slug" component={BlogPost} />
  <Route path="/admin/login" component={AdminLogin} />
  <Route path="/admin" component={AdminDashboard} />
  <Route path="/admin/posts/:id" component={PostEditor} />
  <Route path="/admin/portfolio/:id" component={PortfolioEditor} />
  <Route path="/admin/settings" component={AccountSettings} />
  <Route component={NotFound} />
</Switch>
```

---

## Backend Architecture

### Directory Structure

```
server/
├── index.ts              # Entry point, server setup
├── routes.ts             # API route definitions
├── storage.ts            # Database operations (IStorage)
├── auth.ts               # Authentication handlers
├── db.ts                 # Database connection
├── static.ts             # Static file serving
├── vite.ts               # Vite dev server integration
└── replit_integrations/  # Replit-specific integrations
    └── object_storage/   # File upload handling
```

### Server Startup Flow

1. `server/index.ts` initializes Express
2. Middleware: cookie-parser, JSON body parser
3. `ensureAdminExists()` checks/creates admin user
4. Routes registered via `registerRoutes()`
5. Static files served in production
6. Vite dev server in development

---

## Database Schema

Defined in `shared/schema.ts` using Drizzle ORM.

### Tables

#### site_owner
Admin user credentials.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| username | text | Unique username |
| password_hash | text | bcrypt hash |
| recovery_email | text | For password reset |
| display_name | text | Optional display name |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update |

#### author_posts
Blog posts.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| title | text | Post title |
| slug | text | URL-friendly identifier |
| excerpt | text | Short summary |
| content | text | Full content (Markdown/HTML) |
| content_format | text | "markdown" or "html" |
| category | text | Post category |
| featured_image_url | text | Hero image URL |
| is_published | boolean | Published status |
| read_time_minutes | integer | Estimated read time |
| created_at | timestamp | Creation time |
| published_at | timestamp | Publication time |

#### author_portfolio
Portfolio items.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| title | text | Project title |
| slug | text | URL-friendly identifier |
| description | text | Project description |
| category | text | Project category |
| year | text | Year completed |
| image_url | text | Project image |
| project_url | text | External link |
| is_published | boolean | Published status |
| sort_order | integer | Display order |
| created_at | timestamp | Creation time |

#### author_media
Uploaded media files.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| filename | text | Original filename |
| url | text | Storage URL |
| bucket | text | Storage bucket name |
| mime_type | text | File MIME type |
| size | integer | File size in bytes |
| created_at | timestamp | Upload time |

#### sessions
User session storage.

| Column | Type | Description |
|--------|------|-------------|
| sid | varchar | Session ID (primary key) |
| sess | json | Session data |
| expire | timestamp | Expiration time |

---

## API Reference

All endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login with username/password | No |
| POST | `/api/auth/logout` | End session | Yes |
| GET | `/api/auth/me` | Get current user | No (returns null if not logged in) |
| POST | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/change-credentials` | Update username/email | Yes |
| POST | `/api/auth/request-reset` | Request password reset | No |

### Blog Posts

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/posts` | List all posts | No |
| GET | `/api/posts/:id` | Get single post | No |
| POST | `/api/posts` | Create post | Yes |
| PATCH | `/api/posts/:id` | Update post | Yes |
| DELETE | `/api/posts/:id` | Delete post | Yes |

### Portfolio

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/portfolio` | List all items | No |
| GET | `/api/portfolio/:id` | Get single item | No |
| POST | `/api/portfolio` | Create item | Yes |
| PATCH | `/api/portfolio/:id` | Update item | Yes |
| DELETE | `/api/portfolio/:id` | Delete item | Yes |

### Media/Uploads

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/upload` | Upload file | Yes |
| GET | `/api/media` | List uploaded files | Yes |

---

## Authentication System

### Overview

- **Password Storage**: bcrypt with 12 salt rounds
- **Session Storage**: PostgreSQL-backed sessions
- **Session Duration**: 7 days
- **Cookie Settings**: HTTP-only, secure in production

### Flow

1. User submits credentials to `/api/auth/login`
2. Server verifies password with bcrypt
3. Session created and stored in database
4. Session ID sent as HTTP-only cookie
5. Subsequent requests include cookie automatically
6. `requireAuth` middleware validates session

### Protected Routes

Add `requireAuth` middleware to protect routes:

```typescript
app.post("/api/posts", requireAuth, async (req, res) => {
  // Only authenticated users reach here
});
```

---

## File Storage

### Replit Object Storage

Files are stored in Replit Object Storage with these buckets:

| Bucket | Purpose |
|--------|---------|
| `blog-images` | Blog post featured images |
| `portfolio-images` | Portfolio item images |
| `profile-uploads` | General uploads |

### Upload Flow

1. Client sends file to `/api/upload`
2. Server validates file type and size
3. File uploaded to Object Storage
4. URL returned to client
5. Media record created in database

---

## Packages and Libraries

### Frontend Dependencies

| Package | Purpose |
|---------|---------|
| `react`, `react-dom` | UI framework |
| `wouter` | Lightweight routing |
| `@tanstack/react-query` | Data fetching and caching |
| `@radix-ui/*` | Accessible UI primitives |
| `tailwindcss` | Utility CSS |
| `lucide-react` | Icons |
| `react-hook-form` | Form handling |
| `zod` | Schema validation |
| `date-fns` | Date formatting |
| `react-markdown` | Markdown rendering |
| `@uiw/react-codemirror` | Code editor |

### Backend Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web server |
| `drizzle-orm` | Database ORM |
| `pg` | PostgreSQL driver |
| `bcrypt` | Password hashing |
| `express-session` | Session management |
| `connect-pg-simple` | PostgreSQL session store |
| `cookie-parser` | Cookie parsing |

---

## Extending the Application

### Adding a New Page

1. Create component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Add navigation link in `client/src/components/layout.tsx`

### Adding a New API Endpoint

1. Define route in `server/routes.ts`
2. Add storage method in `server/storage.ts`
3. Update schema in `shared/schema.ts` if new table needed

### Adding a New Database Table

1. Define table in `shared/schema.ts`
2. Create insert schema with `createInsertSchema`
3. Export types
4. Run `npm run db:push` to update database

---

## Naming Conventions

### Files
- React components: `PascalCase.tsx` (e.g., `BlogList.tsx`)
- Utilities: `kebab-case.ts` (e.g., `query-client.ts`)
- Pages: `kebab-case.tsx` (e.g., `blog-post.tsx`)

### Code
- Variables/functions: `camelCase`
- Types/interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Database tables: `snake_case`

### Database Tables
| Table | Prefix | Purpose |
|-------|--------|---------|
| `site_owner` | site_ | Admin user |
| `author_posts` | author_ | Blog content |
| `author_portfolio` | author_ | Portfolio content |
| `author_media` | author_ | Uploaded files |

---

## Environment Variables

See `.env.example` for all configuration options.

### Required
- `ADMIN_USERNAME` - Initial admin username
- `ADMIN_PASSWORD` - Initial admin password
- `ADMIN_EMAIL` - Admin recovery email
- `DATABASE_URL` - PostgreSQL connection string

### Optional (Replit auto-configures)
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID`
- `PUBLIC_OBJECT_SEARCH_PATHS`
- `PRIVATE_OBJECT_DIR`
