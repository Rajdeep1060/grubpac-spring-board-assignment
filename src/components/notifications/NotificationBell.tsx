import React from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { NotificationPanel } from './NotificationPanel';
import { Bell } from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const { notifications, togglePanel } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={togglePanel}
        className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
        aria-label="Notifications"
        title="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel />
    </div>
  );
};
