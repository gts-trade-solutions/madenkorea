-- Add missing footer settings to the site_settings table
INSERT INTO site_settings (setting_key, setting_value, setting_type, category, description, is_active) VALUES 
-- Newsletter settings
('newsletter_title', 'Stay Updated with Consumer Innovations Trends', 'text', 'footer', 'Newsletter section title', true),
('newsletter_description', 'Get exclusive offers, new product launches, and skincare tips directly in your inbox', 'text', 'footer', 'Newsletter section description', true),

-- Company information
('company_name', 'Consumer Innovations', 'text', 'footer', 'Company name displayed in footer', true),
('company_description', 'Your premier destination for authentic Korean beauty products. We bring you the finest Consumer Innovations innovations directly from Korea.', 'text', 'footer', 'Company description in footer', true),

-- Contact information (move to footer category)
('contact_address', '123 Consumer Innovations Street
Mumbai, Maharashtra 400001
India', 'text', 'footer', 'Company address', true),

-- Social media links
('social_facebook', 'https://facebook.com/kbeautystore', 'text', 'footer', 'Facebook URL', true),
('social_instagram', 'https://instagram.com/kbeautystore', 'text', 'footer', 'Instagram URL', true),
('social_twitter', 'https://twitter.com/kbeautystore', 'text', 'footer', 'Twitter URL', true),
('social_youtube', 'https://youtube.com/@kbeautystore', 'text', 'footer', 'YouTube URL', true),

-- Quick links
('quick_link_about', '/about-us', 'text', 'footer', 'About Us page URL', true),
('quick_link_guide', '/Consumer Innovations-guide', 'text', 'footer', 'Consumer Innovations Guide page URL', true),
('quick_link_analysis', '/skin-analysis', 'text', 'footer', 'Skin Analysis page URL', true),
('quick_link_brands', '/brand-stories', 'text', 'footer', 'Brand Stories page URL', true),
('quick_link_reviews', '/reviews', 'text', 'footer', 'Reviews page URL', true),
('quick_link_blog', '/blog', 'text', 'footer', 'Blog page URL', true),

-- Category links
('category_skincare', '/products?category=skincare', 'text', 'footer', 'Skincare category URL', true),
('category_masks', '/products?category=sheet-masks', 'text', 'footer', 'Sheet Masks category URL', true),
('category_serums', '/products?category=serums', 'text', 'footer', 'Serums category URL', true),
('category_cleansers', '/products?category=cleansers', 'text', 'footer', 'Cleansers category URL', true),
('category_sunscreens', '/products?category=sunscreens', 'text', 'footer', 'Sunscreens category URL', true),
('category_makeup', '/products?category=k-makeup', 'text', 'footer', 'K-Makeup category URL', true),

-- Copyright
('copyright_text', 'for Consumer Innovations lovers © 2024 Made in Korea. All rights reserved.', 'text', 'footer', 'Copyright text (heart icon added automatically)', true)

ON CONFLICT (setting_key) DO UPDATE SET 
setting_value = EXCLUDED.setting_value,
category = EXCLUDED.category,
description = EXCLUDED.description;