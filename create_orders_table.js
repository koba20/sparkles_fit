import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ogbinybtbasmkvagvgai.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nYmlueWJ0YmFzbWt2YWd2Z2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0ODUyNTUsImV4cCI6MjA2OTA2MTI1NX0.QmOLiZTU0NqUNPdZZXWDFSjiO0qIcLLQZkeAXGWA_w8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createOrdersTable() {
  console.log('🚀 Creating orders table...');

  try {
    // Use the rpc function to execute SQL
    const { data, error } = await supabase.rpc('create_orders_table', {
      sql_query: `
        -- Create orders table
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
      `
    });

    if (error) {
      console.error('Error creating orders table:', error);
    } else {
      console.log('✅ Orders table created successfully!');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createOrdersTable();