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

### Changing Your Username and Email

1. Log in to the admin dashboard
2. Click the **Settings** icon (gear) in the top navigation
3. In the **Account Credentials** section:
   - Enter your new **Username**
   - Enter your new **Recovery Email** (used for password reset)
   - Enter your **Current Password** to confirm
4. Click **Update Credentials**

### Changing Your Password

1. Log in to the admin dashboard
2. Click the **Settings** icon in the top navigation
3. In the **Change Password** section:
   - Enter your **Current Password**
   - Enter your **New Password** (minimum 8 characters)
   - **Confirm** your new password
4. Click **Update Password**

### Password Requirements

- Minimum 8 characters
- Mix of letters, numbers, and symbols recommended
- Don't reuse passwords from other sites

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
