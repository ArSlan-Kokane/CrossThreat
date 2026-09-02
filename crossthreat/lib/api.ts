/**
 * Centralized API client for CrossThreat backend
 * Handles all HTTP requests with retry logic and error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Handle API errors with descriptive messages
 */
function handleApiError(status: number, detail: string): Error {
  const errorMap: Record<number, string> = {
    400: "Bad Request",
    404: "Not Found",
    500: "Internal Server Error",
    503: "Service Unavailable",
    504: "Gateway Timeout",
  };

  const message = `${errorMap[status] || `HTTP ${status}`}: ${detail}`;
  return new Error(message);
}

/**
 * API Client with all CrossThreat endpoints
 */
export const apiClient = {
  /**
   * Check if backend is healthy and accessible
   */
  async checkHealth() {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/health`, {
        timeout: 5000,
      });

      if (!response.ok) {
        throw handleApiError(response.status, "Health check failed");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Health check timeout: Backend is unreachable");
      }
      throw error;
    }
  },

  /**
   * Fetch model metadata and schema
   */
  async getMetadata() {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/metadata`, {
      timeout: 10000,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw handleApiError(
        response.status,
        data.detail || "Failed to fetch metadata"
      );
    }

    return await response.json();
  },

  /**
   * Get list of available hosts for replay
   */
  async getReplayList() {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/replay/list`,
      { timeout: 15000 }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw handleApiError(
        response.status,
        data.detail || "Failed to load hosts list"
      );
    }

    return await response.json();
  },

  /**
   * Get threat replay timeline for a specific host
   */
  async getHostSequence(host: string, timeoutSeconds: number = 60) {
    if (!host || host.length === 0) {
      throw new Error("Host identifier cannot be empty");
    }

    if (host.length > 255) {
      throw new Error("Host identifier too long (max 255 characters)");
    }

    const encodedHost = encodeURIComponent(host);
    const url = new URL(`${API_BASE_URL}/api/replay/host/${encodedHost}`);

    // Add timeout parameter (convert to seconds, within API limits)
    const apiTimeout = Math.min(Math.max(timeoutSeconds, 10), 300);
    url.searchParams.append("timeout_seconds", String(apiTimeout));

    try {
      const response = await fetchWithTimeout(url.toString(), {
        timeout: (apiTimeout + 5) * 1000, // Add buffer to client timeout
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw handleApiError(
          response.status,
          data.detail || `Failed to load sequence for host ${host}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          `Request timeout: Sequence computation for host ${host} exceeded ${apiTimeout}s`
        );
      }
      throw error;
    }
  },

  /**
   * Get out-of-distribution generalization test results
   */
  async getGeneralization() {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/generalization`,
      { timeout: 120000 } // Generalization tests can take longer
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw handleApiError(
        response.status,
        data.detail || "Failed to load generalization results"
      );
    }

    return await response.json();
  },
};

/**
 * Hook to manage API state and errors in React components
 */
export function useApi<T>(
  fetchFn: () => Promise<T>,
  errorCallback?: (error: Error) => void
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const execute = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      errorCallback?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchFn, errorCallback]);

  return { data, loading, error, execute };
}
