'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Singleton pattern for QueryClient - CRITICAL for cache to work
let browserQueryClient: QueryClient | undefined = undefined;

// Shared query configuration for optimal performance
const queryConfig = {
  staleTime: 60 * 1000, // 1 minute - data stays fresh
  gcTime: 5 * 60 * 1000, // 5 minutes - garbage collection
  refetchOnWindowFocus: false, // Prevents unnecessary refetches on tab switch
  refetchOnMount: false, // Prevents refetch when component remounts
  refetchOnReconnect: true, // Refetch on reconnect
  retry: (failureCount: number, error: unknown) => {
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
    if (errorMessage.includes('timeout') || errorMessage.includes('500')) {
      return false;
    }
    return failureCount < 2;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

function makeQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new client
    return new QueryClient({
      defaultOptions: {
        queries: queryConfig,
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
          queries: queryConfig,
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
  const queryClient = makeQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
