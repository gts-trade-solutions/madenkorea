-- Insert sample orders for testing the order management workflow
INSERT INTO public.orders (
  order_number, 
  user_id, 
  status, 
  total_amount, 
  order_items, 
  shipping_address
) VALUES 
(
  'ORD-20250128-0001',
  '00000000-0000-0000-0000-000000000003',
  'processing',
  2399.00,
  '[{"product_id": "korean-glow-serum", "name": "COSRX Advanced Snail 92 All In One Cream", "quantity": 2, "price": 1199}]'::jsonb,
  '{"name": "John Doe", "street": "123 Beauty Street", "city": "Mumbai", "state": "Maharashtra", "postal_code": "400001", "country": "India"}'::jsonb
),
(
  'ORD-20250128-0002',
  '00000000-0000-0000-0000-000000000004',
  'processing',
  1899.00,
  '[{"product_id": "innisfree-green-tea", "name": "INNISFREE Green Tea Seed Serum", "quantity": 1, "price": 979}, {"product_id": "laneige-water-bank", "name": "LANEIGE Water Bank Cream", "quantity": 1, "price": 920}]'::jsonb,
  '{"name": "Sarah Kim", "street": "456 Skincare Avenue", "city": "Delhi", "state": "Delhi", "postal_code": "110001", "country": "India"}'::jsonb
),
(
  'ORD-20250128-0003',
  '00000000-0000-0000-0000-000000000005',
  'dispatched',
  1299.00,
  '[{"product_id": "beauty-joseon-serum", "name": "BEAUTY OF JOSEON Glow Deep Serum", "quantity": 1, "price": 899}, {"product_id": "etude-cleanser", "name": "ETUDE HOUSE SoonJung Cleanser", "quantity": 1, "price": 400}]'::jsonb,
  '{"name": "Priya Sharma", "street": "789 Glow Road", "city": "Bangalore", "state": "Karnataka", "postal_code": "560001", "country": "India"}'::jsonb
),
(
  'ORD-20250127-0004',
  '00000000-0000-0000-0000-000000000006',
  'delivered',
  1799.00,
  '[{"product_id": "some-by-mi-treatment", "name": "SOME BY MI Red Tea Tree Spot Treatment", "quantity": 2, "price": 649}, {"product_id": "cosrx-toner", "name": "COSRX AHA/BHA Clarifying Treatment Toner", "quantity": 1, "price": 501}]'::jsonb,
  '{"name": "Raj Patel", "street": "321 Clear Skin Lane", "city": "Pune", "state": "Maharashtra", "postal_code": "411001", "country": "India"}'::jsonb
),
(
  'ORD-20250126-0005',
  '00000000-0000-0000-0000-000000000007',
  'cancelled',
  999.00,
  '[{"product_id": "missha-essence", "name": "MISSHA Time Revolution Essence", "quantity": 1, "price": 999}]'::jsonb,
  '{"name": "Lisa Wong", "street": "654 Consumer Innovations Street", "city": "Chennai", "state": "Tamil Nadu", "postal_code": "600001", "country": "India"}'::jsonb
);