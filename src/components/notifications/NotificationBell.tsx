import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NotificationList } from './NotificationList';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

interface NotificationBellProps {
  userRole?: 'customer' | 'supplier' | 'admin';
}

export const NotificationBell = ({ userRole }: NotificationBellProps) => {
  const { unreadCount, loading } = useNotifications(userRole);
  const { user } = useAuth();

  // Show the bell even if no user (for demo purposes), but show login message
  const shouldShowBell = true; // Always show for demo

  if (!shouldShowBell) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {user && unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {user ? (
          <NotificationList userRole={userRole} />
        ) : (
          <div className="p-6 text-center">
            <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Please sign in to view notifications
            </p>
            <Button size="sm" onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};