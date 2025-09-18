-- Fix RLS policies for media_library table to allow proper image uploads and viewing

-- Enable RLS on media_library table if not already enabled
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all media files
CREATE POLICY "Allow authenticated users to read media files" 
ON public.media_library 
FOR SELECT 
TO authenticated 
USING (true);

-- Create policy to allow authenticated users to insert media files
CREATE POLICY "Allow authenticated users to upload media files" 
ON public.media_library 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create policy to allow authenticated users to update their own media files
CREATE POLICY "Allow authenticated users to update media files" 
ON public.media_library 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create policy to allow authenticated users to delete media files (for admin functionality)
CREATE POLICY "Allow authenticated users to delete media files" 
ON public.media_library 
FOR DELETE 
TO authenticated 
USING (true);