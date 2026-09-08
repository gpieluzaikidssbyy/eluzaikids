'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to get CSRF token from cookie and return it for use in API requests.
 * The CSRF token is set by middleware on registration pages.
 */
export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get CSRF token from cookie
    const cookies = document.cookie.split(';');
    let token: string | null = null;

    for (const cookie of cookies) {
      const [name, ...valueParts] = cookie.trim().split('=');
      if (name === 'eluzai_csrf_token') {
        token = valueParts.join('=');
        break;
      }
    }

    setCsrfToken(token);
    setLoading(false);
  }, []);

  /**
   * Make a fetch request with CSRF token included
   */
  const fetchWithCsrf = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const headers = new Headers(options.headers);

    if (csrfToken) {
      headers.set('x-csrf-token', csrfToken);
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return {
    csrfToken,
    loading,
    fetchWithCsrf,
    refetch: () => {
      setLoading(true);
      const cookies = document.cookie.split(';');
      let token: string | null = null;

      for (const cookie of cookies) {
        const [name, ...valueParts] = cookie.trim().split('=');
        if (name === 'eluzai_csrf_token') {
          token = valueParts.join('=');
          break;
        }
      }

      setCsrfToken(token);
      setLoading(false);
    },
  };
}
