# EpicRunz Phase 1 — Foundation + Race Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Launch epicrunz.com as a working website where runners can create an account, build a profile, and browse real races (5K to ultra marathons) sourced from the RunSignUp public API.

**Architecture:** Next.js 14 App Router on Vercel, with Supabase handling authentication and the profiles database. Race data is fetched fresh from the RunSignUp public API on each request (server-side, cached 1 hour) — no scraping, no database storage of race records needed in Phase 1.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (auth + postgres), RunSignUp REST API, Vitest for testing, Vercel for deployment.

---

## File Map

Files created or modified in this plan:

| File | Purpose |
|---|---|
| `app/layout.tsx` | Root HTML shell, loads Nav on every page |
| `app/globals.css` | Tailwind base styles (modified by create-next-app) |
| `app/page.tsx` | Landing page — hero + sample races |
| `app/login/page.tsx` | Login form |
| `app/signup/page.tsx` | Sign up form |
| `app/settings/page.tsx` | Edit profile + first-time onboarding |
| `app/profile/[username]/page.tsx` | Public runner profile |
| `app/races/page.tsx` | Browse/search races |
| `app/races/[id]/page.tsx` | Single race detail |
| `components/nav.tsx` | Top navigation bar with auth state |
| `components/race-card.tsx` | Race listing card component |
| `components/race-search-form.tsx` | Client-side search/filter form |
| `lib/supabase/client.ts` | Browser-side Supabase client |
| `lib/supabase/server.ts` | Server-side Supabase client |
| `lib/runsignup.ts` | RunSignUp API client + types |
| `middleware.ts` | Protects `/settings` route from unauthenticated access |
| `supabase/migrations/20260507000000_create_profiles.sql` | Profiles table schema + RLS policies |
| `__tests__/lib/runsignup.test.ts` | Unit tests for RunSignUp API client |
| `vitest.config.ts` | Vitest configuration |
| `vitest.setup.ts` | Vitest global setup (jest-dom matchers) |
| `.env.local` | Local env vars (gitignored) |
| `.env.example` | Template showing required env vars (committed) |

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: all Next.js scaffold files in `/Users/trophywife/Documents/EpicRunz/`

- [ ] **Step 1: Scaffold the Next.js project**

Run from the terminal (the EpicRunz folder already exists with a `docs/` subfolder — when prompted about existing files, type `y` to continue):

```bash
cd /Users/trophywife/Documents/EpicRunz
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

When the prompts appear, answer:
- Would you like to use Turbopack? → **No**
- Existing files found, continue? → **Yes**

- [ ] **Step 2: Install Supabase packages**

```bash
cd /Users/trophywife/Documents/EpicRunz
npm install @supabase/supabase-js @supabase/ssr
```

Expected output ends with: `added N packages`

- [ ] **Step 3: Install Vitest and testing packages**

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

Expected output ends with: `added N packages`

- [ ] **Step 4: Verify the project structure looks right**

```bash
ls /Users/trophywife/Documents/EpicRunz
```

Expected output includes: `app  components  node_modules  package.json  next.config.ts  tailwind.config.ts  tsconfig.json  docs`

- [ ] **Step 5: Verify Next.js runs**

```bash
cd /Users/trophywife/Documents/EpicRunz
npm run dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

Expected: `200`

```bash
kill %1
```

- [ ] **Step 6: Commit**

```bash
cd /Users/trophywife/Documents/EpicRunz
git init
git add -A
git commit -m "chore: initialize Next.js project with Tailwind and Supabase packages"
```

---

## Task 2: Set Up Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json` (add test script)

- [ ] **Step 1: Create vitest.config.ts**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 2: Create vitest.setup.ts**

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Add test script to package.json**

Open `package.json` and add `"test": "vitest"` to the `"scripts"` section:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest"
}
```

- [ ] **Step 4: Verify Vitest runs (no tests yet, should report 0 tests)**

```bash
cd /Users/trophywife/Documents/EpicRunz
npm test -- --run
```

Expected: exits cleanly, output includes `0 tests`

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts vitest.setup.ts package.json
git commit -m "chore: set up Vitest for unit testing"
```

---

## Task 3: Create Supabase Project + Run Migration

**Files:**
- Create: `supabase/migrations/20260507000000_create_profiles.sql`

- [ ] **Step 1: List Supabase organizations to get org ID**

Use the `mcp__supabase__list_organizations` tool. Note the organization ID from the output — you'll need it in the next step.

- [ ] **Step 2: Create the Supabase project**

Use the `mcp__supabase__create_project` tool with:
- `name`: `epicrunz`
- `organization_id`: (the ID from step 1)
- `region`: `us-west-1`
- `confirm_cost_id`: use `mcp__supabase__get_cost` first if needed

Note the `project_ref` (project ID) from the output — you'll need it for future steps.

- [ ] **Step 3: Write the profiles migration**

Create the file `supabase/migrations/20260507000000_create_profiles.sql`:

```sql
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  display_name text,
  bio text,
  location text,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
```

- [ ] **Step 4: Apply the migration**

Use the `mcp__supabase__apply_migration` tool with:
- `project_id`: (the project_ref from step 2)
- `name`: `create_profiles`
- `query`: (the full SQL from step 3)

- [ ] **Step 5: Verify the table exists**

Use the `mcp__supabase__list_tables` tool with the project ID. Confirm `profiles` appears in the output.

- [ ] **Step 6: Commit**

```bash
cd /Users/trophywife/Documents/EpicRunz
mkdir -p supabase/migrations
```

Create `supabase/migrations/20260507000000_create_profiles.sql` with the SQL from Step 3, then:

```bash
git add supabase/
git commit -m "feat: create profiles table with RLS policies"
```

---

## Task 4: Configure Environment Variables + Supabase Clients

**Files:**
- Create: `.env.local`
- Create: `.env.example`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`

- [ ] **Step 1: Get your Supabase project URL and anon key**

Use `mcp__supabase__get_project_url` and `mcp__supabase__get_publishable_keys` with your project ID to get the URL and anon key.

- [ ] **Step 2: Create .env.local**

```bash
# .env.local — DO NOT commit this file
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the placeholder values with the actual values from Step 1.

- [ ] **Step 3: Create .env.example**

```bash
# .env.example — copy this to .env.local and fill in your values
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- [ ] **Step 4: Verify .env.local is gitignored**

```bash
cd /Users/trophywife/Documents/EpicRunz
grep ".env.local" .gitignore
```

Expected: `.env.local` appears in the output. If not, add it:
```bash
echo ".env.local" >> .gitignore
```

- [ ] **Step 5: Create lib/supabase/client.ts**

```bash
mkdir -p lib/supabase
```

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 6: Create lib/supabase/server.ts**

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 7: Verify TypeScript compiles with no errors**

```bash
cd /Users/trophywife/Documents/EpicRunz
npx tsc --noEmit
```

Expected: no output (no errors)

- [ ] **Step 8: Commit**

```bash
git add lib/ .env.example .gitignore
git commit -m "feat: add Supabase browser and server clients"
```

---

## Task 5: Auth Middleware (Route Protection)

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Create middleware.ts**

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/settings')

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
cd /Users/trophywife/Documents/EpicRunz
npx tsc --noEmit
```

Expected: no output (no errors)

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: add auth middleware to protect /settings route"
```

---

## Task 6: Navigation Component + Root Layout

**Files:**
- Create: `components/nav.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create components/nav.tsx**

```bash
mkdir -p components
```

```tsx
// components/nav.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export default function Nav() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <Link href="/" className="text-2xl font-bold text-orange-500">
        EpicRunz
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/races" className="text-gray-600 hover:text-orange-500 font-medium">
          Find Races
        </Link>
        {user ? (
          <>
            <Link href="/settings" className="text-gray-600 hover:text-orange-500 font-medium">
              My Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 font-medium"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-gray-600 hover:text-orange-500 font-medium">
              Log In
            </Link>
            <Link
              href="/signup"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 font-medium"
            >
              Sign Up Free
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Replace app/layout.tsx**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from '@/components/nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EpicRunz — Find Races, Connect with Runners',
  description: 'Discover 5Ks to ultramarathons near you and connect with the running community.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Nav />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Start dev server and visually verify the nav appears**

```bash
cd /Users/trophywife/Documents/EpicRunz
npm run dev
```

Open http://localhost:3000 in your browser. You should see:
- "EpicRunz" in orange on the left
- "Find Races", "Log In", "Sign Up Free" on the right
- A gray background below the nav

Stop the server with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add components/nav.tsx app/layout.tsx
git commit -m "feat: add navigation bar and root layout"
```

---

## Task 7: Sign Up Page

**Files:**
- Create: `app/signup/page.tsx`

- [ ] **Step 1: Create app/signup/page.tsx**

```bash
mkdir -p app/signup
```

```tsx
// app/signup/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/settings?onboarding=true')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Join EpicRunz</h1>
        <p className="text-gray-500 mb-6">Create your free runner profile</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-400 mt-1">At least 8 characters</p>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2.5 rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-500 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-500 hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Start dev server and manually test sign up**

```bash
npm run dev
```

Open http://localhost:3000/signup. Enter a test email and password (8+ chars). Click "Create Account". You should be redirected to `/settings?onboarding=true`. Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add app/signup/
git commit -m "feat: add sign up page"
```

---

## Task 8: Login Page

**Files:**
- Create: `app/login/page.tsx`

- [ ] **Step 1: Create app/login/page.tsx**

```bash
mkdir -p app/login
```

```tsx
// app/login/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/settings')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-gray-500 mb-6">Log in to your EpicRunz account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2.5 rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-500 text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-orange-500 hover:underline font-medium">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Manually test login with the account created in Task 7**

```bash
npm run dev
```

Open http://localhost:3000/login. Enter the test credentials from Task 7. You should be redirected to `/settings`. The nav should now show "My Profile" and "Sign Out". Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add app/login/
git commit -m "feat: add login page"
```

---

## Task 9: Settings / Profile Onboarding Page

**Files:**
- Create: `app/settings/page.tsx`

- [ ] **Step 1: Create app/settings/page.tsx**

```bash
mkdir -p app/settings
```

```tsx
// app/settings/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  username: string
  display_name: string
  bio: string
  location: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>({
    username: '',
    display_name: '',
    bio: '',
    location: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOnboarding = searchParams.get('onboarding') === 'true'
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile({
          username: data.username ?? '',
          display_name: data.display_name ?? '',
          bio: data.bio ?? '',
          location: data.location ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...profile })

    if (error) {
      setError(error.message)
    } else if (isOnboarding) {
      router.push(`/profile/${profile.username}`)
    } else {
      setSuccess(true)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {isOnboarding ? 'Set up your profile' : 'Edit Profile'}
      </h1>
      {isOnboarding && (
        <p className="text-gray-500 mb-6">
          Tell the running community a bit about yourself.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-5 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            value={profile.username}
            onChange={e =>
              setProfile(p => ({
                ...p,
                username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
              }))
            }
            required
            placeholder="e.g. jennifer_runs"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-xs text-gray-400 mt-1">Letters, numbers, underscores only</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            value={profile.display_name}
            onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))}
            placeholder="Jennifer"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            value={profile.location}
            onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
            placeholder="Phoenix, AZ"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={profile.bio}
            onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
            placeholder="Tell the running community about yourself..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm font-medium">Profile saved!</p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-orange-500 text-white py-2.5 rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50"
        >
          {saving
            ? 'Saving...'
            : isOnboarding
            ? 'Create My Profile'
            : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Manually test the onboarding flow**

```bash
npm run dev
```

1. Go to http://localhost:3000/signup and create a new test account (different email from Task 7)
2. You should land on `/settings?onboarding=true`
3. Fill in username, display name, location, bio and click "Create My Profile"
4. You should be redirected to `/profile/<your-username>` (which will 404 for now — that's fine)

Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add app/settings/
git commit -m "feat: add settings page with profile onboarding"
```

---

## Task 10: Public Profile Page

**Files:**
- Create: `app/profile/[username]/page.tsx`

- [ ] **Step 1: Create app/profile/[username]/page.tsx**

```bash
mkdir -p "app/profile/[username]"
```

```tsx
// app/profile/[username]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!profile) notFound()

  const initial = (profile.display_name || profile.username)[0].toUpperCase()
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center text-3xl font-bold text-orange-500 shrink-0">
            {initial}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-gray-400">@{profile.username}</p>
            {profile.location && (
              <p className="text-gray-500 text-sm mt-1">{profile.location}</p>
            )}
          </div>
        </div>
        {profile.bio && (
          <p className="mt-6 text-gray-700 leading-relaxed">{profile.bio}</p>
        )}
        <p className="mt-6 text-sm text-gray-400 border-t pt-4">
          Member since {joinDate}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Manually test the profile page**

```bash
npm run dev
```

Go to http://localhost:3000/profile/<the-username-you-created-in-task-9>. You should see the profile card with the name, location, bio, and initials avatar. Stop with Ctrl+C.

- [ ] **Step 3: Verify a missing username shows a 404**

Go to http://localhost:3000/profile/this-user-does-not-exist. Next.js should show its built-in 404 page.

- [ ] **Step 4: Commit**

```bash
git add "app/profile/"
git commit -m "feat: add public profile page"
```

---

## Task 11: RunSignUp API Client (TDD)

**Files:**
- Create: `__tests__/lib/runsignup.test.ts`
- Create: `lib/runsignup.ts`

- [ ] **Step 1: Write the failing tests first**

```bash
mkdir -p __tests__/lib
```

```typescript
// __tests__/lib/runsignup.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchRaces, getRace } from '@/lib/runsignup'

describe('searchRaces', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns an array of normalized races', async () => {
    const mockResponse = {
      races: [
        {
          race: {
            race_id: 1,
            name: 'Test 5K',
            next_date: '2026-06-01 08:00:00',
            url: 'https://runsignup.com/race/test',
            logo: null,
            address: { city: 'Phoenix', state: 'AZ' },
            events: [{ name: '5K' }],
          },
        },
      ],
    }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const races = await searchRaces()

    expect(races).toHaveLength(1)
    expect(races[0]).toEqual({
      id: 1,
      name: 'Test 5K',
      date: '2026-06-01 08:00:00',
      city: 'Phoenix',
      state: 'AZ',
      url: 'https://runsignup.com/race/test',
      logo: null,
      distances: ['5K'],
    })
  })

  it('throws when the API responds with an error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response)
    await expect(searchRaces()).rejects.toThrow('Failed to fetch races')
  })

  it('returns an empty array when races is missing from response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ races: [] }),
    } as Response)
    const races = await searchRaces()
    expect(races).toEqual([])
  })
})

describe('getRace', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns null when the race is not found', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response)
    const race = await getRace(999)
    expect(race).toBeNull()
  })

  it('returns a normalized race by ID', async () => {
    const mockResponse = {
      race: {
        race_id: 42,
        name: 'Desert Ultra 50K',
        next_date: '2026-07-04 06:00:00',
        url: 'https://runsignup.com/race/desert',
        logo: 'https://example.com/logo.png',
        address: { city: 'Scottsdale', state: 'AZ' },
        events: [{ name: '50K' }, { name: '100K' }],
      },
    }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const race = await getRace(42)

    expect(race).not.toBeNull()
    expect(race?.id).toBe(42)
    expect(race?.name).toBe('Desert Ultra 50K')
    expect(race?.distances).toEqual(['50K', '100K'])
    expect(race?.logo).toBe('https://example.com/logo.png')
  })
})
```

- [ ] **Step 2: Run tests — verify they FAIL (lib/runsignup.ts doesn't exist yet)**

```bash
cd /Users/trophywife/Documents/EpicRunz
npm test -- --run
```

Expected: tests fail with "Cannot find module '@/lib/runsignup'"

- [ ] **Step 3: Create lib/runsignup.ts to make the tests pass**

```typescript
// lib/runsignup.ts

const BASE = 'https://runsignup.com/Rest'

export interface Race {
  id: number
  name: string
  date: string
  city: string
  state: string
  url: string
  logo: string | null
  distances: string[]
}

export interface SearchParams {
  lat?: number
  lng?: number
  radiusMiles?: number
  startDate?: string
  endDate?: string
  page?: number
}

export async function searchRaces(params: SearchParams = {}): Promise<Race[]> {
  const today = new Date()
  const sixMonthsOut = new Date()
  sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6)

  const query = new URLSearchParams({
    format: 'json',
    results_per_page: '20',
    page: String(params.page ?? 1),
    search_start_date: toRunSignUpDate(
      params.startDate ? new Date(params.startDate) : today
    ),
    search_end_date: toRunSignUpDate(
      params.endDate ? new Date(params.endDate) : sixMonthsOut
    ),
  })

  if (params.lat != null && params.lng != null) {
    query.set('search_lat', String(params.lat))
    query.set('search_long', String(params.lng))
    query.set('search_max_distance', String(params.radiusMiles ?? 50))
  }

  const res = await fetch(`${BASE}/races?${query}`, {
    next: { revalidate: 3600 },
  })

  if (!res.ok) throw new Error('Failed to fetch races from RunSignUp')

  const data = await res.json()
  return (data.races ?? []).map(({ race }: { race: unknown }) =>
    normalizeRace(race)
  )
}

export async function getRace(id: number): Promise<Race | null> {
  const res = await fetch(`${BASE}/race/${id}?format=json`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return null
  const data = await res.json()
  return normalizeRace(data.race)
}

function normalizeRace(race: Record<string, unknown>): Race {
  const address = (race.address as Record<string, string>) ?? {}
  const events = (race.events as Array<Record<string, string>>) ?? []
  return {
    id: race.race_id as number,
    name: (race.name as string) ?? '',
    date: (race.next_date as string) ?? '',
    city: address.city ?? '',
    state: address.state ?? '',
    url: (race.url as string) ?? '',
    logo: (race.logo as string | null) ?? null,
    distances: events.map(e => e.name ?? '').filter(Boolean),
  }
}

function toRunSignUpDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const y = date.getFullYear()
  return `${m}/${d}/${y}`
}
```

- [ ] **Step 4: Run tests — verify they all PASS**

```bash
npm test -- --run
```

Expected output: all 5 tests pass, 0 failures

- [ ] **Step 5: Commit**

```bash
git add lib/runsignup.ts __tests__/
git commit -m "feat: add RunSignUp API client with full test coverage"
```

---

## Task 12: Race Card + Search Form Components

**Files:**
- Create: `components/race-card.tsx`
- Create: `components/race-search-form.tsx`

- [ ] **Step 1: Create components/race-card.tsx**

```tsx
// components/race-card.tsx
import type { Race } from '@/lib/runsignup'

export default function RaceCard({ race }: { race: Race }) {
  const date = race.date
    ? new Date(race.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Date TBA'

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col">
      <h3 className="font-semibold text-gray-900 text-lg leading-tight">{race.name}</h3>
      <p className="text-gray-500 text-sm mt-1">
        {race.city}, {race.state}
      </p>
      <p className="text-orange-500 text-sm font-medium mt-1">{date}</p>
      {race.distances.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {race.distances.map(d => (
            <span
              key={d}
              className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full font-medium"
            >
              {d}
            </span>
          ))}
        </div>
      )}
      <div className="mt-auto pt-4">
        <a
          href={race.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-orange-500 hover:underline font-medium"
        >
          View race & register →
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create components/race-search-form.tsx**

```tsx
// components/race-search-form.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function RaceSearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [distance, setDistance] = useState(searchParams.get('distance') ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (distance) params.set('distance', distance)
    router.push(`/races?${params}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <select
        value={distance}
        onChange={e => setDistance(e.target.value)}
        className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-700"
      >
        <option value="">All Distances</option>
        <option value="5K">5K</option>
        <option value="10K">10K</option>
        <option value="Half">Half Marathon</option>
        <option value="Marathon">Marathon</option>
        <option value="Ultra">Ultra Marathon</option>
      </select>
      <button
        type="submit"
        className="bg-orange-500 text-white px-6 py-2.5 rounded-lg hover:bg-orange-600 font-medium"
      >
        Search
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
cd /Users/trophywife/Documents/EpicRunz
npx tsc --noEmit
```

Expected: no output (no errors)

- [ ] **Step 4: Commit**

```bash
git add components/race-card.tsx components/race-search-form.tsx
git commit -m "feat: add race card and search form components"
```

---

## Task 13: Races Browse Page

**Files:**
- Create: `app/races/page.tsx`

- [ ] **Step 1: Create app/races/page.tsx**

```bash
mkdir -p app/races
```

```tsx
// app/races/page.tsx
import { Suspense } from 'react'
import { searchRaces } from '@/lib/runsignup'
import RaceCard from '@/components/race-card'
import RaceSearchForm from '@/components/race-search-form'
import type { Race } from '@/lib/runsignup'

async function RaceList({ distance }: { distance?: string }) {
  let races: Race[] = []
  let errorMessage: string | null = null

  try {
    races = await searchRaces()
  } catch {
    errorMessage = 'Could not load races right now. Please try again shortly.'
  }

  const filtered = distance
    ? races.filter(r =>
        r.distances.some(d =>
          d.toLowerCase().includes(distance.toLowerCase())
        )
      )
    : races

  if (errorMessage) {
    return <p className="text-red-500">{errorMessage}</p>
  }

  if (filtered.length === 0) {
    return (
      <p className="text-gray-500">
        No races found{distance ? ` for "${distance}"` : ''}. Try a different filter.
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {filtered.map(race => (
        <RaceCard key={race.id} race={race} />
      ))}
    </div>
  )
}

export default async function RacesPage({
  searchParams,
}: {
  searchParams: { distance?: string }
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Races</h1>
      <p className="text-gray-500 mb-6">
        Discover upcoming 5Ks to ultramarathons
      </p>
      <Suspense fallback={null}>
        <RaceSearchForm />
      </Suspense>
      <div className="mt-8">
        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
          }
        >
          <RaceList distance={searchParams.distance} />
        </Suspense>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Start dev server and verify races load**

```bash
npm run dev
```

Open http://localhost:3000/races. You should see a list of upcoming races displayed as cards. If the RunSignUp API is unavailable, you'll see the error message — that's fine for now. Try selecting "5K" from the dropdown and clicking Search to verify filtering works. Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add app/races/page.tsx
git commit -m "feat: add races browse page with distance filtering"
```

---

## Task 14: Race Detail Page

**Files:**
- Create: `app/races/[id]/page.tsx`

- [ ] **Step 1: Create app/races/[id]/page.tsx**

```bash
mkdir -p "app/races/[id]"
```

```tsx
// app/races/[id]/page.tsx
import { getRace } from '@/lib/runsignup'
import { notFound } from 'next/navigation'

export default async function RaceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const id = Number(params.id)
  if (isNaN(id)) notFound()

  const race = await getRace(id)
  if (!race) notFound()

  const date = race.date
    ? new Date(race.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Date TBA'

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900">{race.name}</h1>
        <p className="text-gray-500 mt-2">
          {race.city}, {race.state}
        </p>
        <p className="text-orange-500 font-medium mt-1">{date}</p>
        {race.distances.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {race.distances.map(d => (
              <span
                key={d}
                className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full font-medium text-sm"
              >
                {d}
              </span>
            ))}
          </div>
        )}
        <a
          href={race.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-medium"
        >
          Register on RunSignUp →
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Test the race detail page**

```bash
npm run dev
```

From the races page at http://localhost:3000/races, click "View race & register →" on any race card — it will open RunSignUp in a new tab (that's correct, the race URL goes to RunSignUp). 

To test the detail page directly, you need a real race ID. From the races page source, note a race ID from the data, then visit http://localhost:3000/races/<that-id>. You should see the race detail card.

Visit http://localhost:3000/races/999999999 — should show the Next.js 404 page.

Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add "app/races/[id]/"
git commit -m "feat: add race detail page"
```

---

## Task 15: Landing Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace app/page.tsx with the EpicRunz landing page**

```tsx
// app/page.tsx
import Link from 'next/link'
import { searchRaces } from '@/lib/runsignup'
import RaceCard from '@/components/race-card'
import type { Race } from '@/lib/runsignup'

async function getFeaturedRaces(): Promise<Race[]> {
  try {
    const races = await searchRaces()
    return races.slice(0, 3)
  } catch {
    return []
  }
}

export default async function HomePage() {
  const featuredRaces = await getFeaturedRaces()

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold leading-tight">
            Find Your Next Epic Run
          </h1>
          <p className="text-xl mt-4 opacity-90 max-w-xl mx-auto">
            Discover races from 5Ks to ultramarathons, connect with runners near
            you, and track your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/races"
              className="bg-white text-orange-500 px-8 py-3 rounded-lg font-bold hover:bg-orange-50 text-lg"
            >
              Find Races
            </Link>
            <Link
              href="/signup"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-orange-500 text-lg transition-colors"
            >
              Join Free
            </Link>
          </div>
        </div>
      </section>

      {/* Featured races */}
      {featuredRaces.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Upcoming Races
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {featuredRaces.map(race => (
              <RaceCard key={race.id} race={race} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/races"
              className="text-orange-500 font-semibold hover:underline"
            >
              Browse all races →
            </Link>
          </div>
        </section>
      )}

      {/* Feature highlights */}
      <section className="bg-white py-14 px-4">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
          {[
            {
              icon: '🏃',
              title: 'Find Races',
              desc: 'Search thousands of real races from 5K to ultramarathon nationwide.',
            },
            {
              icon: '🏅',
              title: 'Track Achievements',
              desc: 'Earn badges for completed races and build your runner profile. (Coming soon)',
            },
            {
              icon: '👥',
              title: 'Join Running Groups',
              desc: 'Connect with local runners and join group runs in your area. (Coming soon)',
            },
          ].map(f => (
            <div key={f.title}>
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg text-gray-900">{f.title}</h3>
              <p className="text-gray-500 mt-2 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Start dev server and review the full landing page**

```bash
npm run dev
```

Open http://localhost:3000. Check:
- Orange hero section with headline, subtitle, and two buttons
- "Upcoming Races" section with 3 race cards (if RunSignUp API responds)
- Three feature highlight boxes at the bottom
- Nav shows EpicRunz logo, Find Races, Log In, Sign Up Free

Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add landing page with hero and featured races"
```

---

## Task 16: Push to GitHub + Deploy to Vercel

**Files:** none (git and deployment config)

- [ ] **Step 1: Create GitHub repository**

```bash
cd /Users/trophywife/Documents/EpicRunz
gh repo create epicrunz --public --source=. --remote=origin --push
```

Expected: outputs a GitHub URL like `https://github.com/jmaciag1/epicrunz`

- [ ] **Step 2: Verify the push was successful**

```bash
gh repo view --web
```

This opens the GitHub repo in your browser. Confirm all files are there.

- [ ] **Step 3: Deploy to Vercel**

```bash
cd /Users/trophywife/Documents/EpicRunz
vercel
```

When prompted:
- Set up and deploy? → **Y**
- Which scope? → select your Vercel account
- Link to existing project? → **N**
- Project name → **epicrunz**
- Directory → **.** (current directory)
- Override settings? → **N**

Wait for deployment to complete. Note the preview URL (e.g. `https://epicrunz-abc123.vercel.app`).

- [ ] **Step 4: Add environment variables to Vercel**

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
```

Paste your Supabase URL when prompted.

```bash
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

Paste your Supabase anon key when prompted.

- [ ] **Step 5: Redeploy with the environment variables**

```bash
vercel --prod
```

Wait for deployment. Note the production URL.

- [ ] **Step 6: Set up Vercel GitHub integration for automatic deploys**

```bash
vercel link
```

From now on, every `git push` to `main` will automatically deploy to Vercel.

---

## Task 17: Connect epicrunz.com Domain

**Files:** none (DNS configuration)

- [ ] **Step 1: Add domain to Vercel**

```bash
vercel domains add epicrunz.com
```

Vercel will output DNS records you need to add. Note them — you'll need:
- An **A record**: `@` pointing to `76.76.21.21`
- A **CNAME record**: `www` pointing to `cname.vercel-dns.com`

- [ ] **Step 2: Update DNS at GoDaddy**

1. Log in to GoDaddy at godaddy.com
2. Go to "My Products" → find epicrunz.com → click "DNS"
3. Delete any existing A records for `@`
4. Add new A record: Host = `@`, Points to = `76.76.21.21`, TTL = 600
5. Add CNAME record: Host = `www`, Points to = `cname.vercel-dns.com`, TTL = 600
6. Save changes

- [ ] **Step 3: Wait for DNS propagation and verify**

DNS propagation takes 5–30 minutes. Check status:

```bash
vercel domains inspect epicrunz.com
```

Keep running this every 5 minutes until it shows the domain as "Valid Configuration."

- [ ] **Step 4: Set epicrunz.com as the production domain in Vercel**

```bash
vercel alias set <your-deployment-url> epicrunz.com
```

- [ ] **Step 5: Verify the live site**

Open https://epicrunz.com in a browser. You should see the full landing page live on the internet.

- [ ] **Step 6: Add Supabase auth redirect URL**

In your Supabase dashboard (supabase.com → your project → Authentication → URL Configuration):
- Add `https://epicrunz.com` to the "Site URL" field
- Add `https://epicrunz.com/**` to "Redirect URLs"

This ensures email confirmations and auth redirects work on the live domain.

---

## Phase 1 Complete — Testing Checklist

Before marking Phase 1 done, verify each item on the live site at epicrunz.com:

- [ ] Landing page loads with hero, races, and feature section
- [ ] Sign up with a new email creates an account and redirects to profile onboarding
- [ ] Profile onboarding saves username, name, location, bio
- [ ] Public profile page (`/profile/<username>`) shows the profile
- [ ] Settings page loads existing profile data when logged in
- [ ] Log out returns to landing page and nav shows Log In / Sign Up
- [ ] Log in with existing credentials works
- [ ] `/settings` redirects to `/login` when not logged in
- [ ] Races page loads and shows race cards
- [ ] Distance filter on races page narrows results
- [ ] 404 page appears for `/profile/nonexistent` and `/races/999999999`
- [ ] Site looks correct on iPhone-sized screen (use browser DevTools to check)
