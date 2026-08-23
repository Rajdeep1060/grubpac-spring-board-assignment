import React, { useState } from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { Check, CheckCheck, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export const NotificationPanel: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, isPanelOpen, setIsPanelOpen } = useNotificationStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isPanelOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const pageSize = 20;
  const totalPages = Math.ceil(filteredNotifications.length / pageSize) || 1;
  const paginatedItems = filteredNotifications.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => setIsPanelOpen(false)}
      />

      <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-slide-down">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1 font-medium focus:outline-none focus:underline"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all as read
            </button>
          )}
        </div>

        <div className="flex border-b border-gray-100 dark:border-gray-700 text-xs font-medium px-4 pt-2 gap-4">
          <button
            onClick={() => {
              setFilter('all');
              setCurrentPage(1);
            }}
            className={cn(
              'pb-2 border-b-2 transition-colors focus:outline-none',
              filter === 'all'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            )}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => {
              setFilter('unread');
              setCurrentPage(1);
            }}
            className={cn(
              'pb-2 border-b-2 transition-colors focus:outline-none',
              filter === 'unread'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            )}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60">
          {paginatedItems.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
              <Bell className="w-8 h-8 opacity-40" />
              <span>No notifications to show</span>
            </div>
          ) : (
            paginatedItems.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => markAsRead(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    markAsRead(item.id);
                  }
                }}
                className={cn(
                  'p-3.5 text-xs transition-colors cursor-pointer flex gap-3 items-start focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700/60',
                  !item.read
                    ? 'bg-brand-50/40 dark:bg-brand-950/20 hover:bg-brand-50/80 dark:hover:bg-brand-950/40'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/40 opacity-80'
                )}
              >
                <div
                  className={cn(
                    'mt-1 w-2 h-2 rounded-full shrink-0',
                    !item.read ? 'bg-brand-600' : 'bg-transparent'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-semibold text-gray-900 dark:text-white truncate">{item.title}</span>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">{item.message}</p>
                </div>
                {!item.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(item.id);
                    }}
                    className="text-gray-400 hover:text-brand-600 p-1 rounded transition-colors"
                    aria-label="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50/80 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                aria-label="Previous notifications page"
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                aria-label="Next notifications page"
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
