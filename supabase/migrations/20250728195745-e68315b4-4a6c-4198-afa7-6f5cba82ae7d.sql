-- Create categories table for CMS management
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT,
  color_theme TEXT DEFAULT '#000000',
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  position INTEGER DEFAULT 0,
  product_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create videos table for CMS management
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  video_type TEXT NOT NULL DEFAULT 'hero', -- hero, promotional, tutorial, testimonial
  is_active BOOLEAN NOT NULL DEFAULT true,
  position INTEGER DEFAULT 0,
  duration INTEGER, -- in seconds
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site_settings table for global content management
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type TEXT NOT NULL DEFAULT 'text', -- text, json, number, boolean, image, video
  description TEXT,
  category TEXT DEFAULT 'general', -- general, header, footer, home, seo
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create media_library table for asset management
CREATE TABLE public.media_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- image, video, document
  mime_type TEXT NOT NULL,
  file_size INTEGER, -- in bytes
  alt_text TEXT,
  description TEXT,
  tags TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage categories" ON public.categories FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view active videos" ON public.videos FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage videos" ON public.videos FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view active site settings" ON public.site_settings FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage site settings" ON public.site_settings FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view active media" ON public.media_library FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage media" ON public.media_library FOR ALL USING (auth.uid() IS NOT NULL);

-- Create triggers for timestamps
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_media_library_updated_at BEFORE UPDATE ON public.media_library FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample categories
INSERT INTO public.categories (name, slug, description, icon_name, color_theme, position) VALUES
('Skin Care', 'skin-care', 'Complete skincare routine products', 'Droplets', '#3b82f6', 1),
('Make Up', 'make-up', 'Consumer Innovations cosmetics and makeup', 'Sparkles', '#ec4899', 2),
('Hair Care', 'hair-care', 'Hair treatments and styling products', 'Star', '#8b5cf6', 3),
('Body Care', 'body-care', 'Full body wellness products', 'Heart', '#22c55e', 4),
('Men Care', 'men-care', 'Grooming essentials for men', 'Shield', '#64748b', 5),
('Beauty Tools', 'beauty-tools', 'Professional beauty tools and accessories', 'Zap', '#f59e0b', 6),
('Health & Personal Care', 'health-personal-care', 'Health and wellness products', 'Plus', '#10b981', 7),
('Perfume & Deodorant', 'perfume-deodorant', 'Fragrances and personal care', 'Flower', '#f97316', 8),
('Life & Home', 'life-home', 'Lifestyle and home products', 'Home', '#6366f1', 9),
('Baby', 'baby', 'Baby care and safety products', 'Baby', '#f472b6', 10),
('K-POP', 'k-pop', 'Celebrity endorsed Consumer Innovations products', 'Star', '#fbbf24', 11),
('Exclusive', 'exclusive', 'Limited edition and exclusive items', 'Crown', '#dc2626', 12);

-- Insert sample site settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description, category) VALUES
('site_title', 'Consumer Innovations Store | Authentic Korean Beauty Products', 'text', 'Main site title', 'seo'),
('site_description', 'Discover the best Korean beauty products. Shop authentic Consumer Innovations skincare, makeup, and more from top Korean brands.', 'text', 'Site meta description', 'seo'),
('footer_about_text', 'Your trusted source for authentic Korean beauty products. We bring you the latest Consumer Innovations trends and innovations.', 'text', 'Footer about section text', 'footer'),
('contact_email', 'hello@kbeautystore.com', 'text', 'Contact email address', 'general'),
('contact_phone', '+1 (555) 123-4567', 'text', 'Contact phone number', 'general'),
('shipping_text', 'Free shipping on orders over $50', 'text', 'Shipping promotion text', 'general'),
('return_policy', '30-day return policy', 'text', 'Return policy text', 'general'),
('hero_title', 'Discover Authentic Consumer Innovations', 'text', 'Main hero section title', 'home'),
('hero_subtitle', 'Transform your skincare routine with premium Korean beauty products', 'text', 'Hero section subtitle', 'home');

-- Insert sample videos
INSERT INTO public.videos (title, description, video_url, video_type, position) VALUES
('Consumer Innovations Hero Video', 'Main promotional video showcasing our products', 'https://example.com/hero-video.mp4', 'hero', 1),
('Skincare Routine Tutorial', 'Step-by-step Korean skincare routine', 'https://example.com/tutorial.mp4', 'tutorial', 2),
('Customer Testimonials', 'Real customer reviews and experiences', 'https://example.com/testimonials.mp4', 'testimonial', 3);