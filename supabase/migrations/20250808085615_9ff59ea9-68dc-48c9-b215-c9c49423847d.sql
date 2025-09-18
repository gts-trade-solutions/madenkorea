-- Clean up all product-related data
-- Delete cart items first (they reference products)
DELETE FROM public.cart_items;

-- Delete product reviews
DELETE FROM public.product_reviews;

-- Delete product variants
DELETE FROM public.product_variants;

-- Delete product editorial data
DELETE FROM public.product_editorial;

-- Delete product media
DELETE FROM public.product_media;

-- Delete supplier products relationships
DELETE FROM public.supplier_products;

-- Delete all products
DELETE FROM public.products;

-- Clean up media library (product images)
DELETE FROM public.media_library WHERE tags && ARRAY['product'];

-- Reset any sequences if needed
-- Note: UUIDs don't use sequences, so no need to reset

-- Clean up storage buckets for product images
DELETE FROM storage.objects WHERE bucket_id = 'product-images';