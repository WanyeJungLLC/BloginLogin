import type { AuthorPost, AuthorPortfolio, AuthorMedia } from "@shared/schema";

const API_BASE = "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function getPosts(publishedOnly = true): Promise<AuthorPost[]> {
  const url = publishedOnly ? `${API_BASE}/posts?published=true` : `${API_BASE}/posts`;
  const response = await fetch(url);
  return handleResponse<AuthorPost[]>(response);
}

export async function getPost(idOrSlug: string): Promise<AuthorPost> {
  const response = await fetch(`${API_BASE}/posts/${idOrSlug}`);
  return handleResponse<AuthorPost>(response);
}

export async function createPost(post: Partial<AuthorPost>): Promise<AuthorPost> {
  const response = await fetch(`${API_BASE}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(post),
  });
  return handleResponse<AuthorPost>(response);
}

export async function updatePost(id: string, post: Partial<AuthorPost>): Promise<AuthorPost> {
  const response = await fetch(`${API_BASE}/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(post),
  });
  return handleResponse<AuthorPost>(response);
}

export async function deletePost(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/posts/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  await handleResponse<{ message: string }>(response);
}

export async function getPortfolioItems(publishedOnly = true): Promise<AuthorPortfolio[]> {
  const url = publishedOnly ? `${API_BASE}/portfolio?published=true` : `${API_BASE}/portfolio`;
  const response = await fetch(url);
  return handleResponse<AuthorPortfolio[]>(response);
}

export async function getPortfolioItem(idOrSlug: string): Promise<AuthorPortfolio> {
  const response = await fetch(`${API_BASE}/portfolio/${idOrSlug}`);
  return handleResponse<AuthorPortfolio>(response);
}

export async function createPortfolioItem(item: Partial<AuthorPortfolio>): Promise<AuthorPortfolio> {
  const response = await fetch(`${API_BASE}/portfolio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(item),
  });
  return handleResponse<AuthorPortfolio>(response);
}

export async function updatePortfolioItem(id: string, item: Partial<AuthorPortfolio>): Promise<AuthorPortfolio> {
  const response = await fetch(`${API_BASE}/portfolio/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(item),
  });
  return handleResponse<AuthorPortfolio>(response);
}

export async function deletePortfolioItem(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/portfolio/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  await handleResponse<{ message: string }>(response);
}

export async function getMediaItems(bucket?: string): Promise<AuthorMedia[]> {
  const url = bucket ? `${API_BASE}/media?bucket=${bucket}` : `${API_BASE}/media`;
  const response = await fetch(url, { credentials: "include" });
  return handleResponse<AuthorMedia[]>(response);
}

export async function deleteMedia(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/media/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  await handleResponse<{ message: string }>(response);
}

export type MediaBucket = 'blog-images' | 'portfolio-images' | 'profile-uploads';

export async function requestUploadUrl(
  file: { name: string; size: number; type: string },
  bucket: MediaBucket = 'blog-images'
): Promise<{ uploadURL: string; objectPath: string; bucket: string }> {
  const response = await fetch(`${API_BASE}/media/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name: file.name,
      size: file.size,
      contentType: file.type,
      bucket,
    }),
  });
  return handleResponse<{ uploadURL: string; objectPath: string; bucket: string }>(response);
}

export async function registerMedia(data: {
  objectPath: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  bucket: string;
  altText?: string;
}): Promise<AuthorMedia> {
  const response = await fetch(`${API_BASE}/media/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<AuthorMedia>(response);
}

export async function uploadImage(
  file: File,
  bucket: MediaBucket = 'blog-images',
  altText?: string
): Promise<AuthorMedia> {
  const { uploadURL, objectPath } = await requestUploadUrl(
    { name: file.name, size: file.size, type: file.type },
    bucket
  );

  const uploadResponse = await fetch(uploadURL, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload file to storage");
  }

  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  return registerMedia({
    objectPath,
    fileName,
    originalName: file.name,
    mimeType: file.type,
    fileSize: file.size,
    bucket,
    altText,
  });
}
