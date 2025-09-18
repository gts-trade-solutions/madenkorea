-- First, let's update the RLS policies for media_library to be more permissive for authenticated users
DROP POLICY IF EXISTS "Anyone can view active media" ON media_library;
DROP POLICY IF EXISTS "Authenticated users can manage media" ON media_library;

-- Create more permissive policies for development/demo
CREATE POLICY "Public can view media" ON media_library FOR SELECT USING (true);
CREATE POLICY "Anyone can insert media" ON media_library FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update media" ON media_library FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete media" ON media_library FOR DELETE USING (true);

-- Also update notifications policies to handle demo user IDs
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

-- Create more flexible notification policies
CREATE POLICY "Allow all notification access" ON notifications FOR ALL USING (true);

-- Update products table to be more accessible
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;

CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Anyone can manage products" ON products FOR ALL USING (true);