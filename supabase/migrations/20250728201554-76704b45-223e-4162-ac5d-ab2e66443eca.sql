-- Add support for hierarchical categories with subcategories
ALTER TABLE public.categories 
ADD COLUMN parent_id TEXT REFERENCES public.categories(slug),
ADD COLUMN level INTEGER DEFAULT 0,
ADD COLUMN has_children BOOLEAN DEFAULT false;

-- Update existing categories to be top-level
UPDATE public.categories SET level = 0 WHERE level IS NULL;

-- Create some subcategories for demonstration
INSERT INTO public.categories (name, slug, description, icon_name, color_theme, parent_id, level, position) VALUES
('Face Cleansers', 'face-cleansers', 'Facial cleansing products', 'Droplets', '#3b82f6', 'skin-care', 1, 1),
('Serums & Essences', 'serums-essences', 'Concentrated treatments', 'Sparkles', '#8b5cf6', 'skin-care', 1, 2),
('Moisturizers', 'moisturizers', 'Hydrating creams and lotions', 'Heart', '#22c55e', 'skin-care', 1, 3),
('Eye Makeup', 'eye-makeup', 'Mascara, eyeliner, eyeshadow', 'Eye', '#ec4899', 'make-up', 1, 1),
('Lip Products', 'lip-products', 'Lipstick, gloss, balm', 'Cherry', '#f97316', 'make-up', 1, 2),

-- Add sub-subcategories
('Foam Cleansers', 'foam-cleansers', 'Foaming face cleansers', 'Droplets', '#3b82f6', 'face-cleansers', 2, 1),
('Oil Cleansers', 'oil-cleansers', 'Oil-based cleansers', 'Droplets', '#3b82f6', 'face-cleansers', 2, 2),
('Vitamin C Serums', 'vitamin-c-serums', 'Brightening vitamin C treatments', 'Sun', '#fbbf24', 'serums-essences', 2, 1),
('Hyaluronic Serums', 'hyaluronic-serums', 'Hydrating hyaluronic acid serums', 'Droplets', '#06b6d4', 'serums-essences', 2, 2);

-- Update parent categories to mark they have children
UPDATE public.categories SET has_children = true WHERE slug IN ('skin-care', 'make-up', 'face-cleansers', 'serums-essences');