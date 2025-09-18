-- Create notification type enum
CREATE TYPE public.notification_type AS ENUM (
  'order_status',
  'stock_alert',
  'payment_confirmed',
  'product_approved',
  'supplier_request',
  'system_maintenance',
  'promotion',
  'review_request'
);

-- Create user role enum  
CREATE TYPE public.user_role AS ENUM (
  'customer',
  'supplier', 
  'admin'
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_role public.user_role NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type public.notification_type NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications 
  SET is_read = true, updated_at = now()
  WHERE id = notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread count
CREATE OR REPLACE FUNCTION public.get_unread_notifications_count(user_role_param public.user_role DEFAULT NULL)
RETURNS INTEGER AS $$
BEGIN
  IF user_role_param IS NULL THEN
    RETURN (SELECT COUNT(*) FROM public.notifications WHERE user_id = auth.uid() AND is_read = false);
  ELSE
    RETURN (SELECT COUNT(*) FROM public.notifications WHERE user_id = auth.uid() AND user_role = user_role_param AND is_read = false);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  target_user_id UUID,
  target_user_role public.user_role,
  notification_title TEXT,
  notification_message TEXT,
  notification_type_param public.notification_type,
  notification_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  new_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, user_role, title, message, notification_type, metadata)
  VALUES (target_user_id, target_user_role, notification_title, notification_message, notification_type_param, notification_metadata)
  RETURNING id INTO new_notification_id;
  
  RETURN new_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for timestamps
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample notifications
INSERT INTO public.notifications (user_id, user_role, title, message, notification_type, metadata) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Low Stock Alert', 'Korean Glow Serum is running low (5 units remaining)', 'stock_alert', '{"product_id": "korean-glow-serum", "current_stock": 5}'),
  ('00000000-0000-0000-0000-000000000001', 'admin', 'New Supplier Request', 'Beauty Co. has requested supplier access', 'supplier_request', '{"company_name": "Beauty Co.", "contact_email": "contact@beautyco.com"}'),
  ('00000000-0000-0000-0000-000000000001', 'admin', 'System Maintenance', 'Scheduled maintenance tonight at 2 AM', 'system_maintenance', '{"scheduled_time": "2025-01-15T02:00:00Z"}'),
  ('00000000-0000-0000-0000-000000000002', 'supplier', 'Product Approved', 'Your product "Consumer Innovations Essence" has been approved', 'product_approved', '{"product_id": "Consumer Innovations-essence", "approved_by": "admin"}'),
  ('00000000-0000-0000-0000-000000000002', 'supplier', 'Low Stock Alert', 'Your product "Hydrating Toner" is running low', 'stock_alert', '{"product_id": "hydrating-toner", "current_stock": 3}'),
  ('00000000-0000-0000-0000-000000000003', 'customer', 'Order Confirmed', 'Your order #ORD-20250115-0001 has been confirmed', 'order_status', '{"order_id": "ORD-20250115-0001", "status": "confirmed"}'),
  ('00000000-0000-0000-0000-000000000003', 'customer', 'Payment Successful', 'Payment for order #ORD-20250115-0001 processed successfully', 'payment_confirmed', '{"order_id": "ORD-20250115-0001", "amount": 89.99}'),
  ('00000000-0000-0000-0000-000000000003', 'customer', 'Special Promotion', 'Get 20% off on all Consumer Innovations products this week!', 'promotion', '{"discount_percentage": 20, "valid_until": "2025-01-22"});