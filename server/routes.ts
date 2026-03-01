import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertSocialLinkSchema, insertPostSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "client", "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const extOk = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(path.extname(file.originalname));
    const mimeOk = ALLOWED_MIMES.includes(file.mimetype);
    if (extOk && mimeOk) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

async function requireAdmin(req: any, res: any, next: any) {
  const authHeader = req.headers["x-admin-password"];
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
  const ok = await storage.verifyAdmin(authHeader as string);
  if (!ok) return res.status(401).json({ error: "Unauthorized" });
  next();
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.post("/api/upload", requireAdmin, upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  });

  app.get("/api/profile", async (_req, res) => {
    const data = await storage.getProfile();
    res.json(data || {});
  });

  app.patch("/api/profile", async (req, res) => {
    try {
      const updated = await storage.updateProfile(req.body);
      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/social-links", async (_req, res) => {
    res.json(await storage.getSocialLinks());
  });

  app.post("/api/social-links", async (req, res) => {
    try {
      const data = insertSocialLinkSchema.parse(req.body);
      res.json(await storage.createSocialLink(data));
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.patch("/api/social-links/:id", async (req, res) => {
    try {
      res.json(await storage.updateSocialLink(parseInt(req.params.id), req.body));
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/social-links/:id", async (req, res) => {
    try {
      await storage.deleteSocialLink(parseInt(req.params.id));
      res.json({ ok: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/posts", async (_req, res) => {
    const data = await storage.getPosts();
    res.json(data.reverse());
  });

  app.get("/api/posts/:id", async (req, res) => {
    const post = await storage.getPost(parseInt(req.params.id));
    if (!post) return res.status(404).json({ error: "Not found" });
    res.json(post);
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const data = insertPostSchema.parse(req.body);
      res.json(await storage.createPost(data));
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.patch("/api/posts/:id", async (req, res) => {
    try {
      res.json(await storage.updatePost(parseInt(req.params.id), req.body));
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      await storage.deletePost(parseInt(req.params.id));
      res.json({ ok: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    const ok = await storage.verifyAdmin(req.body.password);
    if (ok) res.json({ success: true });
    else res.status(401).json({ error: "Wrong password" });
  });

  app.post("/api/admin/change-password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const ok = await storage.verifyAdmin(currentPassword);
      if (!ok) return res.status(401).json({ error: "Wrong current password" });
      await storage.updateAdminPassword(newPassword);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  return httpServer;
}
