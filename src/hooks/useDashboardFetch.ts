/**
 * Custom hook for fetching dashboard data with built-in error handling,
 * loading states, and pagination support
 */

import { useState, useEffect, useCallback } from 'react';

interface UseDashboardFetchOptions {
  onError?: (error: string) => void;
  onSuccess?: (data: any) => void;
  autoFetch?: boolean;
  retryCount?: number;
}

interface UseDashboardFetchReturn {
  data: any;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  pagination: any;
  setPagination: (pagination: any) => void;
}

export function useDashboardFetch(
  fetchFn: (page?: number, limit?: number) => Promise<any>,
  options: UseDashboardFetchOptions = {}
): UseDashboardFetchReturn {
  const {
    onError,
    onSuccess,
    autoFetch = true,
    retryCount = 3,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [retries, setRetries] = useState(0);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(pagination.page, pagination.limit);

      if (result.success) {
        setData(result.data);
        if (result.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: result.pagination.total,
            pages: result.pagination.pages,
          }));
        }
        setRetries(0);
        onSuccess?.(result.data);
      } else {
        const errorMsg = result.message || 'Failed to fetch data';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred';
      setError(errorMsg);
      onError?.(errorMsg);

      // Retry logic
      if (retries < retryCount) {
        setRetries((prev) => prev + 1);
        setTimeout(() => refetch(), 1000 * (retries + 1));
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn, pagination, retryCount, retries, onError, onSuccess]);

  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [pagination.page, autoFetch]);

  return {
    data,
    loading,
    error,
    refetch,
    pagination,
    setPagination: (newPagination) => setPagination(newPagination),
  };
}

export default useDashboardFetch;
