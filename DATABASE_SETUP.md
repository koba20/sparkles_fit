# Database Setup Guide

## Overview

This project uses Supabase as its database provider. The application requires several tables to be set up correctly, including an `orders` table for processing payments and storing order information.

## Issue: "relation 'public.orders' does not exist"

If you encounter an error message like `Database error: relation "public.orders" does not exist` when trying to checkout, it means that the database migrations have not been properly applied to create the necessary tables.

## Solution

### Option 1: Apply Migrations via Supabase Dashboard

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to the SQL Editor
4. Copy the contents of the following migration files and execute them in order:
   - `supabase/migrations/20250101000000_create_orders_table.sql`
   - `supabase/migrations/20250102000000_add_payment_fields.sql`

### Option 2: Apply Migrations via Script

We've created a script to apply the migrations directly. Follow these steps:

1. Make sure you have Node.js installed
2. Open a terminal in the project root directory
3. Run the following command:

```bash
node apply_orders_migration.js
```

### Option 3: Manual Table Creation

If the above options don't work, you can manually create the `orders` table by executing the following SQL in the Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip_code TEXT NOT NULL,
  shipping_country TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  payment_url TEXT,
  payment_status TEXT,
  special_instructions TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on customer email for quick lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Create index on payment_reference
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON public.orders(payment_reference);

-- Create index on payment_status
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders table
-- Allow all operations for admin users
CREATE POLICY "Allow admin users to manage orders" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Allow public to insert orders (for checkout)
CREATE POLICY "Allow public to insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_orders_updated_at();
```

## Verifying the Setup

To verify that the `orders` table has been created correctly, you can run the following SQL query in the Supabase SQL Editor:

```sql
SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders';
```

If the table exists, this query will return a row with information about the `orders` table.

## Troubleshooting

If you continue to experience issues with the database setup, please check the following:

1. Ensure that you have the correct Supabase project selected
2. Verify that you have the necessary permissions to create tables in the database
3. Check the Supabase logs for any error messages
4. Make sure that the SQL statements are executed in the correct order

If you need further assistance, please contact the project administrator.