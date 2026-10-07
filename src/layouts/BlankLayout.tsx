import { type ParentComponent } from "solid-js";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { RLMain } from "@rimelight/ui";

interface BlankLayoutProps {
  title: string;
  description: string;
  noindex?: boolean;
}

const BlankLayout: ParentComponent<BlankLayoutProps> = (props) => {
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
