-- Update existing contact info to footer category and add missing ones
UPDATE site_settings SET category = 'footer', description = 'Contact phone number' WHERE setting_key = 'contact_phone';
UPDATE site_settings SET category = 'footer', description = 'Contact email address' WHERE setting_key = 'contact_email';

-- Add contact_phone and contact_email to footer category if they don't exist
INSERT INTO site_settings (setting_key, setting_value, setting_type, category, description, is_active) VALUES 
('contact_phone', '+91 98765 43210', 'text', 'footer', 'Contact phone number', true),
('contact_email', 'hello@madeinkorea.in', 'text', 'footer', 'Contact email address', true)
ON CONFLICT (setting_key) DO UPDATE SET 
category = 'footer',
description = EXCLUDED.description;