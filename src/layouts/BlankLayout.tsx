import { type ParentComponent, Show } from "solid-js";
import { useParams } from "@solidjs/router";
import { Title, Meta } from "@solidjs/meta";
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

  return (
    <>
      <Title>{props.title} | idantity</Title>
      <Meta name="description" content={props.description} />
      <Show when={props.noindex}>
        <Meta name="robots" content="noindex, nofollow" />
      </Show>
      <RLMain>{props.children}</RLMain>
    </>
  );
};

export default BlankLayout;
