# BloginLogin - Codebase Structure

This document explains how the blog application is organized and distinguishes between custom code and library/vendor code.

## Quick Stats
- **Total files**: ~100
- **Custom application code**: ~43 files (43%)
- **Library/vendor code**: ~57 files (57%)

---

## Custom Application Code

### `/shared` (1 file)
- `schema.ts` - Database schema and types

### `/server` (7 files)
| File | Purpose |
|------|---------|
| `index.ts` | Server entry point |
| `routes.ts` | API endpoints |
| `db.ts` | Database connection |
| `storage.ts` | Data access layer |
| `auth.ts` | Authentication logic |
| `static.ts` | Static file serving |
| `vite.ts` | Vite dev server integration |

### `/client/src/components` (8 files)
| Component | Purpose |
|-----------|---------|
| `blog-list.tsx` | Blog post listing |
| `hero.tsx` | Homepage hero section |
| `image-upload.tsx` | Image upload UI |
| `layout.tsx` | Page layout wrapper |
| `markdown-editor.tsx` | Post editor |
| `markdown-renderer.tsx` | Markdown display |
| `ObjectUploader.tsx` | File upload |
| `portfolio-grid.tsx` | Portfolio grid |

### `/client/src/pages` (8 files)
- `home.tsx`, `journal.tsx`, `blog-post.tsx`, `not-found.tsx`
- `admin/login.tsx`, `admin/dashboard.tsx`, `admin/post-editor.tsx`, `admin/portfolio-editor.tsx`, `admin/account-settings.tsx`

### `/client/src/lib` (5 files)
- `api.ts`, `auth-context.tsx`, `data.ts`, `queryClient.ts`, `utils.ts`

### `/client/src/hooks` (3 files)
- `use-mobile.tsx`, `use-toast.ts`, `use-upload.ts`

### Root Config Files (7 files)
- `package.json`, `tsconfig.json`, `drizzle.config.ts`, `postcss.config.js`, `components.json`, `vite.config.ts`, `vite-plugin-meta-images.ts`

---

## Library/Vendor Code (Not Custom)

### `/client/src/components/ui` (53 files)
**Source**: [shadcn/ui](https://ui.shadcn.com/)

Reusable UI components built on Radix UI + Tailwind CSS.

### `/server/replit_integrations` (4 files)
**Source**: Replit Integration System

Object storage integration for file uploads.

---

## Old Material (Not Needed)

### `/old_material`
Files moved here are not required to run the application:
- `attached_assets/` - Uploaded images
- `generated-icon.png` - Placeholder icon
- `scripts/` - One-time scripts

---

## Reproducing This Blog

To recreate this blog from scratch, you need the **43 custom files** listed above. The 53 shadcn/ui components can be regenerated using `npx shadcn-ui add [component]`.
