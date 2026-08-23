import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../src/services/apiClient';
import { useAuthStore } from '../src/store/authStore';

describe('API Client & Interceptor', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    useAuthStore.setState({
      accessToken: 'test-access-token',
      isAuthenticated: true,
    });
  });

  it('should attach Bearer token to request headers', async () => {
    const mockResponse = { success: true };
    const globalFetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });
    vi.stubGlobal('fetch', globalFetchMock);

    const data = await apiClient('/api/test-endpoint');

    expect(data).toEqual(mockResponse);
    expect(globalFetchMock).toHaveBeenCalled();
    const fetchArgs = globalFetchMock.mock.calls[0];
    expect(fetchArgs[0]).toBe('/api/test-endpoint');
    const headers = fetchArgs[1].headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer test-access-token');
  });

  it('should attempt silent refresh on 401 and retry request', async () => {
    localStorage.setItem('sprintdesk_refresh_token', 'valid-refresh-token');

    let fetchCount = 0;
    const globalFetchMock = vi.fn().mockImplementation((url) => {
      fetchCount++;
      if (url === '/api/protected-resource' && fetchCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 401,
          text: async () => 'Unauthorized',
        });
      }
      if (url === 'https://dummyjson.com/auth/refresh') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            accessToken: 'new-refreshed-access-token',
            refreshToken: 'new-refreshed-refresh-token',
          }),
        });
      }
      if (url === '/api/protected-resource' && fetchCount === 3) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: 'Retried Data' }),
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    vi.stubGlobal('fetch', globalFetchMock);

    const result = await apiClient('/api/protected-resource');

    expect(result).toEqual({ data: 'Retried Data' });
    expect(useAuthStore.getState().accessToken).toBe('new-refreshed-access-token');
  });
});
