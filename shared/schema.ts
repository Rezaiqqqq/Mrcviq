import { pgTable, text, varchar, boolean, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const profile = pgTable("profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("اسمك هنا"),
  username: text("username").notNull().default("@username"),
  bio: text("bio").notNull().default(""),
  bannerUrl: text("banner_url").notNull().default("/images/banner.png"),
  avatarUrl: text("avatar_url").notNull().default("/images/avatar-default.png"),
  hasStory: boolean("has_story").notNull().default(false),
  location: text("location").notNull().default(""),
  website: text("website").notNull().default(""),
  isVerified: boolean("is_verified").notNull().default(false),
  musicUrl: text("music_url").notNull().default(""),
  musicTitle: text("music_title").notNull().default(""),
});

export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  displayName: text("display_name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull().default("#6366f1"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adminCredentials = pgTable("admin_credentials", {
  id: serial("id").primaryKey(),
  password: text("password").notNull().default("admin123"),
});

export const siteVisitors = pgTable("site_visitors", {
  id: serial("id").primaryKey(),
  count: integer("count").notNull().default(0),
});

export const insertProfileSchema = createInsertSchema(profile).omit({ id: true });
export const insertSocialLinkSchema = createInsertSchema(socialLinks).omit({ id: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true });

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profile.$inferSelect;

export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type SocialLink = typeof socialLinks.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
