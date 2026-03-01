import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { storage } from "./storage";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

async function seedData() {
  try {
    const existingProfile = await storage.getProfile();
    if (!existingProfile) {
      await storage.updateProfile({
        name: "محمد العمري",
        username: "@m_alomari",
        bio: "مطور تطبيقات ومصمم جرافيك، أعشق التقنية وأسعى دائمًا لصنع تجارب رقمية مميزة. بني موقعك الشخصي بأسلوب احترافي.",
        bannerUrl: "/images/banner.png",
        avatarUrl: "/images/avatar-default.png",
        hasStory: true,
        location: "الرياض، المملكة العربية السعودية",
        website: "https://example.com",
        isVerified: true,
      });
    }

    const existingLinks = await storage.getSocialLinks();
    if (existingLinks.length === 0) {
      await storage.createSocialLink({ platform: "instagram", url: "https://instagram.com", displayName: "@m_alomari", icon: "instagram", color: "#E1306C", sortOrder: 1 });
      await storage.createSocialLink({ platform: "x", url: "https://x.com", displayName: "@m_alomari", icon: "x", color: "#000000", sortOrder: 2 });
      await storage.createSocialLink({ platform: "tiktok", url: "https://tiktok.com", displayName: "@m_alomari", icon: "tiktok", color: "#010101", sortOrder: 3 });
      await storage.createSocialLink({ platform: "snapchat", url: "https://snapchat.com", displayName: "m_alomari", icon: "snapchat", color: "#FFFC00", sortOrder: 4 });
    }

    const existingPosts = await storage.getPosts();
    if (existingPosts.length === 0) {
      await storage.createPost({
        title: "مرحبًا بكم في موقعي الجديد",
        content: "يسعدني إطلاق موقعي الشخصي الجديد، سأشارككم هنا آخر أخباري ومشاريعي وتجاربي في عالم التقنية والتصميم. ابقوا على اطلاع!",
        imageUrl: null,
        isPinned: true,
      });
      await storage.createPost({
        title: "مشروع جديد قيد التطوير",
        content: "أعمل حاليًا على مشروع تقني مثير سيرى النور قريبًا. المشروع يجمع بين الذكاء الاصطناعي وتجربة المستخدم الحديثة. تابعوا حساباتي لمزيد من التفاصيل.",
        imageUrl: null,
        isPinned: false,
      });
    }

    log("Seed data checked/applied", "seed");
  } catch (err) {
    log(`Seed error: ${err}`, "seed");
  }
}

(async () => {
  await registerRoutes(httpServer, app);
  await seedData();

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
