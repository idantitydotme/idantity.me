import type { RouteSectionProps } from "@solidjs/router";
import type { Component } from "solid-js";
import { RLMain } from "@rimelight/ui";

export const BlankRouteLayout: Component<RouteSectionProps> = (props) => {
  return <RLMain>{props.children}</RLMain>;
};

export default BlankRouteLayout;
