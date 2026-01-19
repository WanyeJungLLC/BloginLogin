import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const siteOwner = pgTable("site_owner", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  recoveryEmail: text("recovery_email").notNull(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recoveryTokens = pgTable("recovery_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => siteOwner.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  tokenType: text("token_type").notNull(), // 'password_reset' | 'email_change'
  newEmail: text("new_email"), // only for email change tokens
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const authorPosts = pgTable("author_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  contentFormat: text("content_format").default("markdown").notNull(), // 'markdown' | 'html'
  category: text("category"),
  featuredImageUrl: text("featured_image_url"),
  isPublished: boolean("is_published").default(false).notNull(),
  readTimeMinutes: integer("read_time_minutes").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
});

export const authorPortfolio = pgTable("author_portfolio", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  category: text("category"),
  year: text("year"),
  imageUrl: text("image_url"),
  projectUrl: text("project_url"),
  isPublished: boolean("is_published").default(false).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const authorMedia = pgTable("author_media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  storageKey: text("storage_key").notNull().unique(), // path in object storage
  publicUrl: text("public_url").notNull(),
  bucket: text("bucket").notNull(), // 'blog-images' | 'portfolio-images' | 'profile-uploads'
  altText: text("alt_text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey(),
  ownerId: varchar("owner_id").notNull().references(() => siteOwner.id, { onDelete: "cascade" }),
  username: text("username").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteOwnerRelations = relations(siteOwner, ({ many }) => ({
  recoveryTokens: many(recoveryTokens),
}));

export const recoveryTokensRelations = relations(recoveryTokens, ({ one }) => ({
  owner: one(siteOwner, {
    fields: [recoveryTokens.ownerId],
    references: [siteOwner.id],
  }),
}));

export const insertSiteOwnerSchema = createInsertSchema(siteOwner).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRecoveryTokenSchema = createInsertSchema(recoveryTokens).omit({
  id: true,
  createdAt: true,
});

export const insertAuthorPostSchema = createInsertSchema(authorPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuthorPortfolioSchema = createInsertSchema(authorPortfolio).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuthorMediaSchema = createInsertSchema(authorMedia).omit({
  id: true,
  createdAt: true,
});

export type SiteOwner = typeof siteOwner.$inferSelect;
export type InsertSiteOwner = z.infer<typeof insertSiteOwnerSchema>;

export type RecoveryToken = typeof recoveryTokens.$inferSelect;
export type InsertRecoveryToken = z.infer<typeof insertRecoveryTokenSchema>;

export type AuthorPost = typeof authorPosts.$inferSelect;
export type InsertAuthorPost = z.infer<typeof insertAuthorPostSchema>;

export type AuthorPortfolio = typeof authorPortfolio.$inferSelect;
export type InsertAuthorPortfolio = z.infer<typeof insertAuthorPortfolioSchema>;

export type AuthorMedia = typeof authorMedia.$inferSelect;
export type InsertAuthorMedia = z.infer<typeof insertAuthorMediaSchema>;
