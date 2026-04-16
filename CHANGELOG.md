# Changelog

All notable changes to LinkSphere will be documented in this file.

## [Unreleased]

### Added - 2026-04-03

#### QR Code Feature
- **Auto-generate QR codes** for all links on creation and URL updates
- **QR Code Modal** - Display QR codes with download functionality
- **Dashboard QR Button** - View/download QR codes from links table
- **Public Profile QR Button** - Hover-triggered QR button on link cards
- **Database Schema** - Added `qr_code` column to links table (SQLite & Supabase)
- **Migration Scripts** - Automatic schema migration for existing installations

**Components:**
- `components/shared/qr-code-modal.tsx` - Reusable QR code modal
- `lib/qr-code.ts` - QR generation utility with security features

**API Changes:**
- `POST /api/links` - Auto-generates QR code on link creation
- `PATCH /api/links/[id]` - Regenerates QR code when URL changes

**Dependencies:**
- Added `qrcode` - QR code generation library
- Added `@types/qrcode` - TypeScript types

### Changed - 2026-04-03

#### Mobile Layout Improvements
- **Dashboard Links Mobile** - Redesigned card layout for better responsiveness
  - Use `line-clamp-2` for URLs (max 2 lines, then ellipsis)
  - Use `break-all` for proper URL wrapping
  - Use `flex-wrap` for badges section
  - Grid layout for action buttons (4 equal columns)
  - Responsive padding and text sizes

#### Public Profile
- **Mobile Card Height** - Reduced padding on mobile (p-4 vs p-5)
- **Icon Sizing** - Smaller icons on mobile (h-4 w-4 vs h-5 w-5)
- **Text Sizing** - Smaller URL text on mobile (text-xs vs text-sm)

### Fixed - 2026-04-03

#### QR Code Modal Click Issue
- Fixed issue where closing QR modal on public profile would trigger link click
- Moved QRCodeModal outside button element using React Fragment

#### Mobile Overflow Issues
- Fixed horizontal overflow on dashboard links table
- Fixed horizontal overflow on public profile cards
- Improved truncation and flex layouts

#### SSR Warning
- Replaced `react-qr-code` with `qrcode` package
- Removed `react-dom/server` dependency
- No more Next.js 15 SSR warnings

### Database - 2026-04-03

#### SQLite Schema
```sql
ALTER TABLE links ADD COLUMN qr_code TEXT;
CREATE INDEX idx_links_qr_code ON links(qr_code) WHERE qr_code IS NOT NULL;
```

#### Supabase Schema
```sql
-- File: supabase/migrations/20260403000001_add_qr_code_column.sql
ALTER TABLE links ADD COLUMN qr_code TEXT;
CREATE INDEX IF NOT EXISTS idx_links_qr_code ON links(qr_code) WHERE qr_code IS NOT NULL;
```

### Migration - 2026-04-03

#### For Existing SQLite Installations
```bash
npm run migrate:sqlite
```

#### For Supabase Installations
Run the SQL in `supabase/migrations/20260403000001_add_qr_code_column.sql` in Supabase SQL Editor.

---

## Recent Commits

| Commit | Description |
|--------|-------------|
| `1b4e42c` | feat: limit URL to max 2 lines using line-clamp-2 |
| `8830776` | fix: redesign mobile cards following responsive reference pattern |
| `e1eb960` | fix: completely redesign mobile cards for proper responsiveness |
| `9d99503` | fix: prevent mobile overflow in dashboard links table |
| `43f8193` | fix: optimize link card layout for mobile with long URLs |
| `3cecbf5` | fix: prevent link click when closing QR modal on public profile |
| `1722815` | fix: replace react-qr-code with qrcode package to fix SSR warning |
| `09f226c` | docs: add QR code feature testing summary |
| `c89dafe` | feat: add QR code button to link card (public profile) |
| `e000cf0` | feat: add QR code button to links table dashboard |
| `97ea16c` | feat: create QR Code modal component |
| `61444f4` | feat: regenerate QR code when link URL changes |
| `e1bc799` | feat: generate QR code on link creation |
| `64ee310` | feat: add Supabase migration for QR code column |
| `1492a6e` | feat: add SQLite migration scripts for QR code feature |
| `3d13903` | feat: add qr_code column to SQLite schema |
| `03005ae` | fix: add security hardening to QR code generation |
| `d7b2e96` | feat: add QR code generation utility |
| `aca4860` | feat: add qr_code field to Link type |
| `ae8f382` | deps: add react-qr-code package |

---

## Features

### QR Code Feature
- Automatic QR code generation when links are created
- QR code regeneration when link URLs change
- QR code display in modal (200x200px)
- QR code download as PNG image
- Available in dashboard (all links) and public profile (per link)

### Public Profiles
- Custom URL format: `/[slug]` (clean URLs)
- Reserved slug protection (dashboard, login, register, admin, api, etc.)
- Customizable theme color, logo, page title
- Search functionality for links
- Mobile-responsive design

### Dashboard
- Link management with CRUD operations
- Category management
- Real-time statistics
- Click tracking
- Mobile-responsive tables and cards

---

## Technical Stack

- **Framework**: Next.js 15.1.6 (App Router)
- **Language**: TypeScript 5.7.3
- **Database**: SQLite / Supabase (PostgreSQL)
- **UI**: shadcn/ui (Radix UI + Tailwind CSS)
- **Auth**: Custom JWT with bcryptjs
- **QR Generation**: qrcode package

---

## Database Schema

### Links Table
```sql
CREATE TABLE links (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category_id TEXT,
  is_public INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  click_count INTEGER DEFAULT 0,
  qr_code TEXT,              -- NEW: QR code as base64 data URI
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

### Links
- `GET /api/links` - Get all user links (with auto-generated QR codes)
- `POST /api/links` - Create new link (auto-generates QR code)
- `PATCH /api/links/[id]` - Update link (regenerates QR if URL changes)
- `DELETE /api/links/[id]` - Delete link

### Track Clicks
- `POST /api/track-click` - Increment link click count

---

## Component Structure

```
components/
├── shared/
│   └── qr-code-modal.tsx        (NEW: Reusable QR modal)
├── user/
│   └── links-table.tsx          (UPDATED: QR buttons + mobile)
└── link-card.tsx                (UPDATED: QR button + mobile)
```

---

## Security

- URL validation before QR code generation (prevents XSS)
- Maximum URL length limit (2000 characters)
- Password hashing with bcryptjs (10 salt rounds)
- httpOnly session cookies
- CSRF protection via SameSite 'lax'
- Ownership verification on all mutations

---

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Migrate SQLite database
npm run migrate:sqlite
```

---

## Deployment Notes

### First-Time Deployment
1. Run database migration: `npm run migrate:sqlite` (SQLite) or apply Supabase migration
2. Set environment variables (.env)
3. Build and deploy

### Existing Installations
1. Pull latest code
2. Run migration: `npm run migrate:sqlite`
3. Restart application

---

## Support

For issues or questions, please refer to:
- `CLAUDE.md` - Project documentation for Claude Code
- `docs/superpowers/` - Feature design and implementation docs
