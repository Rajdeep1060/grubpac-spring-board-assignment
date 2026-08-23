import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NotificationItem } from '../types';
import { PolledPost } from '../services/notificationService';

interface NotificationState {
  notifications: NotificationItem[];
  seenPostIds: number[];
  isPanelOpen: boolean;

  setIsPanelOpen: (open: boolean) => void;
  togglePanel: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  processPolledPosts: (posts: PolledPost[]) => NotificationItem[];
  clearNotifications: () => void;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'initial-1',
    title: 'Sprint 3 Kickoff',
    message: 'Sprint 3 has officially started with 12 active story points.',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'initial-2',
    title: 'PR Reviewed & Merged',
    message: 'Emily Johnson merged pull request #42: Auth silent refresh interceptor.',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: initialNotifications,
      seenPostIds: [],
      isPanelOpen: false,

      setIsPanelOpen: (open) => set({ isPanelOpen: open }),
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      processPolledPosts: (posts) => {
        const state = get();
        const newItems: NotificationItem[] = [];
        const newPostIds: number[] = [];

        posts.forEach((post) => {
          if (!state.seenPostIds.includes(post.id)) {
            const newItem: NotificationItem = {
              id: `post-${post.id}-${Date.now()}`,
              title: `Update from Post #${post.id}`,
              message: post.title,
              read: false,
              createdAt: new Date().toISOString(),
              postId: post.id,
            };
            newItems.push(newItem);
            newPostIds.push(post.id);
          }
        });

        if (newItems.length > 0) {
          set({
            notifications: [...newItems, ...state.notifications],
            seenPostIds: [...state.seenPostIds, ...newPostIds],
          });
        }

        return newItems;
      },

      clearNotifications: () => set({ notifications: [], seenPostIds: [] }),
    }),
    {
      name: 'sprintdesk-notifications-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        seenPostIds: state.seenPostIds,
      }),
    }
  )
);
