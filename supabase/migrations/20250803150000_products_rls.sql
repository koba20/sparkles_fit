-- Add RLS policies for products table to allow admin operations

-- Allow admin users to insert products
CREATE POLICY "Admin users can insert products"
ON public.products FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.email = current_setting('request.headers.x-admin-token', true)::text
));

-- Allow admin users to update products
CREATE POLICY "Admin users can update products"
ON public.products FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.email = current_setting('request.headers.x-admin-token', true)::text
));

-- Allow admin users to delete products
CREATE POLICY "Admin users can delete products"
ON public.products FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.email = current_setting('request.headers.x-admin-token', true)::text
));