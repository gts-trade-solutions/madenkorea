import { formatDistanceToNow } from 'date-fns';
import { 
  Package, 
  ShoppingCart, 
  CreditCard, 
  CheckCircle, 
  UserPlus, 
  Settings, 
  Tag, 
  Star 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications, type Notification } from '@/hooks/useNotifications';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order_status':
      return <ShoppingCart className="h-4 w-4" />;
    case 'stock_alert':
      return <Package className="h-4 w-4" />;
    case 'payment_confirmed':
      return <CreditCard className="h-4 w-4" />;
    case 'product_approved':
      return <CheckCircle className="h-4 w-4" />;
    case 'supplier_request':
      return <UserPlus className="h-4 w-4" />;
    case 'system_maintenance':
      return <Settings className="h-4 w-4" />;
    case 'promotion':
      return <Tag className="h-4 w-4" />;
    case 'review_request':
      return <Star className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'order_status':
      return 'text-blue-600';
    case 'stock_alert':
      return 'text-orange-600';
    case 'payment_confirmed':
      return 'text-green-600';
    case 'product_approved':
      return 'text-green-600';
    case 'supplier_request':
      return 'text-purple-600';
    case 'system_maintenance':
      return 'text-gray-600';
    case 'promotion':
      return 'text-pink-600';
    case 'review_request':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
};

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const { markAsRead } = useNotifications();

  const handleClick = () => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  return (
    <Button
      variant="ghost"
      className={`w-full p-3 h-auto flex items-start gap-3 text-left justify-start ${
        !notification.is_read ? 'bg-primary/5' : ''
      }`}
      onClick={handleClick}
    >
      <div className={`mt-1 ${getNotificationColor(notification.notification_type)}`}>
        {getNotificationIcon(notification.notification_type)}
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm leading-tight">
            {notification.title}
          </p>
          {!notification.is_read && (
            <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />
          )}
        </div>
        
        <p className="text-xs text-muted-foreground leading-relaxed">
          {notification.message}
        </p>
        
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
    </Button>
  );
};