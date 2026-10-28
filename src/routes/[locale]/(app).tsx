import type { RouteSectionProps } from "@solidjs/router";
import AppHeader from "#components/app/AppHeader";
import AppFooter from "#components/app/AppFooter";
import {
  RLMain,
  RLScrollToTop,
  RLShortcuts,
  RLToaster,
  RLRouteAnnouncer,
  RLLayoutGrid,
  RLErrorBoundary,
} from "@rimelight/ui";

export default function AppRouteLayout(props: RouteSectionProps) {
  return (
    <div class="isolate flex flex-col min-h-screen">
      <AppHeader />
      <RLMain>
        <RLErrorBoundary resetKey={props.location.pathname}>{props.children}</RLErrorBoundary>
      </RLMain>
      <AppFooter />
      <RLScrollToTop />
      <RLShortcuts />
      <RLToaster />
      <RLRouteAnnouncer />
      <RLLayoutGrid />
    </div>
  );
}
