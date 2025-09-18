-- Create notifications for any authenticated user (for testing purposes)
-- First, let's check if we have any users and create notifications for them

-- This function will create sample notifications for any user who doesn't have notifications yet
CREATE OR REPLACE FUNCTION public.create_sample_notifications_for_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Only create if user doesn't have notifications already
  IF NOT EXISTS (SELECT 1 FROM public.notifications WHERE user_id = target_user_id) THEN
    -- Create sample notifications for admin role
    INSERT INTO public.notifications (user_id, user_role, title, message, notification_type, metadata) VALUES
      (target_user_id, 'admin', 'Low Stock Alert', 'Korean Glow Serum is running low (5 units remaining)', 'stock_alert', '{"product_id": "korean-glow-serum", "current_stock": 5}'),
      (target_user_id, 'admin', 'New Supplier Request', 'Beauty Co. has requested supplier access', 'supplier_request', '{"company_name": "Beauty Co.", "contact_email": "contact@beautyco.com"}'),
      (target_user_id, 'admin', 'System Maintenance', 'Scheduled maintenance tonight at 2 AM', 'system_maintenance', '{"scheduled_time": "2025-01-15T02:00:00Z"}');
    
    -- Create sample notifications for supplier role  
    INSERT INTO public.notifications (user_id, user_role, title, message, notification_type, metadata) VALUES
      (target_user_id, 'supplier', 'Product Approved', 'Your product "Consumer Innovations Essence" has been approved', 'product_approved', '{"product_id": "Consumer Innovations-essence", "approved_by": "admin"}'),
      (target_user_id, 'supplier', 'Low Stock Alert', 'Your product "Hydrating Toner" is running low', 'stock_alert', '{"product_id": "hydrating-toner", "current_stock": 3}');
    
    -- Create sample notifications for customer role
    INSERT INTO public.notifications (user_id, user_role, title, message, notification_type, metadata) VALUES
      (target_user_id, 'customer', 'Order Confirmed', 'Your order #ORD-20250115-0001 has been confirmed', 'order_status', '{"order_id": "ORD-20250115-0001", "status": "confirmed"}'),
      (target_user_id, 'customer', 'Payment Successful', 'Payment for order #ORD-20250115-0001 processed successfully', 'payment_confirmed', '{"order_id": "ORD-20250115-0001", "amount": 89.99}'),
      (target_user_id, 'customer', 'Special Promotion', 'Get 20% off on all Consumer Innovations products this week!', 'promotion', '{"discount_percentage": 20, "valid_until": "2025-01-22"}');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';