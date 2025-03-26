
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useProject, Notification } from '../contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/badge';

const NotificationDropdown = () => {
  const { notifications, respondToCollaboration, markNotificationAsRead } = useProject();
  const navigate = useNavigate();

  const unreadNotifications = notifications.filter(n => !n.read);
  
  const handleAccept = async (notification: Notification) => {
    if (notification.type === 'collaboration_invitation') {
      await respondToCollaboration(notification.data.collaboration_id, true);
      navigate(`/forge/${notification.project_id}`);
    }
  };
  
  const handleDecline = async (notification: Notification) => {
    if (notification.type === 'collaboration_invitation') {
      await respondToCollaboration(notification.data.collaboration_id, false);
    }
  };
  
  const handleRead = async (notification: Notification) => {
    await markNotificationAsRead(notification.id);
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than a minute
    if (diff < 60 * 1000) {
      return 'Just now';
    }
    
    // Less than an hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes}m ago`;
    }
    
    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours}h ago`;
    }
    
    // Less than a week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days}d ago`;
    }
    
    // Otherwise, return the date
    return date.toLocaleDateString();
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full relative">
          <Bell size={20} />
          {unreadNotifications.length > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-white"
            >
              {unreadNotifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white text-black">
        <div className="p-2">
          <h4 className="text-sm font-medium">Notifications</h4>
        </div>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-4 px-2 text-center text-sm text-gray-500">
            No notifications
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map(notification => {
              if (notification.type === 'collaboration_invitation') {
                return (
                  <div 
                    key={notification.id} 
                    className={`p-3 border-b last:border-0 ${notification.read ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium">Collaboration Invitation</div>
                      <div className="text-xs text-gray-500">{formatTime(notification.created_at)}</div>
                    </div>
                    <p className="text-sm mb-3">
                      <strong>{notification.data.inviter_name}</strong> has invited you to collaborate on <strong>{notification.data.project_title}</strong>
                    </p>
                    {!notification.read ? (
                      <div className="flex justify-end space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDecline(notification)}
                        >
                          Decline
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleAccept(notification)}
                        >
                          Accept
                        </Button>
                      </div>
                    ) : (
                      <div className="text-right text-xs text-gray-500 italic">
                        You've already responded to this invitation
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <DropdownMenuItem 
                  key={notification.id} 
                  className={`flex flex-col items-start cursor-default ${!notification.read ? 'bg-gray-50' : 'bg-white'}`}
                  onClick={() => handleRead(notification)}
                >
                  <div className="flex justify-between w-full">
                    <span className="font-medium">Notification</span>
                    <span className="text-xs text-gray-500">{formatTime(notification.created_at)}</span>
                  </div>
                  <span className="text-sm mt-1">You have a new notification</span>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
