# BloginLogin

A modern, open-source portfolio blog application built with React and Express. Create and manage blog posts, showcase portfolio items, and control everything through a clean admin dashboard.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Default Admin Credentials](#default-admin-credentials)
- [Changing Your Credentials](#changing-your-credentials)
- [Security Setup](#security-setup)
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

## Security Setup

**BloginLogin is designed for quick rebuilds and customizations.** The default admin credentials are **fake placeholders** used only to bootstrap the application during development. They **must be changed immediately** after first login.

### Admin Account Creation Behavior

The application handles admin account creation differently based on environment:

#### Development Mode (`NODE_ENV=development`)
- **Default admin is auto-created** if no admin exists in the database
- Uses environment variables or falls back to defaults:
  - Username: `John Stamos`
  - Password: `1sR3aLLyAcL0n3!`
  - Email: `change-me@example.com`
- **Change these immediately after first login!**

#### Production Mode (default)
- **Admin will NOT be auto-created** unless you explicitly set:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
  - `ADMIN_EMAIL`
- If these are not set, you'll need to manually create an admin in the database

#### Best Practice
Set `ADMIN_*` environment variables **before first run**, then log in and change your credentials immediately through the UI.

### First-Time Credential Change (UI)

After logging in with initial credentials:

1. **Navigate to Admin Login**: Go to `/admin/login` and sign in
2. **Open Admin Settings**: Click the Settings icon or go to `/admin/settings`
3. **Change Username and Recovery Email**:
   - Enter your new username
   - Enter a real recovery email address
   - Enter your current password to confirm
   - Click **Update Credentials**
4. **Change Password** (minimum 8 characters):
   - Enter your current password
   - Enter your new password
   - Confirm your new password
   - Click **Update Password**

### First-Time Credential Change (API)

You can also change credentials programmatically using the API:

#### Change Password
```bash
POST /api/auth/change-password
Content-Type: application/json
Cookie: blog_session=YOUR_SESSION

{
  "currentPassword": "your-current-password",
  "newPassword": "your-new-strong-password"
}
```

**Requirements**: Valid session cookie, minimum 8 characters for new password

#### Change Username/Email
```bash
POST /api/auth/change-credentials
Content-Type: application/json
Cookie: blog_session=YOUR_SESSION

{
  "password": "your-current-password",
  "newUsername": "newusername",
  "newEmail": "you@example.com"
}
```

**Requirements**: Valid session cookie, current password for verification

**Note**: All routes require authentication via session cookie. Passwords are hashed with bcrypt (12 rounds).

### Password Reset (Temporary Workflow)

While email is not yet configured, password reset works through server logs:

1. **Request Password Reset**:
   ```bash
   POST /api/auth/request-password-reset
   Content-Type: application/json
   
   {
     "email": "your-recovery-email@example.com"
   }
   ```

2. **Get Token from Server Logs**: The reset token will be logged to the server console:
   ```
   Password reset token for you@example.com: abc123...
   ```

3. **Reset Password**:
   ```bash
   POST /api/auth/reset-password
   Content-Type: application/json
   
   {
     "token": "token-from-server-log",
     "newPassword": "your-new-strong-password"
   }
   ```

### Database Hardening

**Do not use the example DATABASE_URL in production!** Follow these security practices:

#### Create Unique Database with Strong Credentials

```sql
-- Create a dedicated user with a strong password
-- IMPORTANT: Replace 'YOUR_STRONG_PASSWORD_HERE' with an actual strong password
CREATE USER bloginlogin_app WITH PASSWORD 'YOUR_STRONG_PASSWORD_HERE';

-- Create a dedicated database
CREATE DATABASE bloginlogin_prod;

-- Grant least-privilege access
GRANT ALL PRIVILEGES ON DATABASE bloginlogin_prod TO bloginlogin_app;
```

#### Enable SSL for Remote Databases

If using a remote database, require SSL connections:

```bash
DATABASE_URL=postgresql://bloginlogin_app:YOUR_STRONG_PASSWORD@your-db-host:5432/bloginlogin_prod?sslmode=require
```

#### Security Best Practices

- **Avoid exposing PostgreSQL port publicly**: Keep it internal to your Docker network or private network
- **Use strong, unique passwords**: Generate with a password manager (32+ random characters)
- **Rotate credentials regularly**: Update database passwords periodically
- **Store secrets securely**: Use Replit Secrets, AWS Secrets Manager, or your platform's secret management system
- **Never commit credentials**: Keep `.env` files out of version control (already in `.gitignore`)

### Session/Cookie Security

- **HTTP-only cookies**: Session cookies cannot be accessed by JavaScript (prevents XSS attacks)
- **Secure flag in production**: Cookies are only sent over HTTPS in production mode
- **7-day session expiry**: Sessions automatically expire after 7 days
- **Deploy behind HTTPS**: Always use HTTPS in production to protect session cookies

**Recommended**: Add rate limiting to `/api/auth/login` to prevent brute-force attacks. Consider using `express-rate-limit` or similar middleware.

### File Storage Guidance

#### Local Uploads (`STORAGE_PROVIDER=local`)
- Files are served from `/uploads` directory
- **Use only for public assets** (blog images, portfolio screenshots)
- All uploaded files are publicly accessible at `/uploads/filename`

#### Protected Assets
For files that require authentication:
- Use **Replit Object Storage** with ACLs
- Implement authentication checks on `GET /objects` requests
- Configure access rules in `storage.rules`

### Go-Live Checklist

Before deploying to production, ensure you complete these security steps:

- [ ] **Set unique admin credentials**:
  - [ ] Set `ADMIN_USERNAME` to a non-default value
  - [ ] Set `ADMIN_PASSWORD` to a strong password (min 8 chars, use passphrase)
  - [ ] Set `ADMIN_EMAIL` to your real email address
  
- [ ] **Change credentials after first login**:
  - [ ] Log in to `/admin/login`
  - [ ] Navigate to `/admin/settings`
  - [ ] Change Username to your preferred value
  - [ ] Change Password to a strong, unique password
  - [ ] Update Recovery Email to your real email
  
- [ ] **Harden database**:
  - [ ] Replace `DATABASE_URL` with unique database name
  - [ ] Use strong credentials (32+ char random password)
  - [ ] Enable SSL (`?sslmode=require` for remote databases)
  - [ ] Ensure PostgreSQL port is not publicly exposed
  
- [ ] **Ensure HTTPS deployment**:
  - [ ] Verify site is served over HTTPS
  - [ ] Check that Secure cookie flag is enabled (automatic in production)
  
- [ ] **Review storage strategy**:
  - [ ] Set appropriate storage provider (`local` or Replit Object Storage)
  - [ ] Configure access rules for protected content if needed
  - [ ] Verify upload directory permissions (if using local storage)

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
