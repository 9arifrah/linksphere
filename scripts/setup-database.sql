-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (email: admin@example.com, password: admin123)
-- Using password_hash column that already exists
INSERT INTO admin_users (email, password_hash) VALUES
  ('admin@example.com', 'admin123')
ON CONFLICT (email) DO NOTHING;

-- Insert default categories
INSERT INTO categories (name, icon, sort_order) VALUES
  ('Pendaftaran & Formulir', '📝', 1),
  ('Materi Panduan', '📘', 2),
  ('Media Sosial', '📱', 3),
  ('Dokumen Penting', '📁', 4)
ON CONFLICT DO NOTHING;

-- Insert sample links
INSERT INTO links (title, url, category_id, is_active) 
SELECT 
  'Form Biodata Peserta',
  'https://forms.google.com/biodata',
  (SELECT id FROM categories WHERE name = 'Pendaftaran & Formulir' LIMIT 1),
  true
WHERE NOT EXISTS (SELECT 1 FROM links WHERE title = 'Form Biodata Peserta');

INSERT INTO links (title, url, category_id, is_active) 
SELECT 
  'Link Upload Berkas',
  'https://drive.google.com/upload',
  (SELECT id FROM categories WHERE name = 'Pendaftaran & Formulir' LIMIT 1),
  true
WHERE NOT EXISTS (SELECT 1 FROM links WHERE title = 'Link Upload Berkas');

INSERT INTO links (title, url, category_id, is_active) 
SELECT 
  'Download PDF Modul 1',
  'https://drive.google.com/file/modul1.pdf',
  (SELECT id FROM categories WHERE name = 'Materi Panduan' LIMIT 1),
  true
WHERE NOT EXISTS (SELECT 1 FROM links WHERE title = 'Download PDF Modul 1');

INSERT INTO links (title, url, category_id, is_active) 
SELECT 
  'Video Tutorial Sistem',
  'https://youtube.com/watch?v=tutorial',
  (SELECT id FROM categories WHERE name = 'Materi Panduan' LIMIT 1),
  true
WHERE NOT EXISTS (SELECT 1 FROM links WHERE title = 'Video Tutorial Sistem');

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public can read active links and categories
CREATE POLICY "Public can view active links" ON links
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view categories" ON categories
  FOR SELECT USING (true);

-- Only admins can modify (you'll need to set up auth for this)
CREATE POLICY "Admins can do everything on links" ON links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can do everything on categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

-- Function to increment click count
CREATE OR REPLACE FUNCTION increment_click_count(link_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE links 
  SET click_count = click_count + 1
  WHERE id = link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
