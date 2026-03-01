import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertSocialLinkSchema, insertPostSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Profile
  app.get("/api/profile", async (_req, res) => {
    const data = await storage.getProfile();
    res.json(data || {});
  });

  app.patch("/api/profile", async (req, res) => {
    try {
      const data = req.body;
      const updated = await storage.updateProfile(data);
      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Social Links
  app.get("/api/social-links", async (_req, res) => {
    const links = await storage.getSocialLinks();
    res.json(links);
  });

  app.post("/api/social-links", async (req, res) => {
    try {
      const data = insertSocialLinkSchema.parse(req.body);
      const link = await storage.createSocialLink(data);
      res.json(link);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.patch("/api/social-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const link = await storage.updateSocialLink(id, req.body);
      res.json(link);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/social-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSocialLink(id);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Posts
  app.get("/api/posts", async (_req, res) => {
    const data = await storage.getPosts();
    res.json(data.reverse());
  });

  app.get("/api/posts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const post = await storage.getPost(id);
    if (!post) return res.status(404).json({ error: "Not found" });
    res.json(post);
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const data = insertPostSchema.parse(req.body);
      const post = await storage.createPost(data);
      res.json(post);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.patch("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.updatePost(id, req.body);
      res.json(post);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePost(id);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Admin Auth
  app.post("/api/admin/login", async (req, res) => {
    const { password } = req.body;
    const ok = await storage.verifyAdmin(password);
    if (ok) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "كلمة مرور خاطئة" });
    }
  });

  app.post("/api/admin/change-password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const ok = await storage.verifyAdmin(currentPassword);
      if (!ok) return res.status(401).json({ error: "كلمة المرور الحالية خاطئة" });
      await storage.updateAdminPassword(newPassword);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  return httpServer;
}
