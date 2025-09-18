-- Check and fix RLS policies for product_editorial table

-- The current policy requires authentication, but the main site should be able to read this data publicly
-- Let's add a policy that allows public read access to product_editorial

DROP POLICY IF EXISTS "Public can view product editorial data" ON public.product_editorial;

CREATE POLICY "Public can view product editorial data" 
ON public.product_editorial 
FOR SELECT 
USING (true);

-- Also ensure the products table allows public access (it should already)
DROP POLICY IF EXISTS "Public can view active products" ON public.products;

CREATE POLICY "Public can view active products" 
ON public.products 
FOR SELECT 
USING (is_active = true);

-- Check that product_media also allows public access
DROP POLICY IF EXISTS "Public can view product media" ON public.product_media;

CREATE POLICY "Public can view product media" 
ON public.product_media 
FOR SELECT 
USING (true);