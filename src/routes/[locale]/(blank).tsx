import type { RouteSectionProps } from "@solidjs/router";
import { RLMain } from "@rimelight/ui/components/main/RLMain.tsx";

export default function BlankRouteLayout(props: RouteSectionProps) {
  return <RLMain>{props.children}</RLMain>;
}
