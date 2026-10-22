import type { Component } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import AppError from "#components/app/AppError";
import { t } from "@rimelight/i18n";

export const Error404Page: Component = () => {
  return (
    <AppLayout
      title={t("errors.not-found") || "Page Not Found"}
      description={t("errors.not-found-desc") || "The page you are looking for does not exist."}
      is404={true}
      noindex={true}
    >
      <AppError
        code={404}
        title={t("errors.not-found") || "Page Not Found"}
        description={
          t("errors.not-found-desc") ||
          "The page you are looking for does not exist or has been moved."
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
    </AppLayout>
  );
};

export default Error404Page;
