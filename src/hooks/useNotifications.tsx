import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  user_id: string;
  user_role: 'customer' | 'supplier' | 'admin';
  title: string;
  message: string;
  notification_type: 'order_status' | 'stock_alert' | 'payment_confirmed' | 'product_approved' | 'supplier_request' | 'system_maintenance' | 'promotion' | 'review_request';
  is_read: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const useNotifications = (userRole?: 'customer' | 'supplier' | 'admin') => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    // For admin dashboard demo, create mock user if none exists
    const currentUser = user || { id: 'demo-admin-001' };
    
    console.log('useNotifications: Fetching notifications for user:', currentUser.id, 'role:', userRole);
    
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (userRole) {
        query = query.eq('user_role', userRole);
        console.log('useNotifications: Filtering by role:', userRole);
      }

      const { data, error } = await query;
      
      console.log('useNotifications: Query result:', { data, error });
      
      if (error) {
        console.error('useNotifications: Error fetching notifications:', error);
        throw error;
      }
      
      console.log('useNotifications: Found', data?.length || 0, 'notifications');
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('useNotifications: Error in fetchNotifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.rpc('mark_notification_read', {
        notification_id: notificationId
      });
      
      if (error) {
        console.error('useNotifications: Error marking as read:', error);
        throw error;
      }
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const currentUser = user || { id: 'demo-admin-001' };
    
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      for (const notification of unreadNotifications) {
        await supabase.rpc('mark_notification_read', {
          notification_id: notification.id
        });
      }
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    const currentUser = user || { id: 'demo-admin-001' };
    
    console.log('useNotifications: User effect triggered for:', currentUser.id);
    
    // Create sample notifications for demo user
    const createSampleNotifications = async () => {
      try {
        await supabase.rpc('create_sample_notifications_for_user', {
          target_user_id: currentUser.id
        });
        console.log('useNotifications: Sample notifications created/checked');
      } catch (error) {
        console.error('useNotifications: Error creating sample notifications:', error);
      }
    };

    createSampleNotifications().then(() => {
      fetchNotifications();
    });
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log('useNotifications: Real-time update received:', payload);
          fetchNotifications();
        }
      )
      .subscribe();
    
    return () => {
      console.log('useNotifications: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [userRole]); // Remove user dependency to always run

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};