import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouter, useRouterState } from "@tanstack/react-router";
import { AppErrorState } from "@/components/AppErrorState";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { SplashScreen } from "@/components/SplashScreen";
import { MaintenancePage } from "@/components/MaintenancePage";
import { useMaintenance } from "@/lib/useMaintenance";
import { useAuth } from "@/lib/useAuth";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function RootErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  console.error(error);

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

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "OBRENT — Luxus Autovermietung Ludwigshafen am Rhein" },
      { name: "description", content: "OBRENT — Premium Autovermietung in Ludwigshafen am Rhein. Luxusfahrzeuge für besondere Anlässe." },
      { name: "author", content: "OBRENT" },
      { property: "og:title", content: "OBRENT — Luxus Autovermietung Ludwigshafen am Rhein" },
      { property: "og:description", content: "OBRENT — Premium Autovermietung in Ludwigshafen am Rhein. Luxusfahrzeuge für besondere Anlässe." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "OBRENT" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "OBRENT — Luxus Autovermietung Ludwigshafen am Rhein" },
      { name: "twitter:description", content: "OBRENT — Premium Autovermietung in Ludwigshafen am Rhein. Luxusfahrzeuge für besondere Anlässe." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Inter:wght@300;400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { enabled: maintenance, loading: maintenanceLoading } = useMaintenance();
  const { isAdmin: isAdminUser, loading: authLoading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isAdminRoute = pathname.startsWith("/admin");
  const showMaintenance =
    maintenance && !maintenanceLoading && !authLoading && !isAdminRoute && !isAdminUser;

  return (
    <ThemeProvider>
      <I18nProvider>
        <SplashScreen />
        <Outlet />
        {showMaintenance && <MaintenancePage />}
      </I18nProvider>
    </ThemeProvider>
  );
}
