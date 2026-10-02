import { type ParentComponent } from "solid-js";
import { useParams } from "@solidjs/router";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { RLMain } from "@rimelight/ui";
import { currentLocale } from "@rimelight/i18n";

interface BlankLayoutProps {
  title: string;
  description: string;
  noindex?: boolean;
}

const BlankLayout: ParentComponent<BlankLayoutProps> = (props) => {
  const params = useParams<{ locale?: string }>();
  if (params.locale && ["en", "pt"].includes(params.locale)) {
    currentLocale.set(params.locale);
  }

  useHead(
    () =>
      createSeoHead({
        title: `${props.title} | idantity`,
        description: props.description,
        noindex: props.noindex,
      }).tags,
  );

  return (
    <>
      <RLMain>{props.children}</RLMain>
    </>
  );
};

export default BlankLayout;
