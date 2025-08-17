-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  read BOOLEAN DEFAULT false NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users to read all messages
CREATE POLICY "Admin users can read all contact messages" 
  ON public.contact_messages 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.email = auth.email()));

-- Create policy for admin users to update messages (mark as read)
CREATE POLICY "Admin users can update contact messages" 
  ON public.contact_messages 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.email = auth.email()));

-- Create policy for anonymous users to insert messages
CREATE POLICY "Anyone can submit contact messages" 
  ON public.contact_messages 
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages (created_at DESC);
CREATE INDEX idx_contact_messages_read ON public.contact_messages (read);