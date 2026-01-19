import type { Express } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { requireAuth } from "./auth";
import { storage } from "./storage";
import { ensureUploadsDir, UPLOADS_DIR, getPublicUrl } from "./local-storage";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const bucket = (req.body.bucket as string) || "blog-images";
      const bucketPath = path.join(UPLOADS_DIR, bucket);
      ensureUploadsDir();
      cb(null, bucketPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName = `${randomUUID()}${ext}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`));
    }
  },
});

export function registerLocalUploadRoutes(app: Express): void {
  ensureUploadsDir();

  app.post(
    "/api/local-upload",
    requireAuth,
    (req, res, next) => {
      upload.single("file")(req, res, (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
              return res.status(400).json({ message: "File too large. Maximum size is 10MB." });
            }
            return res.status(400).json({ message: err.message });
          }
          return res.status(400).json({ message: err.message });
        }
        next();
      });
    },
    async (req, res) => {
      try {
        const file = req.file;
        if (!file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const bucket = (req.body.bucket as string) || "blog-images";
        const publicUrl = getPublicUrl(file.path);

        const media = await storage.createMedia({
          fileName: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          storageKey: file.path,
          publicUrl,
          bucket,
          altText: req.body.altText || null,
        });

        res.status(201).json({
          ...media,
          url: publicUrl,
        });
      } catch (error) {
        console.error("Local upload error:", error);
        res.status(500).json({ message: "Failed to upload file" });
      }
    }
  );

  app.delete("/api/local-upload/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const mediaItem = await storage.getMediaById(id);
      
      if (!mediaItem) {
        return res.status(404).json({ message: "Media not found" });
      }

      if (mediaItem.storageKey && fs.existsSync(mediaItem.storageKey)) {
        fs.unlinkSync(mediaItem.storageKey);
      }

      await storage.deleteMedia(id);
      res.json({ message: "File deleted" });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });
}
