import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { RLError } from "@rimelight/ui";

export default function Error404Page() {
  useHead(() => createSeoHead({ is404: true }));

  return <RLError status={404} />;
}
