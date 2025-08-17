-- Add payment fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS payment_url TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Create index on payment reference for quick lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON orders(payment_reference);

-- Create index on payment status for filtering
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);