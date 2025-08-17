-- Temporarily disable RLS to create admin user
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Create admin user with hashed password
INSERT INTO public.admin_users (
  email,
  password_hash,
  first_name,
  last_name,
  role,
  is_active
) VALUES (
  'admin@xivttw.com',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  'Admin',
  'User',
  'super_admin',
  true
);

-- Re-enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

