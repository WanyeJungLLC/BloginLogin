# BloginLogin

A modern, open-source portfolio blog application built with React and Express. Create and manage blog posts, showcase portfolio items, and control everything through a clean admin dashboard.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Default Admin Credentials](#default-admin-credentials)
- [Changing Your Credentials](#changing-your-credentials)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Configuration](#configuration)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [License](#license)

## Features

- **Blog Management**: Create, edit, and publish blog posts with Markdown support
- **Portfolio Showcase**: Display your projects with images and descriptions
- **Admin Dashboard**: Clean interface to manage all your content
- **Image Uploads**: Built-in image upload (Replit Object Storage or local filesystem)
- **Responsive Design**: Works beautifully on desktop and mobile
- **Secure Authentication**: bcrypt password hashing with HTTP-only session cookies

## Quick Start

### On Replit

1. **Fork this Repl** to your account
2. **Set up environment variables** (see [Configuration](#configuration))
3. **Click Run** - the app will start and create your admin account automatically
4. **Log in** at `/admin/login` with the default credentials
5. **Change your password** immediately in Account Settings

### Local Development (Quick Start)

```bash
# Clone the repository
git clone https://github.com/your-username/bloginlogin.git
cd bloginlogin

# Start PostgreSQL with Docker (easiest method)
docker-compose up -d

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Push database schema
npm run db:push

# Start the development server (with local file storage)
STORAGE_PROVIDER=local npm run dev
```

The app will be available at http://localhost:5000

## Default Admin Credentials

The app ships with these default credentials for first-time setup:

| Field | Value |
|-------|-------|
| **Username** | `John Stamos` |
| **Password** | `1sR3aLLyAcL0n3!` |
| **Email** | `change-me@example.com` |

> **IMPORTANT**: Change these credentials immediately after your first login!

> **Note**: The placeholder email (`change-me@example.com`) is safe to use initially. Password recovery is not fully implemented yet (no emails are actually sent). Update it to your real email in Account Settings.

## Changing Your Credentials

After logging in with the default credentials:

1. Go to **Admin Dashboard** (click your username or the Settings icon)
2. Navigate to **Account Settings** (`/admin/settings`)
3. Update your **Username** and **Recovery Email**
4. Change your **Password** to something secure
5. Click **Update** to save changes

See [docs/user-guide.md](docs/user-guide.md) for detailed instructions.

## Project Structure

```
bloginlogin/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components (8 custom + 53 shadcn/ui)
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and API client
│   │   └── hooks/          # Custom React hooks
│   └── index.html
├── server/                 # Express backend
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   ├── auth.ts             # Authentication logic
│   ├── local-storage.ts    # Local file storage provider
│   └── local-upload-routes.ts  # Local upload endpoints
├── shared/                 # Shared types
│   └── schema.ts           # Database schema (Drizzle ORM)
├── uploads/                # Local file uploads (when using STORAGE_PROVIDER=local)
├── docs/                   # Documentation
│   ├── technical-guide.md  # For developers
│   └── user-guide.md       # For users
├── docker-compose.yml      # PostgreSQL for local development
└── .env.example            # Environment variable template
```

## Technology Stack

### Frontend
| Package | Purpose |
|---------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Tailwind CSS | Styling |
| shadcn/ui | UI component library |
| Wouter | Routing |
| TanStack Query | Data fetching |

### Backend
| Package | Purpose |
|---------|---------|
| Express | Web server |
| Drizzle ORM | Database queries |
| PostgreSQL | Database |
| bcrypt | Password hashing |
| express-session | Session management |
| multer | Local file uploads |

See [docs/technical-guide.md](docs/technical-guide.md) for the complete technology breakdown.

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Admin account (created on first run)
ADMIN_USERNAME=John Stamos
ADMIN_PASSWORD=1sR3aLLyAcL0n3!
ADMIN_EMAIL=change-me@example.com

# Database
DATABASE_URL=postgresql://bloginlogin:bloginlogin@localhost:5432/bloginlogin

# Storage provider: "local" for local development, omit for Replit
STORAGE_PROVIDER=local
```

### Storage Providers

| Environment | Storage | Configuration |
|-------------|---------|---------------|
| **Replit** | Replit Object Storage | Automatic (no config needed) |
| **Local/Self-hosted** | Local filesystem | Set `STORAGE_PROVIDER=local` |

When using local storage, uploaded images are saved to the `./uploads` directory.

## Local Development

### Prerequisites
- Node.js 18+
- Docker (recommended) or PostgreSQL installed locally
- npm or yarn

### Option 1: Using Docker (Recommended)

```bash
# Start PostgreSQL
docker-compose up -d

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Push database schema
npm run db:push

# Start server with local file storage
STORAGE_PROVIDER=local npm run dev
```

### Option 2: Using Local PostgreSQL

1. Create a PostgreSQL database
2. Update `DATABASE_URL` in `.env` with your connection string
3. Run `npm run db:push` to create tables
4. Run `STORAGE_PROVIDER=local npm run dev`

### Development Commands

```bash
npm run dev              # Start development server (Replit mode)
STORAGE_PROVIDER=local npm run dev  # Start with local file storage
npm run build            # Build for production
npm run db:push          # Push schema to database
```

### Database Tables

Tables are created automatically on first run:

- `site_owner` - Admin user credentials
- `author_posts` - Blog posts
- `author_portfolio` - Portfolio items
- `author_media` - Uploaded media files
- `sessions` - User sessions

## Deployment

### On Replit
1. Fork this Repl
2. Configure environment variables in Secrets
3. Click "Deploy" to publish

### Self-Hosted
1. Build the application: `npm run build`
2. Set environment variables (including `STORAGE_PROVIDER=local`)
3. Run: `node dist/index.js`
4. Serve on port 5000 (or configure reverse proxy)

## Documentation

- **[Technical Guide](docs/technical-guide.md)** - Architecture, APIs, database schema, extending the app
- **[User Guide](docs/user-guide.md)** - Admin dashboard usage, content management, settings
- **[Having Trouble?](docs/HAVING-TROUBLE.md)** - AI prompts for Replit Agent and local IDE assistants

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with care by the BloginLogin Team
