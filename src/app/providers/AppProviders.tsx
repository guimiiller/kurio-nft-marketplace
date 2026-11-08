import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { useState } from "react";

import { router } from "../router";
import { RealtimeSync } from "../../features/realtime/components/RealtimeSync";

export function AppProviders() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeSync />

      <RouterProvider router={router} />

      {import.meta.env.DEV && <TanStackRouterDevtools router={router} />}
    </QueryClientProvider>
  );
}
