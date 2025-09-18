-- Create storage policies for bulk-uploads and product-images buckets

-- Policies for bulk-uploads bucket
CREATE POLICY "Allow public uploads to bulk-uploads bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'bulk-uploads');

CREATE POLICY "Allow public reads from bulk-uploads bucket" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'bulk-uploads');

CREATE POLICY "Allow public updates to bulk-uploads bucket" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'bulk-uploads');

CREATE POLICY "Allow public deletes from bulk-uploads bucket" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'bulk-uploads');

-- Policies for product-images bucket
CREATE POLICY "Allow public uploads to product-images bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow public reads from product-images bucket" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Allow public updates to product-images bucket" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images');

CREATE POLICY "Allow public deletes from product-images bucket" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images');