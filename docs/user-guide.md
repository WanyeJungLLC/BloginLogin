# BloginLogin - User Guide

This guide explains how to use the BloginLogin admin dashboard to manage your blog and portfolio.

## Table of Contents

- [Getting Started](#getting-started)
- [First Login](#first-login)
- [Changing Your Credentials](#changing-your-credentials)
- [Managing Blog Posts](#managing-blog-posts)
- [Managing Portfolio Items](#managing-portfolio-items)
- [Uploading Images](#uploading-images)
- [Publishing Content](#publishing-content)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the Admin Dashboard

1. Navigate to your site's URL
2. Click **Sign In** in the top navigation, or go directly to `/admin/login`
3. Enter your username and password
4. Click **Sign In**

---

## First Login

### Default Credentials

When you first set up BloginLogin, use these default credentials:

| Field | Value |
|-------|-------|
| **Username** | `John Stamos` |
| **Password** | `1sR3aLLyAcL0n3!` |

### Important: Change Your Credentials Immediately!

The default credentials are public (they're in the documentation). After your first login, immediately change them to secure your site.

---

## Changing Your Credentials

You can change your credentials either through the web UI or via API calls.

### Changing Your Password (UI)

1. **Sign in** to the admin dashboard at `/admin/login`
2. **Navigate to Admin Settings** at `/admin/settings` (or click the **Settings** icon/gear in the top navigation)
3. In the **Change Password** section:
   - Enter your **Current Password**
   - Enter your **New Password** (minimum 8 characters)
   - **Confirm** your new password
4. Click **Update Password**
5. You'll see a success message confirming the change

### Changing Your Username and Email (UI)

1. **Sign in** to the admin dashboard at `/admin/login`
2. **Navigate to Admin Settings** at `/admin/settings`
3. In the **Account Credentials** section:
   - Enter your new **Username**
   - Enter your new **Recovery Email** (used for password reset)
   - Enter your **Current Password** to confirm
4. Click **Update Credentials**
5. You'll see a success message confirming the change

### Changing Your Password (API)

If you prefer to use the API or need to automate credential changes:

```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -b "blog_session=YOUR_SESSION_COOKIE" \
  -d '{
    "currentPassword": "your-current-password",
    "newPassword": "your-new-strong-password"
  }'
```

**Response (Success):**
```json
{
  "message": "Password updated successfully"
}
```

### Changing Username/Email (API)

```bash
curl -X POST http://localhost:5000/api/auth/change-credentials \
  -H "Content-Type: application/json" \
  -b "blog_session=YOUR_SESSION_COOKIE" \
  -d '{
    "password": "your-current-password",
    "newUsername": "your-new-username",
    "newEmail": "your-real-email@example.com"
  }'
```

**Response (Success):**
```json
{
  "message": "Credentials updated successfully"
}
```

**Notes:**
- Replace `YOUR_SESSION_COOKIE` with your actual session cookie value from the browser
- You can get the session cookie from your browser's Developer Tools (Application/Storage → Cookies)
- The session cookie name is `blog_session`
- Both API endpoints require authentication (valid session cookie)

### Password Recovery Workflow (Temporary)

While email delivery is not yet configured, you can still reset your password using the API and server logs:

#### Step 1: Request a Password Reset

```bash
curl -X POST http://localhost:5000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-recovery-email@example.com"
  }'
```

**Response:**
```json
{
  "message": "If that email exists, a reset link has been sent"
}
```

#### Step 2: Get the Token from Server Logs

Check your server console output for a line like:
```
Password reset token for your-recovery-email@example.com: abc123def456...
```

Copy this token for the next step.

#### Step 3: Reset Your Password

```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456...",
    "newPassword": "your-new-strong-password"
  }'
```

**Response (Success):**
```json
{
  "message": "Password reset successfully"
}
```

**Important Notes:**
- Reset tokens are valid for **1 hour** from creation
- Each token can only be used **once**
- Requesting a new reset token invalidates all previous tokens
- In the future, reset tokens will be sent via email instead of server logs

### Password Requirements

- Minimum 8 characters
- Mix of letters, numbers, and symbols recommended
- Don't reuse passwords from other sites
- Consider using a passphrase for better security

---

## Managing Blog Posts

### Creating a New Post

1. From the admin dashboard, click **New Post**
2. Fill in the post details:
   - **Title**: Your post headline
   - **URL Slug**: Auto-generated from title (can customize)
   - **Category**: Optional category tag
   - **Excerpt**: Short summary shown in listings
   - **Featured Image**: Upload or provide URL
   - **Content**: Write your post in Markdown
3. Toggle **Published** when ready to go live
4. Click **Save Post**

### Editing a Post

1. From the admin dashboard, find the post
2. Click **Edit**
3. Make your changes
4. Click **Save Post**

### Deleting a Post

1. From the admin dashboard, find the post
2. Click the **trash icon**
3. Confirm deletion

> **Warning**: Deleted posts cannot be recovered!

### Post Status

| Status | Meaning |
|--------|---------|
| **Draft** (eye with line) | Only visible to you |
| **Published** (green eye) | Visible to everyone |

---

## Managing Portfolio Items

### Creating a Portfolio Item

1. From the admin dashboard, click the **Portfolio** tab
2. Click **Add Item**
3. Fill in the details:
   - **Title**: Project name
   - **URL Slug**: Auto-generated (can customize)
   - **Category**: Type of project
   - **Year**: When completed
   - **Project URL**: Link to live project (optional)
   - **Project Image**: Upload or provide URL
   - **Description**: Brief project description
4. Toggle **Published** when ready
5. Click **Save Item**

### Editing Portfolio Items

Same process as editing blog posts.

---

## Uploading Images

### Featured Images

When creating/editing a post or portfolio item:

1. Click **Choose File** or **Upload**
2. Select an image from your computer
3. Wait for upload to complete
4. The image URL will be filled in automatically

### Images in Blog Posts

To add images within your blog post content:

1. Click the **Insert Image** button in the editor
2. Upload or enter an image URL
3. Click **Insert Image**
4. The Markdown image code will be added to your post

### Supported Image Formats

- JPEG/JPG
- PNG
- GIF
- WebP

---

## Publishing Content

### Making Content Public

1. When editing, toggle the **Published** switch to ON (green)
2. Save your changes
3. The content is now visible to all visitors

### Unpublishing Content

1. Toggle the **Published** switch to OFF
2. Save your changes
3. Content becomes a draft (only visible to you)

---

## Troubleshooting

### I forgot my password

Currently, password reset requires access to the server. You have two options:

1. **If you have server access**: Update the admin credentials in the database or environment variables
2. **Contact the site administrator** if you don't have server access

> Note: Email-based password reset is not yet implemented.

### I can't log in

1. Double-check your username (it's case-sensitive)
2. Verify your password
3. Clear your browser cookies and try again
4. Make sure you're on the correct login page (`/admin/login`)

### My images won't upload

1. Check the file size (max 10MB recommended)
2. Ensure the file is a supported format (JPEG, PNG, GIF, WebP)
3. Check your internet connection
4. Try a different browser

### Content not showing on the site

1. Make sure the content is **Published** (green eye icon)
2. Clear your browser cache
3. Wait a moment for changes to propagate

### Session expired

Sessions last 7 days. If you're logged out unexpectedly:

1. Log in again
2. Check that cookies are enabled in your browser
3. Disable any browser extensions that might block cookies

---

## Need More Help?

- Check the [Technical Guide](technical-guide.md) for developer documentation
- Open an issue on GitHub for bugs or feature requests
- Review the [README](../README.md) for setup instructions
