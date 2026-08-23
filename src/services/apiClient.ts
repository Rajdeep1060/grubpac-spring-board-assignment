import { useAuthStore } from '../store/authStore';

const REFRESH_TOKEN_KEY = 'sprintdesk_refresh_token';

/**
 * Custom Fetch Wrapper with automatic Authorization headers,
 * 401 Unauthorized interception, silent token refresh, and retry logic.
 */
export async function apiClient<T>(
  url: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const { accessToken, setAccessToken, logout } = useAuthStore.getState();

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && !isRetry) {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!storedRefreshToken) {
      logout();
      throw new Error('Session expired. Please log in again.');
    }

    try {
      const refreshResponse = await fetch('https://dummyjson.com/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: storedRefreshToken,
          expiresInMins: 30,
        }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const newAccessToken = refreshData.accessToken || refreshData.token;

        setAccessToken(newAccessToken);

        headers.set('Authorization', `Bearer ${newAccessToken}`);
        const retryResponse = await fetch(url, { ...options, headers });

        if (!retryResponse.ok) {
          throw new Error(`API Error: ${retryResponse.statusText}`);
        }

        return (await retryResponse.json()) as T;
      } else {
        logout();
        throw new Error('Refresh token invalid or expired. Session ended.');
      }
    } catch (error) {
      logout();
      throw error;
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = response.statusText;
    try {
      const parsed = JSON.parse(errorText);
      errorMessage = parsed.message || parsed.error || response.statusText;
    } catch {
      errorMessage = errorText || response.statusText;
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}
