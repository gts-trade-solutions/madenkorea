-- First, clean up duplicate brands (keep the first one of each name)
-- Use a different approach for UUID ordering
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(name)) ORDER BY created_at) as rn
  FROM public.brands
)
DELETE FROM public.brands 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Improved sync function that handles duplicates better
CREATE OR REPLACE FUNCTION sync_brands_from_products()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert new brands from products that don't exist in brands table
  -- Use better duplicate detection with trimmed and case-insensitive comparison
  INSERT INTO public.brands (name, is_active, position)
  SELECT DISTINCT 
    TRIM(p.brand) as brand_name,
    true,
    COALESCE((SELECT MAX(position) FROM public.brands), 0) + ROW_NUMBER() OVER (ORDER BY TRIM(p.brand))
  FROM public.products p
  WHERE p.brand IS NOT NULL 
    AND TRIM(p.brand) != ''
    AND p.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM public.brands b 
      WHERE LOWER(TRIM(b.name)) = LOWER(TRIM(p.brand))
    );

  -- Update brands table to mark brands as active if they exist in active products
  UPDATE public.brands 
  SET is_active = true 
  WHERE LOWER(TRIM(name)) IN (
    SELECT DISTINCT LOWER(TRIM(brand))
    FROM public.products 
    WHERE brand IS NOT NULL 
      AND TRIM(brand) != '' 
      AND is_active = true
  );

  -- Log the sync
  RAISE NOTICE 'Brands synced from products table';
END;
$$;

-- Run the improved sync to clean up any remaining issues
SELECT sync_brands_from_products();