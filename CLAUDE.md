# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LinkSphere** is a professional link management platform built with Next.js 16 (App Router) that allows users to organize, share, and display important links with customizable public pages.

**Tech Stack:**
- Frontend: Next.js 16.1.6, React 19
- Backend: Supabase (PostgreSQL)
- UI: shadcn/ui components (Radix UI + Tailwind CSS)
- Auth: Custom JWT with bcryptjs (cookie-based sessions)
- Language: TypeScript

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

**Note:** TypeScript errors are ignored during builds (`typescript.ignoreBuildErrors: true` in next.config.mjs).

---

## Architecture Overview

### Authentication System

**Custom Implementation (Not Supabase Auth):**
- Cookie-based session management using `user_session` and `admin_session` cookies
- Passwords hashed with bcryptjs (10 salt rounds)
- Sessions stored as httpOnly cookies with 7-day expiry
- Separate admin authentication via `admin_users` table

**Session Pattern:**
```typescript
// API routes extract session from cookie
async function getUserSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('user_session')
  return session?.value || null
}

// Protected routes verify session
const userId = await getUserSession()
if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

**Key Files:**
- `app/api/auth/login/route.ts` - User login
- `app/api/auth/register/route.ts` - Registration (creates user + user_settings)
- `app/api/auth/logout/route.ts` - Clears session
- `app/api/admin/login/route.ts` - Admin login (checks admin_users table)

---

### Database & Types

**Supabase Client:** `lib/supabase.ts`
- Initialized with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- TypeScript types defined for: Category, Link, User, UserSettings, Admin

**Key Tables:**
- `users` - User accounts (email, password_hash, custom_slug, display_name)
- `user_settings` - Profile customization (theme_color, logo_url, page_title, show_categories)
- `links` - Link entries with click tracking (title, url, category_id, is_public, click_count)
- `categories` - Category definitions (name, icon, sort_order, user_id)
- `admin_users` - Admin authorization mapping

**RPC Functions:**
- `increment_click_count(link_id)` - Thread-safe click counting

---

### Component Architecture

**Organization Pattern:**
```
components/
├── ui/              # 50+ shadcn/ui primitives (Button, Card, Dialog, etc.)
├── auth/            # Authentication forms (login-form, register-form)
├── admin/           # Admin dashboard (12 components)
├── user/            # User dashboard (10 components)
├── link-card.tsx    # Shared domain component
└── search-bar.tsx   # Shared domain component
```

**UI Component Patterns:**
- Based on shadcn/ui (Radix UI + Tailwind CSS)
- `forwardRef` pattern for ref forwarding
- `class-variance-authority` for variant management
- Compound component pattern (Card, CardHeader, CardContent, etc.)
- All interactive components use `'use client'` directive
- Styling via `cn()` utility (clsx + tailwind-merge)

**Component Communication:**
- Props down, events up
- Direct fetch calls to API routes (no Redux/Zustand)
- Local state with React hooks (useState, useEffect)
- Router navigation via Next.js Link component

---

### Routing Structure

**Public Pages:**
- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/u/[slug]` - Public profile pages (ISR with 60s revalidation)

**User Dashboard (Protected):**
- `/dashboard` - Main dashboard with stats
- `/dashboard/links` - Link management
- `/dashboard/categories` - Category management
- `/dashboard/settings` - Profile customization

**Admin Panel (Protected):**
- `/admin/login` - Admin login
- `/admin/dashboard` - Platform stats
- `/admin/categories` - Global categories
- `/admin/users` - User management
- `/admin/settings` - Admin settings
- `/admin/stats` - Analytics

**Protection Pattern:**
```typescript
// In dashboard pages
async function checkAuth() {
  const cookieStore = await cookies()
  const session = cookieStore.get('user_session')
  if (!session) redirect('/login')
}
```

---

### API Route Patterns

**Authentication Check:**
```typescript
const userId = await getUserSession()
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Ownership verification
if (resource.user_id !== userId) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

**Error Handling:**
- Consistent error logging with `[v0]` prefix
- Indonesian language error messages in user-facing responses
- Standard HTTP status codes (400, 401, 403, 409, 500)

**Key API Routes:**
- `POST /api/links` - Create link
- `PATCH /api/links/[id]` - Update link (ownership verified)
- `DELETE /api/links/[id]` - Delete link (ownership verified)
- `POST /api/track-click` - Increment click count (uses RPC function)
- `PATCH /api/user/settings` - Update profile settings

---

## Important Patterns & Conventions

### Path Aliases
- `@/*` maps to project root (configured in tsconfig.json)
- Use absolute imports: `import { Button } from '@/components/ui/button'`

### Styling
- Use `cn()` utility for conditional classes: `cn("base-classes", condition && "conditional-classes")`
- Mobile-first responsive design with Tailwind breakpoints
- Theme color customization via `user_settings.theme_color`

### Public Profile Pages
- Custom URL via `custom_slug` field (e.g., `/u/johndoe`)
- ISR with 60-second revalidation
- Customizable: theme_color, logo_url, page_title, show_categories
- Search functionality for filtering links

### Click Tracking
- Uses Supabase RPC function `increment_click_count(link_id)` for thread-safe counting
- Triggered via `POST /api/track-click` before opening link
- LinkCard component automatically tracks clicks

### Admin vs User Routes
- User routes: check `user_session` cookie
- Admin routes: check `admin_session` cookie AND `admin_users` table
- Admin can manage all users, links, and global categories

---

## Security Notes

**✅ Implemented:**
- Password hashing with bcrypt (10 rounds)
- httpOnly session cookies
- Secure cookies in production
- SameSite 'lax' CSRF protection
- Minimum password length: 8 characters
- Ownership verification on resource mutations

**⚠️ Important:**
- Never store plain text passwords
- Always verify userId matches resource owner before mutations
- Use bcrypt.compare() for password verification, never direct comparison

---

## Testing & Verification

**Test Authentication Flow:**
1. Register new user at `/register`
2. Verify `user_settings` created automatically
3. Login at `/login` (should set cookie)
4. Access `/dashboard` (should work)
5. Logout (cookie should clear)
6. Try accessing `/dashboard` (should redirect to login)

**Test Public Profile:**
1. Create user with custom_slug
2. Add public links
3. Visit `/u/[slug]` (should show links grouped by category)
4. Test search functionality
5. Click link (should increment click_count)

**Test Admin:**
1. Ensure user exists in `admin_users` table
2. Login at `/admin/login`
3. Access `/admin/dashboard` (should show platform stats)
4. Test user/link/category management

---

## Key Files Reference

**Configuration:**
- `next.config.mjs` - Next.js config (TS errors ignored, images unoptimized)
- `tsconfig.json` - TypeScript config (strict mode, path aliases)
- `tailwind.config.ts` - Tailwind theme configuration
- `.env` - Environment variables (Supabase credentials)

**Core Infrastructure:**
- `lib/supabase.ts` - Database client and TypeScript types
- `lib/utils.ts` - `cn()` utility for class merging
- `hooks/use-mobile.tsx` - Responsive breakpoint hook (768px)
- `hooks/use-toast.ts` - Toast notification system

**Authentication:**
- `app/api/auth/login/route.ts`
- `app/api/auth/register/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/admin/login/route.ts`

**Dashboard Layouts:**
- `components/user/dashboard-layout.tsx`
- `components/admin/dashboard-layout.tsx`

**Public Profile:**
- `app/u/[slug]/page.tsx` - Public profile page (ISR)
- `components/link-card.tsx` - Click tracking link card
- `components/search-bar.tsx` - Search functionality

---

## Migration Notes

**Password Security Migration (February 2026):**
- Application migrated from plain text passwords to bcrypt hashing
- Existing users require password reset (see PASSWORD_SECURITY_MIGRATION.md)
- New registrations automatically hash passwords
- Use bcrypt to generate hashes if manual password updates needed

```bash
# Generate a password hash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword123!', 10).then(h => console.log(h))"
```
