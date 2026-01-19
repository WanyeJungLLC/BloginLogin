import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

export function ensureUploadsDir(): void {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  const buckets = ["blog-images", "portfolio-images", "profile-uploads"];
  for (const bucket of buckets) {
    const bucketPath = path.join(UPLOADS_DIR, bucket);
    if (!fs.existsSync(bucketPath)) {
      fs.mkdirSync(bucketPath, { recursive: true });
    }
  }
}

export function getUploadPath(bucket: string, filename: string): string {
  const ext = path.extname(filename);
  const uniqueName = `${randomUUID()}${ext}`;
  return path.join(UPLOADS_DIR, bucket, uniqueName);
}

export function getPublicUrl(filePath: string): string {
  const relativePath = path.relative(UPLOADS_DIR, filePath);
  return `/uploads/${relativePath.replace(/\\/g, "/")}`;
}

export function isLocalStorageEnabled(): boolean {
  return process.env.STORAGE_PROVIDER === "local" || !process.env.REPL_ID;
}

export { UPLOADS_DIR };
