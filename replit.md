# Personal Profile Website - موقع شخصي

## Overview
A stunning personal profile website with a full admin dashboard, built with React, Express, and PostgreSQL.

## Features
- **Public Profile Page** (`/`):
  - Animated banner/hero image
  - Profile picture with animated story ring (Instagram-style gradient)
  - Name, username, bio, location, website
  - Verified badge option
  - Social media links with platform icons and colors
  - News/Posts feed with pinned posts support
  - RTL (Arabic) layout

- **Admin Dashboard** (`/admin`, `/admin/dashboard`):
  - Password-protected login (default: `admin123`)
  - Profile management: name, bio, banner URL, avatar URL, location, website
  - Toggle story ring and verified badge
  - Social links management: add/delete with platform icons, colors
  - Posts management: create, edit, delete, pin/unpin
  - Password change

## Tech Stack
- **Frontend**: React, TypeScript, TanStack Query, Wouter, Tailwind CSS, shadcn/ui, Framer Motion, react-icons
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL (via Drizzle ORM)
- **Styling**: RTL, dark/light theme, custom story ring animation

## Architecture
- `shared/schema.ts` - Drizzle schema for profile, socialLinks, posts, adminCredentials
- `server/storage.ts` - DbStorage class with all CRUD methods
- `server/routes.ts` - All API endpoints
- `server/index.ts` - App entry with seed data
- `client/src/pages/Home.tsx` - Public profile page
- `client/src/pages/Admin.tsx` - Admin login
- `client/src/pages/Dashboard.tsx` - Admin dashboard with tabs

## API Endpoints
- `GET/PATCH /api/profile` - Profile management
- `GET/POST/PATCH/DELETE /api/social-links/:id` - Social links
- `GET/POST/PATCH/DELETE /api/posts/:id` - Posts
- `POST /api/admin/login` - Admin auth
- `POST /api/admin/change-password` - Change password

## Default Admin Password
`admin123` (change from Settings tab in dashboard)

## Images
- Banner: `/images/banner.png` (AI-generated purple/blue gradient)
- Default avatar: `/images/avatar-default.png`
