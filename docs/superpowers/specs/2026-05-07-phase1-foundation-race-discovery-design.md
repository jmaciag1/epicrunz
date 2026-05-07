# EpicRunz Phase 1 — Foundation + Race Discovery

**Date:** 2026-05-07  
**Status:** Approved

---

## Goal

Launch epicrunz.com as a working website where runners can create an account, build a basic profile, and search/browse real races (5K to ultra marathons) near them. This is the hook that brings the first users in.

---

## Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Frontend + API | Next.js 14 (App Router) | Works great with Vercel, handles pages + backend in one project |
| Database + Auth | Supabase | Free tier, built-in user auth, easy to grow |
| Deployment | Vercel | One-click deploys, connects to GitHub automatically |
| Styling | Tailwind CSS | Fast to build with, looks clean out of the box |
| Race Data | RunSignUp API | Free public API with thousands of real races, no scraping needed |

---

## Architecture

```
epicrunz.com (Vercel)
    │
    ├── Next.js App
    │     ├── Pages: Home, Races, Profile, Sign Up, Log In
    │     └── API Routes: race search proxy, profile CRUD
    │
    ├── Supabase
    │     ├── Auth: email/password sign up + login
    │     └── Database: users, profiles
    │
    └── RunSignUp API (external)
          └── Race search by location, date, distance
```

---

## Pages & Routes

| Route | What it does |
|---|---|
| `/` | Landing page — hero, tagline, sign up CTA, sample races |
| `/races` | Browse/search races — filter by distance, location, date |
| `/races/[id]` | Single race detail page |
| `/profile/[username]` | Public runner profile |
| `/settings` | Edit your profile (name, bio, location, photo) |
| `/signup` | Create account |
| `/login` | Log in |

---

## Database Schema (Supabase)

**profiles** table (extends Supabase's built-in auth.users)
- `id` — matches auth user ID
- `username` — unique handle
- `display_name`
- `bio`
- `location` (city, state)
- `avatar_url`
- `created_at`

---

## Race Data

Races come from the **RunSignUp public API** — no scraping, no legal risk, and it covers thousands of events nationwide including 5Ks, 10Ks, half marathons, marathons, and ultras.

The `/races` page will call RunSignUp's API server-side, passing the user's search filters (location radius, distance type, date range). Results are displayed but not stored — we fetch fresh each time.

---

## Auth Flow

1. User signs up with email + password via Supabase Auth
2. On first login, they're prompted to set a username and basic profile info
3. Session is managed by Supabase — stays logged in across visits
4. Protected routes (`/settings`) redirect to `/login` if not authenticated

---

## What Phase 1 Does NOT Include

- Badges or race completion tracking (Phase 2)
- Running groups (Phase 3)
- Race creation tools (Phase 4)
- Gear sharing (Phase 5)
- Coaching (Phase 6)
- Payments of any kind

---

## Success Criteria

- Site is live at epicrunz.com
- A new visitor can sign up and create a profile in under 2 minutes
- Races load and are searchable by location and distance type
- Works on mobile and desktop
