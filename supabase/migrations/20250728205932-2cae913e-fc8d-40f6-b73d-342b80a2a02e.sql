-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address JSONB,
  business_license TEXT,
  tax_id TEXT,
  bank_details JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  commission_rate NUMERIC DEFAULT 10.00,
  total_revenue NUMERIC DEFAULT 0,
  total_products INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all suppliers" 
ON public.suppliers 
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Suppliers can view and update their own data" 
ON public.suppliers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Suppliers can update their own data" 
ON public.suppliers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create supplier_products junction table for tracking which products belong to which suppliers
CREATE TABLE public.supplier_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  commission_rate NUMERIC DEFAULT 10.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for supplier_products
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;

-- Create policies for supplier_products
CREATE POLICY "Admins can manage all supplier products" 
ON public.supplier_products 
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Suppliers can view their own products" 
ON public.supplier_products 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.suppliers 
  WHERE suppliers.id = supplier_products.supplier_id 
  AND suppliers.user_id = auth.uid()
));

-- Add trigger for updated_at
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();