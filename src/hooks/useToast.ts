import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toastData) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toastData, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    return id;
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clearToasts: () => set({ toasts: [] }),
}));

export function useToast() {
  const { toasts, addToast, removeToast, clearToasts } = useToastStore();

  const toast = {
    success: (message: string, title?: string, duration?: number) =>
      addToast({ type: 'success', message, title, duration }),
    error: (message: string, title?: string, duration?: number) =>
      addToast({ type: 'error', message, title, duration }),
    info: (message: string, title?: string, duration?: number) =>
      addToast({ type: 'info', message, title, duration }),
    warning: (message: string, title?: string, duration?: number) =>
      addToast({ type: 'warning', message, title, duration }),
  };

  return { toasts, toast, removeToast, clearToasts };
}
