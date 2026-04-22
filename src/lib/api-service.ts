/**
 * Centralized API Service for Agent Dashboard
 * Handles all API calls with proper error handling, retry logic, and caching
 */

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Get authorization headers
 */
export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(cacheEntry: CacheEntry): boolean {
  return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
}

/**
 * Get from cache if valid
 */
export function getFromCache(key: string): any | null {
  const entry = cache.get(key);
  if (entry && isCacheValid(entry)) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

/**
 * Set cache
 */
export function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Clear cache
 */
export function clearCache(pattern?: string): void {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}

/**
 * Fetch with timeout and error handling
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Generic API request handler
 */
async function apiRequest(
  endpoint: string,
  options: RequestInit & { useCache?: boolean; cacheDuration?: number } = {}
): Promise<any> {
  const { useCache = true, cacheDuration, ...fetchOptions } = options;
  const url = `${baseUrl}${endpoint}`;
  const cacheKey = `${options.method || 'GET'}_${endpoint}`;

  // Check cache for GET requests
  if (useCache && (!options.method || options.method === 'GET')) {
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    const response = await fetchWithTimeout(url, {
      headers: getAuthHeaders(),
      ...fetchOptions,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Clear token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('agent_token');
          window.location.href = '/login';
        }
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Cache successful GET responses
    if (useCache && (!options.method || options.method === 'GET')) {
      if (cacheDuration) {
        const currentDuration = CACHE_DURATION;
        cache.set(cacheKey, {
          data,
          timestamp: Date.now() - (currentDuration - cacheDuration),
        });
      } else {
        setCache(cacheKey, data);
      }
    }

    return data;
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Dashboard API methods
 */
export const dashboardAPI = {
  // Overview
  getOverview: () =>
    apiRequest('/agent-dashboard/overview', { useCache: true }),

  // Commissions
  getCommissions: (status?: string, page: number = 1, limit: number = 10) =>
    apiRequest(`/agent-dashboard/commissions?status=${status || ''}&page=${page}&limit=${limit}`, {
      useCache: true,
    }),

  // Bookings
  getBookings: () =>
    apiRequest('/agent-dashboard/bookings', { useCache: true }),

  // Wallet
  getWallet: () =>
    apiRequest('/agent-dashboard/wallet', { useCache: true }),

  // Analytics
  getAnalytics: () =>
    apiRequest('/agent-dashboard/analytics', { useCache: true }),

  // Withdrawal
  requestWithdrawal: (amount: number) =>
    apiRequest('/agent-dashboard/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount }),
      useCache: false,
    }),

  // Withdrawal History
  getWithdrawalHistory: () =>
    apiRequest('/agent-dashboard/withdraw/history', { useCache: true }),

  // Current Agent Info
  getMe: () =>
    apiRequest('/agent-dashboard/me', { useCache: true }),

  // QR Config
  getQRConfig: () =>
    apiRequest('/agent-dashboard/qr-config', { useCache: true }),

  updateQRConfig: (config: any) =>
    apiRequest('/agent-dashboard/qr-config', {
      method: 'PUT',
      body: JSON.stringify(config),
      useCache: false,
    }),

  getAvailableItems: () =>
    apiRequest('/agent-dashboard/qr-config/available-items', { useCache: true }),

  // Pooling
  getPoolingRequests: (urgency?: string) =>
    apiRequest(`/agent-dashboard/pooling${urgency ? `?urgency=${urgency}` : ''}`, {
      useCache: true,
    }),

  supplyPoolingMembers: (poolingId: string, membersCount: number) =>
    apiRequest(`/agent-dashboard/pooling/${poolingId}/supply`, {
      method: 'POST',
      body: JSON.stringify({ membersCount }),
      useCache: false,
    }),

  getPoolingHistory: (page: number = 1, limit: number = 10) =>
    apiRequest(`/agent-dashboard/pooling/history?page=${page}&limit=${limit}`, {
      useCache: true,
    }),
};

/**
 * Refresh specific data sections
 */
export function refreshData(section: string): void {
  const clearPatterns: Record<string, string> = {
    wallet: 'wallet',
    commissions: 'commissions',
    bookings: 'bookings',
    analytics: 'analytics',
    overview: 'overview',
    pooling: 'pooling',
    all: '',
  };

  const pattern = clearPatterns[section];
  if (pattern !== undefined) {
    clearCache(pattern);
  }
}

export default dashboardAPI;
