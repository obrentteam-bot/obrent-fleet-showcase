import { createRouter, useRouter } from "@tanstack/react-router";
import { AppErrorState } from "@/components/AppErrorState";
import { routeTree } from "./routeTree.gen";

function DefaultErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <AppErrorState
      error={error}
      onRetry={() => {
        router.invalidate();
        reset();
      }}
    />
  );
}

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},
    scrollRestoration: typeof window !== "undefined",
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent,
  });

  return router;
};
