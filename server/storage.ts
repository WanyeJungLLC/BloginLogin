import { 
  siteOwner, 
  recoveryTokens, 
  authorPosts, 
  authorPortfolio, 
  authorMedia,
  type SiteOwner, 
  type InsertSiteOwner,
  type RecoveryToken,
  type InsertRecoveryToken,
  type AuthorPost,
  type InsertAuthorPost,
  type AuthorPortfolio,
  type InsertAuthorPortfolio,
  type AuthorMedia,
  type InsertAuthorMedia
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gt, isNull } from "drizzle-orm";

export interface IStorage {
  getSiteOwner(): Promise<SiteOwner | undefined>;
  getSiteOwnerByUsername(username: string): Promise<SiteOwner | undefined>;
  createSiteOwner(owner: InsertSiteOwner): Promise<SiteOwner>;
  updateSiteOwner(id: string, updates: Partial<InsertSiteOwner>): Promise<SiteOwner | undefined>;

  createRecoveryToken(token: InsertRecoveryToken): Promise<RecoveryToken>;
  getValidRecoveryToken(token: string): Promise<RecoveryToken | undefined>;
  markRecoveryTokenUsed(id: string): Promise<void>;
  invalidateRecoveryTokensForOwner(ownerId: string, tokenType: string): Promise<void>;

  getPosts(publishedOnly?: boolean): Promise<AuthorPost[]>;
  getPostById(id: string): Promise<AuthorPost | undefined>;
  getPostBySlug(slug: string): Promise<AuthorPost | undefined>;
  createPost(post: InsertAuthorPost): Promise<AuthorPost>;
  updatePost(id: string, updates: Partial<InsertAuthorPost>): Promise<AuthorPost | undefined>;
  deletePost(id: string): Promise<void>;

  getPortfolioItems(publishedOnly?: boolean): Promise<AuthorPortfolio[]>;
  getPortfolioItemById(id: string): Promise<AuthorPortfolio | undefined>;
  getPortfolioItemBySlug(slug: string): Promise<AuthorPortfolio | undefined>;
  createPortfolioItem(item: InsertAuthorPortfolio): Promise<AuthorPortfolio>;
  updatePortfolioItem(id: string, updates: Partial<InsertAuthorPortfolio>): Promise<AuthorPortfolio | undefined>;
  deletePortfolioItem(id: string): Promise<void>;

  getMediaItems(bucket?: string): Promise<AuthorMedia[]>;
  getMediaById(id: string): Promise<AuthorMedia | undefined>;
  getMediaByStorageKey(storageKey: string): Promise<AuthorMedia | undefined>;
  createMedia(media: InsertAuthorMedia): Promise<AuthorMedia>;
  deleteMedia(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getSiteOwner(): Promise<SiteOwner | undefined> {
    const [owner] = await db.select().from(siteOwner).limit(1);
    return owner || undefined;
  }

  async getSiteOwnerByUsername(username: string): Promise<SiteOwner | undefined> {
    const [owner] = await db.select().from(siteOwner).where(eq(siteOwner.username, username));
    return owner || undefined;
  }

  async createSiteOwner(owner: InsertSiteOwner): Promise<SiteOwner> {
    const [created] = await db.insert(siteOwner).values(owner).returning();
    return created;
  }

  async updateSiteOwner(id: string, updates: Partial<InsertSiteOwner>): Promise<SiteOwner | undefined> {
    const [updated] = await db
      .update(siteOwner)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(siteOwner.id, id))
      .returning();
    return updated || undefined;
  }

  async createRecoveryToken(token: InsertRecoveryToken): Promise<RecoveryToken> {
    const [created] = await db.insert(recoveryTokens).values(token).returning();
    return created;
  }

  async getValidRecoveryToken(token: string): Promise<RecoveryToken | undefined> {
    const [found] = await db
      .select()
      .from(recoveryTokens)
      .where(
        and(
          eq(recoveryTokens.token, token),
          gt(recoveryTokens.expiresAt, new Date()),
          isNull(recoveryTokens.usedAt)
        )
      );
    return found || undefined;
  }

  async markRecoveryTokenUsed(id: string): Promise<void> {
    await db.update(recoveryTokens).set({ usedAt: new Date() }).where(eq(recoveryTokens.id, id));
  }

  async invalidateRecoveryTokensForOwner(ownerId: string, tokenType: string): Promise<void> {
    await db
      .update(recoveryTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(recoveryTokens.ownerId, ownerId),
          eq(recoveryTokens.tokenType, tokenType),
          isNull(recoveryTokens.usedAt)
        )
      );
  }

  async getPosts(publishedOnly = false): Promise<AuthorPost[]> {
    if (publishedOnly) {
      return db.select().from(authorPosts).where(eq(authorPosts.isPublished, true)).orderBy(desc(authorPosts.createdAt));
    }
    return db.select().from(authorPosts).orderBy(desc(authorPosts.createdAt));
  }

  async getPostById(id: string): Promise<AuthorPost | undefined> {
    const [post] = await db.select().from(authorPosts).where(eq(authorPosts.id, id));
    return post || undefined;
  }

  async getPostBySlug(slug: string): Promise<AuthorPost | undefined> {
    const [post] = await db.select().from(authorPosts).where(eq(authorPosts.slug, slug));
    return post || undefined;
  }

  async createPost(post: InsertAuthorPost): Promise<AuthorPost> {
    const [created] = await db.insert(authorPosts).values(post).returning();
    return created;
  }

  async updatePost(id: string, updates: Partial<InsertAuthorPost>): Promise<AuthorPost | undefined> {
    const [updated] = await db
      .update(authorPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(authorPosts.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(authorPosts).where(eq(authorPosts.id, id));
  }

  async getPortfolioItems(publishedOnly = false): Promise<AuthorPortfolio[]> {
    if (publishedOnly) {
      return db.select().from(authorPortfolio).where(eq(authorPortfolio.isPublished, true)).orderBy(authorPortfolio.sortOrder);
    }
    return db.select().from(authorPortfolio).orderBy(authorPortfolio.sortOrder);
  }

  async getPortfolioItemById(id: string): Promise<AuthorPortfolio | undefined> {
    const [item] = await db.select().from(authorPortfolio).where(eq(authorPortfolio.id, id));
    return item || undefined;
  }

  async getPortfolioItemBySlug(slug: string): Promise<AuthorPortfolio | undefined> {
    const [item] = await db.select().from(authorPortfolio).where(eq(authorPortfolio.slug, slug));
    return item || undefined;
  }

  async createPortfolioItem(item: InsertAuthorPortfolio): Promise<AuthorPortfolio> {
    const [created] = await db.insert(authorPortfolio).values(item).returning();
    return created;
  }

  async updatePortfolioItem(id: string, updates: Partial<InsertAuthorPortfolio>): Promise<AuthorPortfolio | undefined> {
    const [updated] = await db
      .update(authorPortfolio)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(authorPortfolio.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePortfolioItem(id: string): Promise<void> {
    await db.delete(authorPortfolio).where(eq(authorPortfolio.id, id));
  }

  async getMediaItems(bucket?: string): Promise<AuthorMedia[]> {
    if (bucket) {
      return db.select().from(authorMedia).where(eq(authorMedia.bucket, bucket)).orderBy(desc(authorMedia.createdAt));
    }
    return db.select().from(authorMedia).orderBy(desc(authorMedia.createdAt));
  }

  async getMediaById(id: string): Promise<AuthorMedia | undefined> {
    const [media] = await db.select().from(authorMedia).where(eq(authorMedia.id, id));
    return media || undefined;
  }

  async getMediaByStorageKey(storageKey: string): Promise<AuthorMedia | undefined> {
    const [media] = await db.select().from(authorMedia).where(eq(authorMedia.storageKey, storageKey));
    return media || undefined;
  }

  async createMedia(media: InsertAuthorMedia): Promise<AuthorMedia> {
    const [created] = await db.insert(authorMedia).values(media).returning();
    return created;
  }

  async deleteMedia(id: string): Promise<void> {
    await db.delete(authorMedia).where(eq(authorMedia.id, id));
  }
}

export const storage = new DatabaseStorage();
