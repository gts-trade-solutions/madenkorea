-- Add footer content settings to CMS
INSERT INTO public.site_settings (setting_key, setting_value, category, description) VALUES
  ('footer_about_title', 'ABOUT', 'footer', 'Footer About section title'),
  ('footer_about_text', 'Made in Korea is your one-stop shop for the trendiest Asian fashion and beauty products. We offer an affordable, wide selection worldwide, plus the latest tips and secrets in beauty and styling.', 'footer', 'Footer About section content'),
  ('footer_about_korea_title', 'ABOUT MADE IN KOREA', 'footer', 'Footer About Made in Korea section title'),
  ('footer_terms_conditions', 'Terms & Conditions', 'footer', 'Terms & Conditions link text'),
  ('footer_privacy_policy', 'Privacy Policy', 'footer', 'Privacy Policy link text'),
  ('footer_address', 'Address: D3, Tulash Garden, 3rd Street, Baby Nagar, Velachery, Chennai 600042', 'footer', 'Company address'),
  ('footer_customer_care_title', 'CUSTOMER CARE', 'footer', 'Customer Care section title'),
  ('footer_faqs', 'Frequently Asked Questions (FAQs)', 'footer', 'FAQs link text'),
  ('footer_disclaimer_title', 'DISCLAIMER', 'footer', 'Disclaimer section title'),
  ('footer_disclaimer_text', 'We are solely a reseller of Korean beauty products and have no involvement in their formulation or manufacturing. Responsibility lies with the original brands. Customers should review details and consult professionals if needed.', 'footer', 'Disclaimer text'),
  ('footer_site_credit', 'This Site is Developed for Dr KIM ESTHER HYANG SOOK, CEO INKOMO', 'footer', 'Site development credit'),
  ('footer_logo_alt', 'Made in Korea', 'footer', 'Footer logo alt text')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = now();