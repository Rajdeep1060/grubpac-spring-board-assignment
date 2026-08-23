import { create } from 'zustand';
import { AuthUser } from '../types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  rememberMe: boolean;

  setAuth: (user: AuthUser, accessToken: string, refreshToken: string, rememberMe?: boolean) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  setRememberMe: (rememberMe: boolean) => void;
}

const REFRESH_TOKEN_KEY = 'sprintdesk_refresh_token';
const USER_KEY = 'sprintdesk_user';
const REMEMBER_ME_EXPIRY_KEY = 'sprintdesk_remember_me_expiry';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
  rememberMe: false,

  setRememberMe: (rememberMe: boolean) => set({ rememberMe }),

  setAuth: (user: AuthUser, accessToken: string, refreshToken: string, rememberMe = false) => {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    if (rememberMe) {
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem(REMEMBER_ME_EXPIRY_KEY, String(Date.now() + thirtyDaysMs));
    } else {
      localStorage.removeItem(REMEMBER_ME_EXPIRY_KEY);
    }

    set({
      user,
      accessToken,
      isAuthenticated: true,
      isInitializing: false,
      rememberMe,
    });
  },

  setAccessToken: (token: string) => {
    set({ accessToken: token });
  },

  logout: () => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_ME_EXPIRY_KEY);
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitializing: false,
    });
  },

  checkAuth: async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const storedUserRaw = localStorage.getItem(USER_KEY);
    const rememberMeExpiry = localStorage.getItem(REMEMBER_ME_EXPIRY_KEY);

    if (rememberMeExpiry) {
      const expiryTimestamp = Number(rememberMeExpiry);
      if (Date.now() > expiryTimestamp) {
        console.warn('Remember me 30-day session expired.');
        get().logout();
        return false;
      }
    }

    if (!storedRefreshToken || !storedUserRaw) {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isInitializing: false,
      });
      return false;
    }

    set({ isInitializing: true });

    try {
      const storedUser: AuthUser = JSON.parse(storedUserRaw);
      const response = await fetch('https://dummyjson.com/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: storedRefreshToken,
          expiresInMins: 30,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newAccessToken = data.accessToken || data.token;
        const newRefreshToken = data.refreshToken || storedRefreshToken;

        get().setAuth(storedUser, newAccessToken, newRefreshToken, !!rememberMeExpiry);
        return true;
      } else {
        get().logout();
        return false;
      }
    } catch (error) {
      console.warn('Auth session restoration fallback:', error);
      try {
        const storedUser: AuthUser = JSON.parse(storedUserRaw);
        set({
          user: storedUser,
          accessToken: 'mock-access-token-' + Date.now(),
          isAuthenticated: true,
          isInitializing: false,
        });
        return true;
      } catch {
        get().logout();
        return false;
      }
    }
  },
}));
