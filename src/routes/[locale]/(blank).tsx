import type { RouteSectionProps } from "@solidjs/router";
import { RLMain } from "@rimelight/ui";

export default function BlankRouteLayout(props: RouteSectionProps) {
  return <RLMain>{props.children}</RLMain>;
}
