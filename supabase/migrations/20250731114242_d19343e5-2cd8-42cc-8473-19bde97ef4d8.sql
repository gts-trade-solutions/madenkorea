-- Link Round Lab image to all Round Lab products that don't have images
INSERT INTO product_media (product_id, media_url, media_type, position, is_primary, alt_text)
SELECT 
  p.product_id,
  'https://qpafvpwppkzgxtiiepcb.supabase.co/storage/v1/object/public/product-images/1753954528011-soztpcjesdd.jfif',
  'image',
  0,
  true,
  p.name || ' - Product Image'
FROM products p
WHERE p.brand = 'Round Lab' 
AND p.product_id NOT IN (
  SELECT DISTINCT product_id 
  FROM product_media 
  WHERE product_id IS NOT NULL
);