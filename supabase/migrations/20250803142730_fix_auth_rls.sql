-- Drop existing RLS policies that are too restrictive
DROP POLICY IF EXISTS "Admin users can view their own profile" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can update their own profile" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can view their own sessions" ON public.admin_sessions;
DROP POLICY IF EXISTS "Admin users can insert their own sessions" ON public.admin_sessions;
DROP POLICY IF EXISTS "Admin users can delete their own sessions" ON public.admin_sessions;

-- Create more permissive policies for authentication
CREATE POLICY "Allow admin authentication" 
ON public.admin_users FOR SELECT 
USING (true);

CREATE POLICY "Allow admin user updates" 
ON public.admin_users FOR UPDATE 
USING (true);

CREATE POLICY "Allow session management" 
ON public.admin_sessions FOR ALL 
USING (true);

-- Create admin user if it doesn't exist
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
) ON CONFLICT (email) DO NOTHING;

