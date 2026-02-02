'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Singleton pattern for QueryClient - CRITICAL for cache to work
let browserQueryClient: QueryClient | undefined = undefined;

function makeQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new client
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false,
          retry: (failureCount, error) => {
            const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
            if (errorMessage.includes('timeout') || errorMessage.includes('500')) {
              return false;
            }
            return failureCount < 2;
          },
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
          retry: 1,
        },
      },
    });
  } else {
    // Browser: create client once and reuse
    if (!browserQueryClient) {
      browserQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            // For admin panel: immediate refetch after mutations
            staleTime: 0, // Data is stale immediately, refetch on invalidate
            refetchOnWindowFocus: false,
            gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
            retry: (failureCount, error) => {
              const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
              if (errorMessage.includes('timeout') || errorMessage.includes('500')) {
                return false;
              }
              return failureCount < 2;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 1,
          },
        },
      });
    }
    return browserQueryClient;
  }
}

export function TanStackQueryProvider({ children }: { children: React.ReactNode }) {
  // NOTE: Do NOT call makeQueryClient() here directly as it creates a new client on every render
  // The queryClient should be stable across renders for cache to work properly
  const queryClient = browserQueryClient ?? makeQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
