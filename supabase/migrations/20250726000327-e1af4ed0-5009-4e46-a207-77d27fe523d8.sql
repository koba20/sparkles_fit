-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  gallery_urls TEXT[],
  sizes TEXT[],
  colors TEXT[],
  stock_quantity INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cart_items table
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest users
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

-- RLS Policies for products (public read)
CREATE POLICY "Products are viewable by everyone" 
ON public.products FOR SELECT USING (true);

-- RLS Policies for cart_items
CREATE POLICY "Users can view their own cart items" 
ON public.cart_items FOR SELECT 
USING (auth.uid() = user_id OR (auth.uid() IS NULL AND session_id IS NOT NULL));

CREATE POLICY "Users can insert their own cart items" 
ON public.cart_items FOR INSERT 
WITH CHECK (auth.uid() = user_id OR (auth.uid() IS NULL AND session_id IS NOT NULL));

CREATE POLICY "Users can update their own cart items" 
ON public.cart_items FOR UPDATE 
USING (auth.uid() = user_id OR (auth.uid() IS NULL AND session_id IS NOT NULL));

CREATE POLICY "Users can delete their own cart items" 
ON public.cart_items FOR DELETE 
USING (auth.uid() = user_id OR (auth.uid() IS NULL AND session_id IS NOT NULL));

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed categories
INSERT INTO public.categories (name, slug, description, image_url) VALUES
('Apparel', 'apparel', 'Premium streetwear and clothing', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=600&fit=crop'),
('Accessories', 'accessories', 'Luxury accessories and lifestyle items', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop'),
('Footwear', 'footwear', 'Premium shoes and sneakers', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop'),
('Home', 'home', 'Home decor and lifestyle products', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop');

-- Seed products
INSERT INTO public.products (name, slug, description, price, compare_price, category_id, image_url, gallery_urls, sizes, colors, stock_quantity, featured) VALUES
-- Apparel
('BLVCK Signature Hoodie', 'blvck-signature-hoodie', 'Premium cotton hoodie with BLVCK branding', 129.99, 159.99, (SELECT id FROM public.categories WHERE slug = 'apparel'), 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop', ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop'], ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], ARRAY['Black', 'White'], 50, true),

('Minimal Tee', 'minimal-tee', 'Essential black t-shirt with subtle branding', 39.99, 49.99, (SELECT id FROM public.categories WHERE slug = 'apparel'), 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop', ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop'], ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black'], 100, true),

('Oversized Bomber', 'oversized-bomber', 'Luxury oversized bomber jacket', 249.99, 299.99, (SELECT id FROM public.categories WHERE slug = 'apparel'), 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop', ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'Charcoal'], 25, false),

('Street Cargo Pants', 'street-cargo-pants', 'Technical cargo pants with multiple pockets', 89.99, 119.99, (SELECT id FROM public.categories WHERE slug = 'apparel'), 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=800&fit=crop', ARRAY['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=800&fit=crop'], ARRAY['28', '30', '32', '34', '36'], ARRAY['Black', 'Olive'], 40, false),

-- Accessories
('BLVCK Cap', 'blvck-cap', 'Premium 6-panel cap with embroidered logo', 49.99, 59.99, (SELECT id FROM public.categories WHERE slug = 'accessories'), 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=800&fit=crop', ARRAY['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=800&fit=crop'], ARRAY['One Size'], ARRAY['Black'], 75, true),

('Leather Wallet', 'leather-wallet', 'Minimalist leather bifold wallet', 79.99, 99.99, (SELECT id FROM public.categories WHERE slug = 'accessories'), 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=800&fit=crop', ARRAY['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=800&fit=crop'], ARRAY['One Size'], ARRAY['Black'], 30, false),

-- Footwear
('Black Sneakers', 'black-sneakers', 'Premium leather low-top sneakers', 189.99, 229.99, (SELECT id FROM public.categories WHERE slug = 'footwear'), 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop', ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop'], ARRAY['7', '8', '9', '10', '11', '12'], ARRAY['Black'], 60, true),

('High-Top Boots', 'high-top-boots', 'Luxury leather high-top boots', 299.99, 349.99, (SELECT id FROM public.categories WHERE slug = 'footwear'), 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5b?w=800&h=800&fit=crop', ARRAY['https://images.unsplash.com/photo-1544966503-7cc5ac882d5b?w=800&h=800&fit=crop'], ARRAY['7', '8', '9', '10', '11', '12'], ARRAY['Black'], 20, false),

-- Home
('Ceramic Mug', 'ceramic-mug', 'Minimalist black ceramic mug', 24.99, 29.99, (SELECT id FROM public.categories WHERE slug = 'home'), 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=800&h=800&fit=crop', ARRAY['https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=800&h=800&fit=crop'], ARRAY['One Size'], ARRAY['Black'], 200, false),

('Minimalist Poster', 'minimalist-poster', 'Abstract black and white art print', 34.99, 44.99, (SELECT id FROM public.categories WHERE slug = 'home'), 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop', ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop'], ARRAY['A3', 'A2', 'A1'], ARRAY['Black & White'], 100, false);