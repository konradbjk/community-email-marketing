'use client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { getQueryClient } from '@/lib/get-query-client';

type ProvderProps = PropsWithChildren;

export function TanstackQueryProvider({ children }: ProvderProps) {
  // Ensure a single QueryClient per provider instance
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
