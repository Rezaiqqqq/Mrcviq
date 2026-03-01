# Personal Profile Website

## Overview
Apple-inspired personal profile website with admin dashboard, built with React, Express, PostgreSQL.

## Features
- **Public Profile** (`/`): Banner, avatar with story ring animation, bio, social icons, news feed
- **Copyright footer**: "Designed by Mohammed Reza" - clicking it opens admin panel
- **Dark/Light Mode**: Toggle button with localStorage persistence, system preference detection
- **Animated Background**: Floating orbs with blur effects, different colors
- **Music Player**: Audio player with play/pause, progress bar, music visualizer bars
- **Visitor Counter**: Tracks unique visitors per session, displays count
- **Admin Login** (`/admin`): Password-protected (default: `admin123`)
- **Admin Dashboard** (`/admin/dashboard`): Sidebar navigation with 4 sections:
  - Profile: Edit name, bio, avatar, banner, story ring, verified badge, music
  - Social: Add/delete social accounts with platform icon picker
  - Posts: Create/edit/delete/pin news with image upload
  - Settings: Change admin password

## Tech Stack
- Frontend: React, TypeScript, TanStack Query, Wouter, Tailwind CSS, shadcn/ui, react-icons
- Backend: Express.js, multer (file upload for images + audio), TypeScript
- Database: PostgreSQL (Drizzle ORM)
- Design: Apple iOS-inspired, RTL, CSS animations, glassmorphism, dark mode

## Architecture
- `shared/schema.ts` - Database schema (profile, socialLinks, posts, adminCredentials, siteVisitors)
- `server/storage.ts` - DbStorage class (PostgreSQL)
- `server/routes.ts` - API routes with auth middleware
- `client/src/pages/Home.tsx` - Public profile page
- `client/src/pages/Admin.tsx` - Login page
- `client/src/pages/Dashboard.tsx` - Full admin dashboard
- `client/src/components/ThemeProvider.tsx` - Dark/light mode context

## API
- `GET/PATCH /api/profile` (includes musicUrl, musicTitle)
- `GET/POST/PATCH/DELETE /api/social-links/:id`
- `GET/POST/PATCH/DELETE /api/posts/:id`
- `POST /api/upload` (requires x-admin-password header, supports images + audio)
- `POST /api/admin/login`
- `POST /api/admin/change-password`
- `GET /api/visitors` - get visitor count
- `POST /api/visitors/increment` - increment visitor count
