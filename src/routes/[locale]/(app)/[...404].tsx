import { useHead } from "@solidjs/web";
import { createPageHead } from "@rimelight/seo/head";
import { RLError } from "@rimelight/ui";

export default function Error404Page() {
  useHead(() => createPageHead({ is404: true }));

  return <RLError status={404} />;
}
