-- Create brands table for CMS management
CREATE TABLE public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  website_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  position INTEGER DEFAULT 0,
  color_theme TEXT DEFAULT '#000000',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Create policies for brands
CREATE POLICY "Anyone can view active brands" 
ON public.brands 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can manage brands" 
ON public.brands 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create trigger for timestamps
CREATE TRIGGER update_brands_updated_at
BEFORE UPDATE ON public.brands
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample brands
INSERT INTO public.brands (name, logo_url, description, website_url, is_featured, color_theme, position) VALUES
('COSRX', null, 'Science-backed skincare solutions', 'https://cosrx.com', true, '#ff4444', 1),
('INNISFREE', null, 'Natural beauty from Jeju Island', 'https://innisfree.com', true, '#22c55e', 2),
('LANEIGE', null, 'Premium Korean skincare and makeup', 'https://laneige.com', true, '#3b82f6', 3),
('ETUDE HOUSE', null, 'Fun and playful Korean beauty', 'https://etudehouse.com', true, '#ec4899', 4),
('BEAUTY OF JOSEON', null, 'Traditional Korean beauty secrets', 'https://beautyofjoseon.com', true, '#f59e0b', 5),
('SOME BY MI', null, 'Bye Bye Blackhead', 'https://somebymi.com', true, '#8b5cf6', 6);