-- Create CMS tables for homepage banners, static pages, and product management

-- Homepage banners table
CREATE TABLE public.homepage_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  cta_text TEXT,
  cta_link TEXT,
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#000000',
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  banner_type TEXT DEFAULT 'promotional' CHECK (banner_type IN ('promotional', 'hero', 'secondary')),
  animation_speed INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Static pages table for terms, privacy policy, etc.
CREATE TABLE public.static_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Product editorial flags and features
CREATE TABLE public.product_editorial (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  featured_position INTEGER,
  editorial_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

-- Enable RLS on all tables
ALTER TABLE public.homepage_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_editorial ENABLE ROW LEVEL SECURITY;

-- Policies for homepage_banners (public read, admin write)
CREATE POLICY "Anyone can view active banners" 
ON public.homepage_banners 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can manage banners" 
ON public.homepage_banners 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Policies for static_pages (public read published, admin write)
CREATE POLICY "Anyone can view published pages" 
ON public.static_pages 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Authenticated users can manage pages" 
ON public.static_pages 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Policies for product_editorial (public read, admin write)
CREATE POLICY "Anyone can view product editorial data" 
ON public.product_editorial 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage product editorial" 
ON public.product_editorial 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_homepage_banners_updated_at
BEFORE UPDATE ON public.homepage_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_static_pages_updated_at
BEFORE UPDATE ON public.static_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_editorial_updated_at
BEFORE UPDATE ON public.product_editorial
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default homepage banner
INSERT INTO public.homepage_banners (title, subtitle, description, cta_text, cta_link, banner_type, position)
VALUES (
  '🔥 GRAND OPENING SALE: BUY 2 GET 2 FREE ON ALL Consumer Innovations PRODUCTS | FREE SHIPPING ON ORDERS ₹1999+ | USE CODE: WELCOME20 🔥',
  '',
  '',
  '',
  '',
  'promotional',
  1
);

-- Insert default static pages
INSERT INTO public.static_pages (slug, title, content, is_published)
VALUES 
(
  'terms-and-conditions',
  'Terms and Conditions',
  '<h1>Terms and Conditions</h1><p>Welcome to Made in Korea. These terms and conditions outline the rules and regulations for the use of our website.</p><h2>Acceptance of Terms</h2><p>By accessing this website, we assume you accept these terms and conditions.</p>',
  true
),
(
  'privacy-policy',
  'Privacy Policy',
  '<h1>Privacy Policy</h1><p>Your privacy is important to us. This privacy policy explains how we collect, use, and protect your information.</p><h2>Information We Collect</h2><p>We collect information you provide directly to us and information we collect automatically.</p>',
  true
),
(
  'shipping-info',
  'Shipping Information',
  '<h1>Shipping Information</h1><p>We offer fast and reliable shipping across India for all Consumer Innovations products.</p><h2>Shipping Times</h2><p>Standard shipping: 3-5 business days<br>Express shipping: 1-2 business days</p>',
  true
),
(
  'returns',
  'Returns & Exchanges',
  '<h1>Returns & Exchanges</h1><p>We want you to be completely satisfied with your purchase.</p><h2>Return Policy</h2><p>Items can be returned within 30 days of purchase in original condition.</p>',
  true
);