import type { Component } from "solid-js";
import { type JSX, useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { RLMain } from "@rimelight/ui";

export interface BlankLayoutProps {
  title?: string;
  description?: string;
  noindex?: boolean;
  id?: string;
  class?: string;
  children?: JSX.Element;
}

export const BlankLayout: Component<BlankLayoutProps> = (props) => {
  useHead(() =>
    createSeoHead({
      title: props.title,
      description: props.description,
      noindex: props.noindex,
    }),
  );

  return (
    <RLMain id={props.id} class={props.class}>
      {props.children}
    </RLMain>
  );
};

export default BlankLayout;
