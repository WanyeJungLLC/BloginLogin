# Having Trouble? Strictly Vibecoder?

This guide provides troubleshooting help and ready-to-use prompts for AI-assisted development.

---

## First-Time Setup Issues

When you first fork or reproduce this template, you may encounter errors. Here's the step-by-step solution:

### Problem: "relation does not exist" errors

**Symptoms:**
- Server logs show: `error: relation "site_owner" does not exist`
- Similar errors for `author_posts`, `author_portfolio`, etc.
- The app loads but shows 500 errors for API calls

**Cause:** The database tables haven't been created yet.

**Solution:** Run the database migration:
```bash
npm run db:push
```

Then restart the application workflow.

---

### Problem: "No admin user found" or "Invalid credentials"

**Symptoms:**
- Server logs show: `No admin user found. Set ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL to create one.`
- Login attempts return "Invalid credentials"

**Cause:** The admin credentials environment variables aren't set for your environment.

**Solution:** Set the following environment variables:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `ADMIN_USERNAME` | `John Stamos` | Admin login username |
| `ADMIN_PASSWORD` | `1sR3aLLyAcL0n3!` | Admin login password (min 8 chars) |
| `ADMIN_EMAIL` | `change-me@example.com` | Recovery email address |

**On Replit:**
1. Open the **Secrets** tab (lock icon in the left sidebar)
2. Add each variable with its value
3. Make sure they're set for the **development** environment (or shared)
4. Restart the application workflow

**Important:** If variables exist in `production` but not `development`, you need to add them to the development environment separately.

---

### Complete First-Time Setup Checklist

1. **Push the database schema:**
   ```bash
   npm run db:push
   ```

2. **Set environment variables** (in Secrets tab):
   - `ADMIN_USERNAME` = `John Stamos`
   - `ADMIN_PASSWORD` = `1sR3aLLyAcL0n3!`
   - `ADMIN_EMAIL` = `change-me@example.com`

3. **Restart the application** (click Run or restart workflow)

4. **Verify in logs:** Look for `Admin user 'John Stamos' created successfully!`

5. **Login at** `/login` with the credentials above

6. **Change your password immediately** after first login!

---

## AI Assistant Prompts

The following prompts help AI assistants understand this project quickly.

---

## Prompt 1: For Replit Agent Users

Copy and paste this prompt into the Replit Agent chat when starting work on this project:

```
I'm working with BloginLogin, an open-source portfolio blog template. Here's what you need to know:

**Project Overview:**
- Full-stack React + Express application with TypeScript
- PostgreSQL database with Drizzle ORM (schema in shared/schema.ts)
- Authentication uses bcrypt password hashing with database-backed sessions
- Replit Object Storage for image uploads

**Key Files:**
- Database schema: shared/schema.ts
- API routes: server/routes.ts
- Storage operations: server/storage.ts
- Auth logic: server/auth.ts
- Frontend pages: client/src/pages/
- UI components: client/src/components/

**Default Admin Credentials (change after first login):**
- Username: John Stamos
- Password: 1sR3aLLyAcL0n3!
- Email: change-me@example.com

**Environment Setup:**
- Database is auto-configured on Replit (DATABASE_URL)
- Object Storage is auto-configured (DEFAULT_OBJECT_STORAGE_BUCKET_ID)
- Admin credentials come from ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL

**Tech Stack:**
- Frontend: React 18, Vite, Tailwind CSS, shadcn/ui, Wouter (routing), TanStack Query
- Backend: Express, Drizzle ORM, bcrypt, express-session
- Database: PostgreSQL

**Before making changes:**
1. Read replit.md for project preferences and architecture
2. Check shared/schema.ts for database structure
3. Review server/routes.ts for existing API endpoints

Please help me with: [YOUR REQUEST HERE]
```

### Example First-Time Setup Requests

**Option 1 - Direct and specific:**
> "Initialize the database tables and verify I can log in with the default admin credentials"

**Option 2 - Step-by-step:**
> "Help me: 1) Run the database migration to create tables, 2) Confirm the admin account exists, 3) Test logging in at /admin/login"

**Option 3 - Context-rich:**
> "This is a fresh install. Walk me through setting up the database schema and logging in for the first time with the default credentials"

**Option 4 - Goal-oriented:**
> "Get the app ready to use - set up the database and show me how to access the admin dashboard"

---

## Prompt 2: For Local IDE AI Assistants (VS Code, JetBrains, Cursor, etc.)

Copy and paste this prompt into your AI assistant (Copilot, Cursor, Cody, JetBrains AI, etc.):

```
I'm working with BloginLogin, an open-source portfolio blog template. Here's the context:

**Project Overview:**
- Full-stack React + Express application with TypeScript
- PostgreSQL database with Drizzle ORM (schema in shared/schema.ts)
- Authentication uses bcrypt password hashing with database-backed sessions
- Local file storage (./uploads folder) when running locally

**Key Files:**
- Database schema: shared/schema.ts
- API routes: server/routes.ts
- Storage operations: server/storage.ts
- Auth logic: server/auth.ts
- Local upload handling: server/local-storage.ts, server/local-upload-routes.ts
- Frontend pages: client/src/pages/
- UI components: client/src/components/

**Default Admin Credentials (change after first login):**
- Username: John Stamos
- Password: 1sR3aLLyAcL0n3!
- Email: change-me@example.com

**Local Development Setup:**
1. PostgreSQL required (use docker-compose.yml or local install)
2. Copy .env.example to .env
3. Set DATABASE_URL to your PostgreSQL connection string
4. Set STORAGE_PROVIDER=local for local file uploads
5. Run: npm install && npm run db:push && npm run dev

**Tech Stack:**
- Frontend: React 18, Vite, Tailwind CSS, shadcn/ui, Wouter (routing), TanStack Query
- Backend: Express, Drizzle ORM, bcrypt, express-session, multer (local uploads)
- Database: PostgreSQL

**Important Commands:**
- npm run dev - Start development server
- npm run db:push - Push schema changes to database
- npm run build - Build for production
- STORAGE_PROVIDER=local npm run dev - Run with local file storage

**Before making changes:**
1. Read replit.md for project architecture and conventions
2. Check shared/schema.ts for database structure
3. Review server/routes.ts for existing API endpoints
4. Check .env.example for required environment variables

Please help me with: [YOUR REQUEST HERE]
```

---

## Improving First-Time Setup (For Template Maintainers)

If you're maintaining or forking this template, here are improvements to make the initial setup smoother:

### Option 1: Auto-run Database Migration on Startup

Modify the `dev` script in `package.json` to automatically push the database schema:

```json
"dev": "npm run db:push && NODE_ENV=development tsx server/index.ts"
```

This ensures tables are created before the server starts, eliminating the "relation does not exist" errors.

### Option 2: Development-Only Default Credentials (IMPLEMENTED)

The server now uses default credentials **only in development mode** when environment variables aren't set:

```typescript
const isDev = process.env.NODE_ENV === "development";
const username = process.env.ADMIN_USERNAME || (isDev ? "John Stamos" : null);
const password = process.env.ADMIN_PASSWORD || (isDev ? "1sR3aLLyAcL0n3!" : null);
const recoveryEmail = process.env.ADMIN_EMAIL || (isDev ? "change-me@example.com" : null);
```

This means:
- **Development**: New forks will automatically create an admin with default credentials for easy testing
- **Production**: Environment variables are required - no insecure defaults are used

**Why this design choice?** Default credentials in production would be a security risk - anyone who knows the template could log into published apps using the default password. By requiring explicit credentials for production, we ensure every published instance has unique, secure admin access.

Users should set their own credentials in the Secrets tab (for production environment) before publishing.

### Option 3: Add a Setup Script

Create a `setup.sh` script that runs both steps:

```bash
#!/bin/bash
npm run db:push
echo "Database tables created!"
echo "Don't forget to set ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL in Secrets"
```

### Why These Issues Happen

1. **Database tables**: When you fork a Replit project, you get a fresh database. The schema definition exists in code, but the actual tables need to be created with `npm run db:push`.

2. **Environment variables**: Secrets are not copied when forking for security reasons. Each fork needs its own credentials configured.

---

## Tips for Both Prompts

1. **Replace `[YOUR REQUEST HERE]`** with your specific question or task
2. **Be specific** about what you want to change or add
3. **Reference file paths** when asking about specific functionality
4. **Mention the feature area** (blog, portfolio, auth, uploads) to help focus the response

### Example Requests:

- "Add a 'tags' field to blog posts that supports multiple tags per post"
- "Change the color scheme to use blue instead of the current neutral palette"
- "Add a contact form that saves submissions to the database"
- "Help me understand how the authentication flow works"
- "Add image gallery support to portfolio items"

---

## Quick Reference

| What | Where |
|------|-------|
| Database tables | `shared/schema.ts` |
| API endpoints | `server/routes.ts` |
| Auth system | `server/auth.ts` |
| DB operations | `server/storage.ts` |
| Frontend routing | `client/src/App.tsx` |
| Page components | `client/src/pages/` |
| UI components | `client/src/components/` |
| Styles | Tailwind CSS classes |
| Documentation | `docs/technical-guide.md`, `docs/user-guide.md` |
