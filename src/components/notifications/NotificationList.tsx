import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from '@/hooks/useNotifications';
import { Loader2 } from 'lucide-react';

interface NotificationListProps {
  userRole?: 'customer' | 'supplier' | 'admin';
}

export const NotificationList = ({ userRole }: NotificationListProps) => {
  const { notifications, loading, markAllAsRead, unreadCount } = useNotifications(userRole);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
            className="text-xs"
          >
            Mark all read
          </Button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground">
          No notifications yet
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="p-2">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <NotificationItem notification={notification} />
                {index < notifications.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};