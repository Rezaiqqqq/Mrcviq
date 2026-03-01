import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import pg from "pg";
import {
  profile, socialLinks, posts, adminCredentials,
  type Profile, type InsertProfile,
  type SocialLink, type InsertSocialLink,
  type Post, type InsertPost,
} from "@shared/schema";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);

export interface IStorage {
  getProfile(): Promise<Profile | undefined>;
  updateProfile(data: Partial<InsertProfile>): Promise<Profile>;

  getSocialLinks(): Promise<SocialLink[]>;
  createSocialLink(data: InsertSocialLink): Promise<SocialLink>;
  updateSocialLink(id: number, data: Partial<InsertSocialLink>): Promise<SocialLink>;
  deleteSocialLink(id: number): Promise<void>;

  getPosts(): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(data: InsertPost): Promise<Post>;
  updatePost(id: number, data: Partial<InsertPost>): Promise<Post>;
  deletePost(id: number): Promise<void>;

  verifyAdmin(password: string): Promise<boolean>;
  updateAdminPassword(password: string): Promise<void>;
}

export class DbStorage implements IStorage {
  async getProfile(): Promise<Profile | undefined> {
    const rows = await db.select().from(profile).limit(1);
    return rows[0];
  }

  async updateProfile(data: Partial<InsertProfile>): Promise<Profile> {
    const existing = await this.getProfile();
    if (!existing) {
      const inserted = await db.insert(profile).values(data as InsertProfile).returning();
      return inserted[0];
    }
    const updated = await db.update(profile).set(data).where(eq(profile.id, existing.id)).returning();
    return updated[0];
  }

  async getSocialLinks(): Promise<SocialLink[]> {
    return db.select().from(socialLinks).orderBy(socialLinks.sortOrder);
  }

  async createSocialLink(data: InsertSocialLink): Promise<SocialLink> {
    const inserted = await db.insert(socialLinks).values(data).returning();
    return inserted[0];
  }

  async updateSocialLink(id: number, data: Partial<InsertSocialLink>): Promise<SocialLink> {
    const updated = await db.update(socialLinks).set(data).where(eq(socialLinks.id, id)).returning();
    return updated[0];
  }

  async deleteSocialLink(id: number): Promise<void> {
    await db.delete(socialLinks).where(eq(socialLinks.id, id));
  }

  async getPosts(): Promise<Post[]> {
    return db.select().from(posts).orderBy(posts.createdAt);
  }

  async getPost(id: number): Promise<Post | undefined> {
    const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return rows[0];
  }

  async createPost(data: InsertPost): Promise<Post> {
    const inserted = await db.insert(posts).values(data).returning();
    return inserted[0];
  }

  async updatePost(id: number, data: Partial<InsertPost>): Promise<Post> {
    const updated = await db.update(posts).set(data).where(eq(posts.id, id)).returning();
    return updated[0];
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async verifyAdmin(password: string): Promise<boolean> {
    const rows = await db.select().from(adminCredentials).limit(1);
    if (!rows[0]) return password === "admin123";
    return rows[0].password === password;
  }

  async updateAdminPassword(password: string): Promise<void> {
    const rows = await db.select().from(adminCredentials).limit(1);
    if (!rows[0]) {
      await db.insert(adminCredentials).values({ password });
    } else {
      await db.update(adminCredentials).set({ password }).where(eq(adminCredentials.id, rows[0].id));
    }
  }
}

export const storage = new DbStorage();
