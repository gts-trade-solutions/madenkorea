-- Create products table for comprehensive product management
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL UNIQUE, -- This will be the main identifier for mapping
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  keywords TEXT,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  product_code TEXT,
  size TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  cost_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2),
  discount_percentage INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  weight DECIMAL(8,2),
  dimensions JSONB, -- {length, width, height}
  ingredients TEXT,
  how_to_use TEXT,
  benefits TEXT,
  skin_type TEXT[],
  age_group TEXT,
  gender TEXT DEFAULT 'unisex',
  country_of_origin TEXT DEFAULT 'South Korea',
  manufacturing_date DATE,
  expiry_date DATE,
  safety_information TEXT,
  tags TEXT[],
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_media table for images and videos mapped by Product ID
CREATE TABLE public.product_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  media_type TEXT NOT NULL, -- 'image', 'video', 'document'
  media_url TEXT NOT NULL,
  alt_text TEXT,
  title TEXT,
  description TEXT,
  position INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_variants table for different product variations
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  variant_value TEXT NOT NULL,
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_reviews table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  user_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage products" ON public.products FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view product media" ON public.product_media FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage product media" ON public.product_media FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view active variants" ON public.product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage variants" ON public.product_variants FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Authenticated users can manage reviews" ON public.product_reviews FOR ALL USING (auth.uid() IS NOT NULL);

-- Create triggers for timestamps
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_products_product_id ON public.products(product_id);
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_product_media_product_id ON public.product_media(product_id);
CREATE INDEX idx_product_media_type ON public.product_media(media_type);
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);

-- Insert sample products
INSERT INTO public.products (product_id, name, slug, description, brand, category, cost_price, selling_price, stock_quantity, is_featured) VALUES
('COSRX-001', 'Advanced Snail 96 Mucin Power Essence', 'cosrx-advanced-snail-essence', 'Lightweight essence containing snail secretion filtrate to hydrate and repair damaged skin', 'COSRX', 'Skin Care', 1199.00, 1599.00, 45, true),
('LANEIGE-001', 'Water Bank Blue Hyaluronic Cream', 'laneige-water-bank-cream', 'Intensive moisturizing cream with blue hyaluronic acid', 'LANEIGE', 'Skin Care', 2499.00, 3299.00, 32, true),
('INNISFREE-001', 'Green Tea Hydrating Amino Acid Cleansing Foam', 'innisfree-green-tea-cleanser', 'Gentle cleansing foam enriched with green tea from Jeju Island', 'INNISFREE', 'Skin Care', 699.00, 999.00, 28, false);

-- Insert sample media
INSERT INTO public.product_media (product_id, media_type, media_url, alt_text, is_primary, position) VALUES
('COSRX-001', 'image', '/lovable-uploads/cosrx-snail-essence.jpg', 'COSRX Advanced Snail Essence front view', true, 1),
('COSRX-001', 'image', '/lovable-uploads/cosrx-snail-essence-back.jpg', 'COSRX Advanced Snail Essence back view', false, 2),
('COSRX-001', 'video', 'https://youtube.com/embed/skincare-routine', 'How to use COSRX Snail Essence', false, 3),
('LANEIGE-001', 'image', '/lovable-uploads/laneige-water-bank.jpg', 'LANEIGE Water Bank Cream', true, 1),
('INNISFREE-001', 'image', '/lovable-uploads/innisfree-green-tea.jpg', 'INNISFREE Green Tea Cleanser', true, 1);