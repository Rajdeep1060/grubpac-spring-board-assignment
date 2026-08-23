import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPolledPosts } from '../services/notificationService';
import { useNotificationStore } from '../store/notificationStore';
import { useToast } from './useToast';

export function useNotificationPoller(enabled = true, intervalMs = 15000) {
  const { processPolledPosts, isPanelOpen } = useNotificationStore();
  const { toast } = useToast();
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const query = useQuery({
    queryKey: ['polledNotifications'],
    queryFn: fetchPolledPosts,
    refetchInterval: enabled && isTabVisible ? intervalMs : false,
    refetchOnWindowFocus: true,
    enabled: enabled && isTabVisible,
  });

  useEffect(() => {
    if (query.data && query.data.length > 0) {
      const newItems = processPolledPosts(query.data);

      if (newItems.length > 0 && !isPanelOpen) {
        newItems.forEach((item) => {
          toast.info(item.message, item.title, 5000);
        });
      }
    }
  }, [query.data, processPolledPosts, isPanelOpen, toast]);

  return query;
}
