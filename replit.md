# Personal Profile Website

## Overview
Apple-inspired personal profile website with admin dashboard, built with React, Express, PostgreSQL.

## Features
- **Public Profile** (`/`): Banner, avatar with story ring animation, bio, social icons, news feed. No visible admin link.
- **Admin Login** (`/admin`): Password-protected (default: `admin123`).
- **Admin Dashboard** (`/admin/dashboard`): Sidebar navigation with 4 sections:
  - Profile: Edit name, bio, avatar, banner (upload from device), story ring, verified badge
  - Social: Add/delete social accounts with platform icon picker
  - Posts: Create/edit/delete/pin news with image upload
  - Settings: Change admin password

## Tech Stack
- Frontend: React, TypeScript, TanStack Query, Wouter, Tailwind CSS, shadcn/ui, react-icons
- Backend: Express.js, multer (file upload), TypeScript
- Database: PostgreSQL (Drizzle ORM)
- Design: Apple-inspired, RTL, CSS animations, glassmorphism

## Architecture
- `shared/schema.ts` - Database schema (profile, socialLinks, posts, adminCredentials)
- `server/storage.ts` - DbStorage class (PostgreSQL)
- `server/routes.ts` - API routes with auth middleware for uploads
- `client/src/pages/Home.tsx` - Public profile page
- `client/src/pages/Admin.tsx` - Login page
- `client/src/pages/Dashboard.tsx` - Full admin dashboard

## API
- `GET/PATCH /api/profile`
- `GET/POST/PATCH/DELETE /api/social-links/:id`
- `GET/POST/PATCH/DELETE /api/posts/:id`
- `POST /api/upload` (requires x-admin-password header)
- `POST /api/admin/login`
- `POST /api/admin/change-password`

## Security
- Upload endpoint requires admin auth via x-admin-password header
- MIME type + extension validation for uploads
- File size limit: 10MB
