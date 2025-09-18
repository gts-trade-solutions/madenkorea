-- Create storage buckets for product images
INSERT INTO storage.buckets (id, name, public) VALUES 
('product-images', 'product-images', true),
('bulk-uploads', 'bulk-uploads', true);

-- Create storage policies for product images
CREATE POLICY "Anyone can view product images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update their product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete their product images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Create policies for bulk uploads
CREATE POLICY "Authenticated users can view bulk uploads" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'bulk-uploads' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload bulk files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'bulk-uploads' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update bulk uploads" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'bulk-uploads' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete bulk uploads" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'bulk-uploads' AND auth.uid() IS NOT NULL);