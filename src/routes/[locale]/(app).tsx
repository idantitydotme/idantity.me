import type { RouteSectionProps } from "@solidjs/router";
import AppHeader from "#components/app/AppHeader";
import AppFooter from "#components/app/AppFooter";
import { RLMain } from "@rimelight/ui/components/main/RLMain.tsx";
import { RLScrollToTop } from "@rimelight/ui/components/scroll-to-top/RLScrollToTop.tsx";
import { RLShortcuts } from "@rimelight/ui/components/shortcuts/RLShortcuts.tsx";
import { RLToaster } from "@rimelight/ui/components/toaster/RLToaster.tsx";
import { RLRouteAnnouncer } from "@rimelight/ui/components/route-announcer/RLRouteAnnouncer.tsx";
import { RLLayoutGrid } from "@rimelight/ui/components/layout-grid/RLLayoutGrid.tsx";

export default function AppRouteLayout(props: RouteSectionProps) {
  return (
    <div class="isolate flex flex-col min-h-screen">
      <AppHeader />
      <RLMain>{props.children}</RLMain>
      <AppFooter />
      <RLScrollToTop />
      <RLShortcuts />
      <RLToaster />
      <RLRouteAnnouncer />
      <RLLayoutGrid />
    </div>
  );
}
