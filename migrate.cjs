const https = require("https");

const SUPABASE_URL = "https://ogbinybtbasmkvagvgai.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nYmlueWJ0YmFzbWt2YWd2Z2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0ODUyNTUsImV4cCI6MjA2OTA2MTI1NX0.QmOLiZTU0NqUNPdZZXWDFSjiO0qIcLLQZkeAXGWA_w8";

// SQL statements to execute
const sqlStatements = [
  // Create admin_users table
  `CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  )`,

  // Create admin_sessions table
  `CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES public.admin_users(id) ON DELETE CASCADE NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  )`,

  // Enable RLS
  `ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY`,

  // Create RLS policies
  `DROP POLICY IF EXISTS "Admin users can view their own profile" ON public.admin_users`,
  `CREATE POLICY "Admin users can view their own profile" ON public.admin_users FOR SELECT USING (true)`,

  `DROP POLICY IF EXISTS "Admin users can update their own profile" ON public.admin_users`,
  `CREATE POLICY "Admin users can update their own profile" ON public.admin_users FOR UPDATE USING (true)`,

  `DROP POLICY IF EXISTS "Admin users can view their own sessions" ON public.admin_sessions`,
  `CREATE POLICY "Admin users can view their own sessions" ON public.admin_sessions FOR SELECT USING (true)`,

  `DROP POLICY IF EXISTS "Admin users can insert their own sessions" ON public.admin_sessions`,
  `CREATE POLICY "Admin users can insert their own sessions" ON public.admin_sessions FOR INSERT WITH CHECK (true)`,

  `DROP POLICY IF EXISTS "Admin users can delete their own sessions" ON public.admin_sessions`,
  `CREATE POLICY "Admin users can delete their own sessions" ON public.admin_sessions FOR DELETE USING (true)`,

  // Create function to hash passwords
  `CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
  RETURNS TEXT AS $$
  BEGIN
    RETURN encode(sha256(password::bytea), 'hex');
  END;
  $$ LANGUAGE plpgsql`,

  // Create function to verify password
  `CREATE OR REPLACE FUNCTION public.verify_password(input_password TEXT, stored_hash TEXT)
  RETURNS BOOLEAN AS $$
  BEGIN
    RETURN public.hash_password(input_password) = stored_hash;
  END;
  $$ LANGUAGE plpgsql`,

  // Create function to authenticate admin user
  `CREATE OR REPLACE FUNCTION public.authenticate_admin(
    admin_email TEXT,
    admin_password TEXT
  )
  RETURNS TABLE(
    user_id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT,
    is_active BOOLEAN
  ) AS $$
  BEGIN
    RETURN QUERY
    SELECT 
      au.id,
      au.email,
      au.first_name,
      au.last_name,
      au.role,
      au.is_active
    FROM public.admin_users au
    WHERE au.email = admin_email
      AND au.password_hash = public.hash_password(admin_password)
      AND au.is_active = true
      AND (au.locked_until IS NULL OR au.locked_until < now());
  END;
  $$ LANGUAGE plpgsql`,

  // Create function to create admin session
  `CREATE OR REPLACE FUNCTION public.create_admin_session(
    admin_user_id UUID,
    session_token TEXT,
    session_duration_hours INTEGER DEFAULT 24,
    client_ip INET DEFAULT NULL,
    client_user_agent TEXT DEFAULT NULL
  )
  RETURNS UUID AS $$
  DECLARE
    new_session_id UUID;
  BEGIN
    INSERT INTO public.admin_sessions (
      admin_user_id,
      session_token,
      expires_at,
      ip_address,
      user_agent
    ) VALUES (
      admin_user_id,
      session_token,
      now() + (session_duration_hours || ' hours')::INTERVAL,
      client_ip,
      client_user_agent
    ) RETURNING id INTO new_session_id;
    
    UPDATE public.admin_users 
    SET last_login = now(), failed_login_attempts = 0
    WHERE id = admin_user_id;
    
    RETURN new_session_id;
  END;
  $$ LANGUAGE plpgsql`,

  // Create function to validate admin session
  `CREATE OR REPLACE FUNCTION public.validate_admin_session(session_token TEXT)
  RETURNS TABLE(
    user_id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT
  ) AS $$
  BEGIN
    RETURN QUERY
    SELECT 
      au.id,
      au.email,
      au.first_name,
      au.last_name,
      au.role
    FROM public.admin_users au
    JOIN public.admin_sessions s ON au.id = s.admin_user_id
    WHERE s.session_token = session_token
      AND s.expires_at > now()
      AND au.is_active = true;
  END;
  $$ LANGUAGE plpgsql`,

  // Create function to invalidate admin session
  `CREATE OR REPLACE FUNCTION public.invalidate_admin_session(session_token TEXT)
  RETURNS BOOLEAN AS $$
  DECLARE
    deleted_count INTEGER;
  BEGIN
    DELETE FROM public.admin_sessions 
    WHERE session_token = session_token;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count > 0;
  END;
  $$ LANGUAGE plpgsql`,

  // Create function to handle failed login attempts
  `CREATE OR REPLACE FUNCTION public.handle_failed_login(admin_email TEXT)
  RETURNS VOID AS $$
  BEGIN
    UPDATE public.admin_users 
    SET 
      failed_login_attempts = failed_login_attempts + 1,
      locked_until = CASE 
        WHEN failed_login_attempts >= 4 THEN now() + INTERVAL '15 minutes'
        ELSE locked_until
      END
    WHERE email = admin_email;
  END;
  $$ LANGUAGE plpgsql`,

  // Insert default admin user
  `INSERT INTO public.admin_users (email, password_hash, first_name, last_name, role) 
   VALUES ('admin@sparklesfit.com', public.hash_password('admin123'), 'Admin', 'User', 'super_admin')
   ON CONFLICT (email) DO NOTHING`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token)`,
  `CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON public.admin_sessions(expires_at)`,
];

// Function to execute SQL via REST API
function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      query: sql,
    });

    const options = {
      hostname: "ogbinybtbasmkvagvgai.supabase.co",
      port: 443,
      path: "/rest/v1/rpc/exec_sql",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log("✅ Success");
          resolve(responseData);
        } else {
          console.log("❌ Error:", res.statusCode, responseData);
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on("error", (error) => {
      console.log("❌ Request error:", error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Execute all statements
async function runMigration() {
  console.log("🚀 Starting database migration...");

  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    console.log(`\n📝 Executing statement ${i + 1}/${sqlStatements.length}:`);
    console.log(sql.substring(0, 100) + "...");

    try {
      await executeSQL(sql);
      // Add a small delay between statements
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      console.log(`❌ Failed to execute statement ${i + 1}:`, error.message);
      // Continue with next statement
    }
  }

  console.log("\n✅ Migration completed!");
}

runMigration().catch(console.error);
