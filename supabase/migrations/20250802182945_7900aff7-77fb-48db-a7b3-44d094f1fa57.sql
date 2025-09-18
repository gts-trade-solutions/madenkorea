-- Enable realtime for brands table
ALTER TABLE brands REPLICA IDENTITY FULL;

-- Add brands table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE brands;