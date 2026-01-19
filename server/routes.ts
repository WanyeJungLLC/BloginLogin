import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginHandler, 
  logoutHandler, 
  meHandler, 
  requireAuth,
  hashPassword,
  verifyPassword,
  generateSecureToken
} from "./auth";
import { insertAuthorPostSchema, insertAuthorPortfolioSchema, insertAuthorMediaSchema } from "@shared/schema";
import { z } from "zod";
import { isLocalStorageEnabled } from "./local-storage";
import { registerLocalUploadRoutes } from "./local-upload-routes";

let objectStorageService: any = null;

async function initializeStorageProvider() {
  if (!isLocalStorageEnabled()) {
    const { ObjectStorageService } = await import("./replit_integrations/object_storage");
    objectStorageService = new ObjectStorageService();
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Initialize storage provider (Replit or local)
  await initializeStorageProvider();
  
  // Register appropriate upload routes based on storage provider
  if (isLocalStorageEnabled()) {
    registerLocalUploadRoutes(app);
    console.log("Using local file storage for uploads");
  } else {
    const { registerObjectStorageRoutes } = await import("./replit_integrations/object_storage");
    registerObjectStorageRoutes(app);
    console.log("Using Replit Object Storage for uploads");
  }

  // Auth routes
  app.post("/api/auth/login", loginHandler);
  app.post("/api/auth/logout", logoutHandler);
  app.get("/api/auth/me", meHandler);

  // Password change (requires current password)
  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }
      
      const owner = await storage.getSiteOwner();
      if (!owner || owner.id !== req.session?.ownerId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const isValid = await verifyPassword(currentPassword, owner.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      const newHash = await hashPassword(newPassword);
      await storage.updateSiteOwner(owner.id, { passwordHash: newHash });
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Email/username change (requires password)
  app.post("/api/auth/change-credentials", requireAuth, async (req, res) => {
    try {
      const { password, newUsername, newEmail } = req.body;
      
      if (!password) {
        return res.status(400).json({ message: "Password is required to change credentials" });
      }
      
      const owner = await storage.getSiteOwner();
      if (!owner || owner.id !== req.session?.ownerId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const isValid = await verifyPassword(password, owner.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Password is incorrect" });
      }
      
      const updates: Record<string, string> = {};
      if (newUsername && newUsername !== owner.username) {
        updates.username = newUsername;
      }
      if (newEmail && newEmail !== owner.recoveryEmail) {
        updates.recoveryEmail = newEmail;
      }
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No changes provided" });
      }
      
      await storage.updateSiteOwner(owner.id, updates);
      
      res.json({ message: "Credentials updated successfully" });
    } catch (error) {
      console.error("Credentials change error:", error);
      res.status(500).json({ message: "Failed to change credentials" });
    }
  });

  // Password recovery - request reset token
  app.post("/api/auth/request-password-reset", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const owner = await storage.getSiteOwner();
      
      // Always return success to prevent email enumeration
      if (!owner || owner.recoveryEmail !== email) {
        return res.json({ message: "If that email exists, a reset link has been sent" });
      }
      
      // Invalidate existing tokens
      await storage.invalidateRecoveryTokensForOwner(owner.id, "password_reset");
      
      // Create new token (valid for 1 hour)
      const token = generateSecureToken();
      await storage.createRecoveryToken({
        ownerId: owner.id,
        token,
        tokenType: "password_reset",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
      
      // TODO: Send email with token (will be implemented when email service is configured)
      console.log(`Password reset token for ${email}: ${token}`);
      
      res.json({ message: "If that email exists, a reset link has been sent" });
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // Password recovery - verify token and reset password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }
      
      const recoveryToken = await storage.getValidRecoveryToken(token);
      
      if (!recoveryToken || recoveryToken.tokenType !== "password_reset") {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      
      const newHash = await hashPassword(newPassword);
      await storage.updateSiteOwner(recoveryToken.ownerId, { passwordHash: newHash });
      await storage.markRecoveryTokenUsed(recoveryToken.id);
      
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Posts routes (public read, authenticated write)
  app.get("/api/posts", async (req, res) => {
    try {
      const publishedOnly = req.query.published === "true";
      const posts = await storage.getPosts(publishedOnly);
      res.json(posts);
    } catch (error) {
      console.error("Get posts error:", error);
      res.status(500).json({ message: "Failed to get posts" });
    }
  });

  app.get("/api/posts/:idOrSlug", async (req, res) => {
    try {
      const { idOrSlug } = req.params;
      let post = await storage.getPostById(idOrSlug);
      if (!post) {
        post = await storage.getPostBySlug(idOrSlug);
      }
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Get post error:", error);
      res.status(500).json({ message: "Failed to get post" });
    }
  });

  app.post("/api/posts", requireAuth, async (req, res) => {
    try {
      const data = { ...req.body };
      if (data.publishedAt && typeof data.publishedAt === 'string') {
        data.publishedAt = new Date(data.publishedAt);
      }
      const parsed = insertAuthorPostSchema.safeParse(data);
      if (!parsed.success) {
        console.error("Validation errors:", parsed.error.errors);
        return res.status(400).json({ message: "Invalid post data", errors: parsed.error.errors });
      }
      const post = await storage.createPost(parsed.data);
      res.status(201).json(post);
    } catch (error) {
      console.error("Create post error:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.put("/api/posts/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getPostById(id);
      if (!existing) {
        return res.status(404).json({ message: "Post not found" });
      }
      const data = { ...req.body };
      if (data.publishedAt && typeof data.publishedAt === 'string') {
        data.publishedAt = new Date(data.publishedAt);
      }
      const updated = await storage.updatePost(id, data);
      res.json(updated);
    } catch (error) {
      console.error("Update post error:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getPostById(id);
      if (!existing) {
        return res.status(404).json({ message: "Post not found" });
      }
      await storage.deletePost(id);
      res.json({ message: "Post deleted" });
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Portfolio routes (public read, authenticated write)
  app.get("/api/portfolio", async (req, res) => {
    try {
      const publishedOnly = req.query.published === "true";
      const items = await storage.getPortfolioItems(publishedOnly);
      res.json(items);
    } catch (error) {
      console.error("Get portfolio error:", error);
      res.status(500).json({ message: "Failed to get portfolio items" });
    }
  });

  app.get("/api/portfolio/:idOrSlug", async (req, res) => {
    try {
      const { idOrSlug } = req.params;
      let item = await storage.getPortfolioItemById(idOrSlug);
      if (!item) {
        item = await storage.getPortfolioItemBySlug(idOrSlug);
      }
      if (!item) {
        return res.status(404).json({ message: "Portfolio item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Get portfolio item error:", error);
      res.status(500).json({ message: "Failed to get portfolio item" });
    }
  });

  app.post("/api/portfolio", requireAuth, async (req, res) => {
    try {
      const parsed = insertAuthorPortfolioSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid portfolio data", errors: parsed.error.errors });
      }
      const item = await storage.createPortfolioItem(parsed.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Create portfolio error:", error);
      res.status(500).json({ message: "Failed to create portfolio item" });
    }
  });

  app.put("/api/portfolio/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getPortfolioItemById(id);
      if (!existing) {
        return res.status(404).json({ message: "Portfolio item not found" });
      }
      const updated = await storage.updatePortfolioItem(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Update portfolio error:", error);
      res.status(500).json({ message: "Failed to update portfolio item" });
    }
  });

  app.delete("/api/portfolio/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getPortfolioItemById(id);
      if (!existing) {
        return res.status(404).json({ message: "Portfolio item not found" });
      }
      await storage.deletePortfolioItem(id);
      res.json({ message: "Portfolio item deleted" });
    } catch (error) {
      console.error("Delete portfolio error:", error);
      res.status(500).json({ message: "Failed to delete portfolio item" });
    }
  });

  // Media routes (authenticated only)
  app.get("/api/media", requireAuth, async (req, res) => {
    try {
      const bucket = req.query.bucket as string | undefined;
      const items = await storage.getMediaItems(bucket);
      res.json(items);
    } catch (error) {
      console.error("Get media error:", error);
      res.status(500).json({ message: "Failed to get media items" });
    }
  });

  // Protected upload route with bucket organization (Replit Object Storage only)
  // For local storage, use /api/local-upload instead
  // Bucket options: 'blog-images', 'portfolio-images', 'profile-uploads'
  app.post("/api/media/upload-url", requireAuth, async (req, res) => {
    try {
      // Return info about local upload endpoint when using local storage
      if (isLocalStorageEnabled()) {
        return res.json({
          useLocalUpload: true,
          localUploadEndpoint: "/api/local-upload",
          message: "Use POST /api/local-upload with multipart/form-data for local file uploads"
        });
      }
      
      const { name, size, contentType, bucket = 'blog-images' } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "File name is required" });
      }
      
      const validBuckets = ['blog-images', 'portfolio-images', 'profile-uploads'];
      if (!validBuckets.includes(bucket)) {
        return res.status(400).json({ 
          message: `Invalid bucket. Must be one of: ${validBuckets.join(', ')}` 
        });
      }
      
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      
      res.json({
        uploadURL,
        objectPath,
        bucket,
        metadata: { name, size, contentType },
      });
    } catch (error) {
      console.error("Upload URL error:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  // Register uploaded media after successful upload
  app.post("/api/media/register", requireAuth, async (req, res) => {
    try {
      const { objectPath, fileName, originalName, mimeType, fileSize, bucket, altText } = req.body;
      
      if (!objectPath || !fileName || !originalName || !mimeType || !bucket) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const publicUrl = objectPath;
      
      const media = await storage.createMedia({
        fileName,
        originalName,
        mimeType,
        fileSize: fileSize || 0,
        storageKey: objectPath,
        publicUrl,
        bucket,
        altText,
      });
      
      res.status(201).json(media);
    } catch (error) {
      console.error("Register media error:", error);
      res.status(500).json({ message: "Failed to register media" });
    }
  });

  app.delete("/api/media/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getMediaById(id);
      if (!existing) {
        return res.status(404).json({ message: "Media item not found" });
      }
      // TODO: Delete from object storage as well
      await storage.deleteMedia(id);
      res.json({ message: "Media deleted" });
    } catch (error) {
      console.error("Delete media error:", error);
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  return httpServer;
}
