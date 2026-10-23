import { type Component } from "solid-js";
import { type JSX, useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import AppHeader from "#components/app/AppHeader";
import AppFooter from "#components/app/AppFooter";
import {
  RLMain,
  RLScrollToTop,
  RLShortcuts,
  RLToaster,
  RLRouteAnnouncer,
  RLLayoutGrid,
} from "@rimelight/ui";

export interface AppLayoutProps {
  title?: string | undefined;
  description?: string | undefined;
  noindex?: boolean | undefined;
  is404?: boolean | undefined;
  robots?: string | undefined;
  ogImageSrc?: string | undefined;
  ogImageAlt?: string | undefined;
  children?: JSX.Element | undefined;
}

export const AppLayout: Component<AppLayoutProps> = (props) => {
  useHead(() =>
    createSeoHead({
      title: props.title,
      description: props.description,
      noindex: props.noindex,
      robots: props.robots,
      ogImage: props.ogImageSrc
        ? { src: props.ogImageSrc, alt: props.ogImageAlt ?? "" }
        : undefined,
    }),
  );
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
};

export default AppLayout;
