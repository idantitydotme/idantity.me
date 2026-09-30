import type { Component } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import { t } from "@rimelight/i18n";

export const BrandingPage: Component = () => {
  return (
    <AppLayout title={t("branding.title")} description={t("branding.description")}>
      <div class="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-highlighted mb-4">
          {t("branding.title")}
        </h1>
        <p class="text-muted text-base">{t("branding.description")}</p>
      </div>
    </AppLayout>
  );
};

export default BrandingPage;
