import { type Component } from "solid-js";
import { useParams } from "@solidjs/router";
import { type JSX, useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import AppHeader from "#components/app/AppHeader";
import AppFooter from "#components/app/AppFooter";
import { RLMain, RLScrollToTop, RLToaster } from "@rimelight/ui";
import { currentLocale } from "@rimelight/i18n";

export interface AppLayoutProps {
  title?: string | undefined;
  description?: string | undefined;
  noindex?: boolean | undefined;
  is404?: boolean | undefined;
  robots?: string | undefined;
  ogImageSrc?: string | undefined;
  ogImageAlt?: string | undefined;
  children?: JSX.Element | undefined;
  session?: any;
}

export const AppLayout: Component<AppLayoutProps> = (props) => {
  const params = useParams<{ locale?: string }>();
  if (params.locale && ["en", "pt"].includes(params.locale)) {
    currentLocale.set(params.locale);
  }
  useHead(
    () =>
      createSeoHead({
        title: props.title,
        description: props.description,
        noindex: props.noindex,
        robots: props.robots,
        ogImage: props.ogImageSrc
          ? { src: props.ogImageSrc, alt: props.ogImageAlt ?? "" }
          : undefined,
      }).tags,
  );
  return (
    <>
      <div class="isolate flex flex-col min-h-screen">
        <AppHeader stackIndex={1} session={props.session} />

        <RLMain id="main-content" class="flex-1">
          {props.children}
        </RLMain>

        <AppFooter />

        <RLScrollToTop showProgress={true} />
        <RLToaster />
      </div>
    </>
  );
};

export default AppLayout;
