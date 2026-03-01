# Personal Profile Website - Mohammed Reza

## Overview
Apple-inspired personal profile website with static data (no database needed for public page).

## Features
- **Public Profile** (`/`): Banner, avatar with story ring, bio, social icons
- **Static Data**: All profile info hardcoded - works on any hosting
- **Dark/Light Mode**: Toggle with localStorage persistence
- **Animated Background**: Floating orbs with blur effects
- **Music Player**: Audio player with play/pause/mute
- **Visitor Counter**: Client-side localStorage counter
- **Copyright Footer**: "Designed by Mohammed Reza" links to /admin

## Tech Stack
- Frontend: React, TypeScript, Tailwind CSS, shadcn/ui, react-icons
- Backend: Express.js (for serving + admin API)
- Database: PostgreSQL (only for admin panel)

## Architecture
- `client/src/pages/Home.tsx` - Public profile (static data, no API calls)
- `client/src/pages/Admin.tsx` - Login page
- `client/src/pages/Dashboard.tsx` - Admin dashboard
- `client/src/components/ThemeProvider.tsx` - Dark/light mode

## Profile Data
- Name: Mohammed Reza
- Location: العراق، كربلاء
- Social: Instagram, TikTok, Telegram, Facebook, Discord, Store, Channel
