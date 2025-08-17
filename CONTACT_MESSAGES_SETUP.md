# Contact Messages Setup Guide

## Overview

This project uses Supabase as its database provider. The application requires a `contact_messages` table to be set up correctly for storing and displaying contact form submissions in the admin dashboard.

## Issue: "relation 'public.contact_messages' does not exist"

If you encounter an error message like `relation "public.contact_messages" does not exist` when trying to submit a contact form or view messages in the admin dashboard, it means that the database migration has not been properly applied to create the necessary table.

## Solution

### Option 1: Apply Migration via Supabase Dashboard (Recommended)

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project (ogbinybtbasmkvagvgai)
3. Go to the SQL Editor
4. Copy and paste the following SQL code:

```sql
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
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON public.contact_messages (read);
```

5. Click "Run" to execute the SQL statements

### Option 2: Check Table Existence

To verify that the `contact_messages` table has been created correctly, you can run the following SQL query in the Supabase SQL Editor:

```sql
SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_messages';
```

If the table exists, this query will return a row with information about the `contact_messages` table.

## Troubleshooting

If you continue to experience issues with the database setup, please check the following:

1. Ensure that you have the correct Supabase project selected (ogbinybtbasmkvagvgai)
2. Verify that you have the necessary permissions to create tables in the database
3. Check the Supabase logs for any error messages
4. Make sure that the SQL statements are executed in the correct order

If you need further assistance, please contact the project administrator.