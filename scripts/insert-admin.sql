-- Insert default admin user (email: admin@example.com, password: admin123)
INSERT INTO admin_users (email, password_hash) VALUES
  ('admin@example.com', 'admin123')
ON CONFLICT (email) DO NOTHING;
