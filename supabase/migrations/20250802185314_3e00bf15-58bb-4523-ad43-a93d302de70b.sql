-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION sync_brands_from_products()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert new brands from products that don't exist in brands table
  INSERT INTO public.brands (name, is_active, position)
  SELECT DISTINCT 
    p.brand,
    true,
    COALESCE((SELECT MAX(position) FROM public.brands), 0) + ROW_NUMBER() OVER (ORDER BY p.brand)
  FROM public.products p
  WHERE p.brand IS NOT NULL 
    AND p.brand != ''
    AND p.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM public.brands b 
      WHERE LOWER(b.name) = LOWER(p.brand)
    );

  -- Update brands table to mark brands as active if they exist in active products
  UPDATE public.brands 
  SET is_active = true 
  WHERE name IN (
    SELECT DISTINCT brand 
    FROM public.products 
    WHERE brand IS NOT NULL 
      AND brand != '' 
      AND is_active = true
  );

  -- Log the sync
  RAISE NOTICE 'Brands synced from products table';
END;
$$;

-- Fix search_path for trigger function
CREATE OR REPLACE FUNCTION handle_product_brand_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- For INSERT and UPDATE, sync brands
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Only sync if the brand field changed or it's a new record
    IF TG_OP = 'INSERT' OR (OLD.brand IS DISTINCT FROM NEW.brand) THEN
      PERFORM sync_brands_from_products();
    END IF;
    RETURN NEW;
  END IF;
  
  -- For DELETE, we don't remove brands as they might be used elsewhere
  RETURN OLD;
END;
$$;