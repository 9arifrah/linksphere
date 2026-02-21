-- Disable RLS on admin_users table to allow API access
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Alternatively, if you want to keep RLS enabled, add a policy that allows all access
-- ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all access to admin_users" ON admin_users FOR ALL USING (true);
