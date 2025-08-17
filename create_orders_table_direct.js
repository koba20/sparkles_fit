import fetch from 'node-fetch';

const SUPABASE_URL = 'https://ogbinybtbasmkvagvgai.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nYmlueWJ0YmFzbWt2YWd2Z2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0ODUyNTUsImV4cCI6MjA2OTA2MTI1NX0.QmOLiZTU0NqUNPdZZXWDFSjiO0qIcLLQZkeAXGWA_w8';

async function createOrdersTable() {
  console.log('🚀 Creating orders table directly...');

  const sql = `
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
  `;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'params=single-object'
      },
      body: JSON.stringify({ query: sql })
    });

    const result = await response.text();
    
    if (response.ok) {
      console.log('✅ Orders table created successfully!');
      console.log(result);
    } else {
      console.error('❌ Error creating orders table:', response.status, result);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createOrdersTable();