import { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { I18nProvider } from "@/lib/i18n";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </I18nProvider>
  );
}
