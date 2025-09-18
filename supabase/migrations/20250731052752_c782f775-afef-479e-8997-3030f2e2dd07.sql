-- Create app_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'supplier', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table for proper role management
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's current supplier ID
CREATE OR REPLACE FUNCTION public.get_current_supplier_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id
  FROM public.suppliers
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- Add supplier_id directly to products table for easier querying
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.suppliers(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON public.products(supplier_id);

-- Update RLS policies for products to include supplier ownership
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Anyone can manage products" ON public.products;

-- New RLS policies for products
CREATE POLICY "Anyone can view active products" 
ON public.products 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Suppliers can manage their own products" 
ON public.products 
FOR ALL 
USING (supplier_id = public.get_current_supplier_id());

CREATE POLICY "Admins can manage all products" 
ON public.products 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Update suppliers table RLS policies
DROP POLICY IF EXISTS "Admins can manage all suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Suppliers can view and update their own data" ON public.suppliers;
DROP POLICY IF EXISTS "Suppliers can update their own data" ON public.suppliers;

CREATE POLICY "Suppliers can view their own data" 
ON public.suppliers 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Suppliers can update their own data" 
ON public.suppliers 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all suppliers" 
ON public.suppliers 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Insert sample user roles for demo users
INSERT INTO public.user_roles (user_id, role) 
VALUES ('demo-admin-001'::uuid, 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- Create a demo supplier if not exists
INSERT INTO public.suppliers (id, user_id, company_name, contact_person, email, status, is_active)
VALUES (
  'demo-supplier-001'::uuid,
  'demo-admin-001'::uuid,
  'Demo Beauty Supplier',
  'Demo Contact',
  'demo@supplier.com',
  'approved',
  true
) ON CONFLICT (user_id) DO NOTHING;