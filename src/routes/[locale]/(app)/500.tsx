import type { Component } from "solid-js";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import AppError from "#components/app/AppError";
import { t } from "@rimelight/i18n";

export interface Error500PageProps {
  error?: unknown;
}

export const Error500Page: Component<Error500PageProps> = (props) => {
  useHead(() =>
    createSeoHead({
      title: t("errors.server-error") || "Internal Server Error",
      description: t("errors.serverErrorDesc") || "An unexpected error occurred on the server.",
      noindex: true,
    }),
  );

  return (
    <AppError
      code={500}
      title={t("errors.server-error") || "Internal Server Error"}
      description={
        props.error instanceof Error
          ? props.error.message
          : t("errors.serverErrorDesc") || "An unexpected error occurred on the server."
      }
      actions={[
        {
          label: "Go to Home Page",
          href: "/",
          variant: "solid",
          color: "primary",
          icon: "i-lucide-home",
        },
      ]}
    />
  );
};

export default Error500Page;
