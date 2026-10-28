import type { Component } from "solid-js";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { t } from "@rimelight/i18n";

export const BrandingPage: Component = () => {
  useHead(() =>
    createSeoHead({
      title: t("page.branding.meta.title"),
      description: t("page.branding.meta.description"),
    }),
  );

  return (
    <div class="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 class="text-3xl sm:text-4xl font-extrabold text-highlighted mb-4">
        {t("page.branding.meta.title")}
      </h1>
      <p class="text-muted text-base">{t("page.branding.meta.description")}</p>
    </div>
  );
};

export default BrandingPage;
