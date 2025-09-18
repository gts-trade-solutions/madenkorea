-- Fix security warnings by setting search_path for functions

-- Update mark_notification_read function
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications 
  SET is_read = true, updated_at = now()
  WHERE id = notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Update get_unread_notifications_count function
CREATE OR REPLACE FUNCTION public.get_unread_notifications_count(user_role_param public.user_role DEFAULT NULL)
RETURNS INTEGER AS $$
BEGIN
  IF user_role_param IS NULL THEN
    RETURN (SELECT COUNT(*) FROM public.notifications WHERE user_id = auth.uid() AND is_read = false);
  ELSE
    RETURN (SELECT COUNT(*) FROM public.notifications WHERE user_id = auth.uid() AND user_role = user_role_param AND is_read = false);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Update create_notification function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';