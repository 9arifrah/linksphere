# 🚀 LinkSphere - Quick Setup Guide

Panduan ini akan membantu Anda menyiapkan LinkSphere dalam **5 menit** untuk pengujian lokal.

---

## 📋 Opsi Database

LinkSphere mendukung **2 opsi database**:

### ✅ Opsi 1: SQLite (Rekomendasi untuk Quick Test)
- ✅ **Tanpa setup eksternal** - langsung jalan
- ✅ Database file otomatis dibuat
- ✅ Data tersimpan lokal di folder project
- ✅ Cocok untuk development & testing cepat

### ☁️ Opsi 2: Supabase (Untuk Production)
- Memerlukan akun Supabase gratis
- Setup manual di Supabase dashboard
- Data tersimpan di cloud
- Cocok untuk deployment production

---

## 🎯 QUICK START (SQLite - Disarankan)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup .env File
Buat file `.env` di root directory dengan isi berikut:

```env
# Database Configuration
DB_TYPE=sqlite

# JWT Secret (Generate dengan command di bawah)
JWT_SECRET=change-this-to-a-strong-secret-key-minimum-32-characters

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

**Generate JWT Secret yang aman:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Copy output dan paste ke `JWT_SECRET`

### Step 3: Run Development Server
```bash
npm run dev
```

### Step 4: Test Application

**1. Register User Baru:**
- Buka: http://localhost:3000/register
- Masukkan email, password, display name
- Pilih custom slug (misal: "johndoe")

**2. Login:**
- Buka: http://localhost:3000/login
- Gunakan email & password yang didaftarkan

**3. Dashboard:**
- Setelah login, otomatis redirect ke `/dashboard`
- Tambah links & categories

**4. Test Public Profile:**
- Buka: http://localhost:3000/u/[slug-anda]
- Contoh: http://localhost:3000/u/johndoe

---

## ☁️ SETUP SUPABASE (Opsional - Untuk Production)

### Step 1: Buat Project Supabase
1. Login ke https://supabase.com
2. Klik **"New Project"**
3. Pilih organization
4. Setup project:
   - **Name**: linksphere (atau nama lain)
   - **Database Password**: Generate strong password
   - **Region**: Pilih region terdekat (Singapore/Jakarta)

### Step 2: Dapatkan Credentials
Setelah project jadi:
1. Buka **Project Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Update .env File
```env
# Database Configuration
DB_TYPE=supabase

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# JWT Secret
JWT_SECRET=your-generated-secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### Step 4: Setup Database di Supabase

**Option A: Run SQL Script di Dashboard**
1. Buka Supabase Dashboard
2. Navigate ke **SQL Editor**
3. Click **"New Query"**
4. Copy & paste isi dari `scripts/multi-user-schema.sql` (lihat di bawah)
5. Click **"Run"** ▶️

**Option B: Run SQL Script via CLI (Jika ada)**
```bash
# Jika ada script setup
npm run setup:db
```

### Step 5: Create Admin User
Di Supabase SQL Editor, run:

```sql
-- Insert admin user (email: admin@example.com, password: admin123)
INSERT INTO admin_users (email, password_hash) 
VALUES ('admin@example.com', '$2a$10$your-bcrypt-hash-here')
ON CONFLICT (email) DO NOTHING;
```

**Generate password hash:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(h => console.log(h))"
```

---

## 📝 Complete Database Schema (Supabase)

Copy ini ke Supabase SQL Editor jika ingin setup manual:

```sql
-- =====================================================
-- LINKSPHERE COMPLETE DATABASE SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  custom_slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme_color TEXT DEFAULT '#3b82f6',
  logo_url TEXT,
  page_title TEXT,
  show_categories BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Links table
CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_custom_slug ON users(custom_slug);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_category_id ON links(category_id);
CREATE INDEX IF NOT EXISTS idx_links_is_public ON links(is_public);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to increment click count
CREATE OR REPLACE FUNCTION increment_click_count(link_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE links 
  SET click_count = click_count + 1,
      updated_at = NOW()
  WHERE id = link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at for users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for user_settings
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for categories
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for links
CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for admin_users
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (id = auth.uid());

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (user_id = auth.uid());

-- Categories policies
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (user_id = auth.uid());

-- Links policies
CREATE POLICY "Users can view own links" ON links
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Public can view public links" ON links
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own links" ON links
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own links" ON links
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own links" ON links
  FOR DELETE USING (user_id = auth.uid());

-- Admin policies (custom JWT implementation)
-- Note: These policies use custom auth logic, not Supabase Auth
CREATE POLICY "Admins can do everything on users" ON users
  FOR ALL USING (true); -- Will be enforced by API middleware

CREATE POLICY "Admins can do everything on categories" ON categories
  FOR ALL USING (true);

CREATE POLICY "Admins can do everything on links" ON links
  FOR ALL USING (true);

CREATE POLICY "Admins can do everything on user_settings" ON user_settings
  FOR ALL USING (true);

CREATE POLICY "Admins can do everything on admin_users" ON admin_users
  FOR ALL USING (true);
```

---

## 🔧 Troubleshooting

### Error: "Database not initialized"
**SQLite**: Hapus file `linksphere.db` dan restart server  
**Supabase**: Pastikan SQL script sudah di-run

### Error: "Invalid JWT Secret"
Pastikan `JWT_SECRET` di `.env` sudah di-set dengan value yang aman

### Error: "Admin user not found"
Run script insert admin (lihat Step 5 di Setup Supabase)

### Port 3000 already in use
```bash
# Kill process on port 3000 (Windows)
npx kill-port 3000

# Atau gunakan port lain
PORT=3001 npm run dev
```

---

## 📚 Next Steps

Setelah setup berhasil:

1. ✅ **Test User Flow**: Register → Login → Dashboard → Add Links
2. ✅ **Test Public Profile**: Akses `/u/[slug]` untuk melihat hasil
3. ✅ **Test Admin Flow**: Login admin → `/admin/dashboard`
4. ✅ **Customize Profile**: Edit settings di `/dashboard/settings`
5. ✅ **Deployment**: Siapkan Supabase untuk production

---

## 🆘 Need Help?

Jika ada masalah:
1. Cek logs di terminal saat error
2. Pastikan semua dependencies terinstall
3. Verify `.env` file sudah benar
4. Untuk Supabase: cek SQL logs di dashboard

Happy coding! 🚀
