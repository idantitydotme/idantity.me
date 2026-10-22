import { type Component, For } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import { t, getLocaleUrl } from "@rimelight/i18n";
import { RLPageSection, RLAccordion } from "@rimelight/ui";
import LighthouseScores from "#components/services/LighthouseScores.tsx";
import HttpObservatory from "#components/services/HttpObservatory.tsx";

export const ServicesPage: Component = () => {
  const heroLinks = () => [
    {
      label: t("page.services.cta.discuss.project"),
      href: getLocaleUrl("/contact"),
      color: "primary" as const,
      variant: "solid" as const,
      leadingIcon: "i-lucide-mail",
    },
    {
      label: t("page.services.cta.view.work"),
      href: getLocaleUrl("/projects"),
      color: "primary" as const,
      variant: "outline" as const,
      trailingIcon: "i-lucide-arrow-right",
    },
  ];

  const ctaLinks = () => [
    {
      label: t("page.services.cta.final.button"),
      href: getLocaleUrl("/contact"),
      color: "primary" as const,
      variant: "solid" as const,
      trailingIcon: "i-lucide-arrow-right",
    },
  ];

  const services = () => [
    {
      icon: "i-lucide-layout-grid",
      title: t("page.services.service.1.title"),
      description: t("page.services.service.1.desc"),
      tags: ["SolidJS", "TypeScript", "UnoCSS", "Core Web Vitals", "i18n"],
      features: [
        t("page.services.service.1.feat.1"),
        t("page.services.service.1.feat.2"),
        t("page.services.service.1.feat.3"),
      ],
    },
    {
      icon: "i-lucide-shield-check",
      title: t("page.services.service.2.title"),
      description: t("page.services.service.2.desc"),
      tags: ["Strict CSP", "HSTS", "Turnstile", "HTTP Observatory A+"],
      features: [
        t("page.services.service.2.feat.1"),
        t("page.services.service.2.feat.2"),
        t("page.services.service.2.feat.3"),
      ],
    },
    {
      icon: "i-lucide-server",
      title: t("page.services.service.3.title"),
      description: t("page.services.service.3.desc"),
      tags: ["Hono", "Cloudflare", "D1 SQL", "Serverless SQL"],
      features: [
        t("page.services.service.3.feat.1"),
        t("page.services.service.3.feat.2"),
        t("page.services.service.3.feat.3"),
      ],
    },
    {
      icon: "i-lucide-gauge",
      title: t("page.services.service.4.title"),
      description: t("page.services.service.4.desc"),
      tags: ["Lighthouse 100", "Asset Pipeline", "Tree-shaking", "Refactoring"],
      features: [
        t("page.services.service.4.feat.1"),
        t("page.services.service.4.feat.2"),
        t("page.services.service.4.feat.3"),
      ],
    },
  ];

  const workflowSteps = () => [
    {
      num: t("page.services.step.1.num"),
      icon: "i-lucide-compass",
      title: t("page.services.step.1.title"),
      description: t("page.services.step.1.desc"),
    },
    {
      num: t("page.services.step.2.num"),
      icon: "i-lucide-code-2",
      title: t("page.services.step.2.title"),
      description: t("page.services.step.2.desc"),
    },
    {
      num: t("page.services.step.3.num"),
      icon: "i-lucide-activity",
      title: t("page.services.step.3.title"),
      description: t("page.services.step.3.desc"),
    },
    {
      num: t("page.services.step.4.num"),
      icon: "i-lucide-rocket",
      title: t("page.services.step.4.title"),
      description: t("page.services.step.4.desc"),
    },
  ];

  const techStack = [
    { name: "SolidJS", category: "UI Library", icon: "i-logos-solidjs-icon" },
    { name: "TypeScript", category: "Language", icon: "i-logos-typescript-icon" },
    { name: "Vite+", category: "Unified Toolchain", icon: "i-logos-vite-icon-dark" },
    { name: "Hono", category: "Edge API", icon: "i-logos-hono" },
    { name: "Cloudflare", category: "Infrastructure", icon: "i-logos-cloudflare-icon" },
    { name: "D1 Database", category: "Serverless Database", icon: "i-logos-cloudflare-icon" },
    { name: "UnoCSS", category: "Styling Engine", icon: "i-logos-unocss" },
  ];

  const faqItems = () => [
    {
      label: t("page.services.faq.q1"),
      content: t("page.services.faq.a1"),
      icon: "i-lucide-help-circle",
    },
    {
      label: t("page.services.faq.q2"),
      content: t("page.services.faq.a2"),
      icon: "i-lucide-help-circle",
    },
    {
      label: t("page.services.faq.q3"),
      content: t("page.services.faq.a3"),
      icon: "i-lucide-help-circle",
    },
    {
      label: t("page.services.faq.q4"),
      content: t("page.services.faq.a4"),
      icon: "i-lucide-help-circle",
    },
  ];

  return (
    <AppLayout title={t("page.services.title")} description={t("page.services.description")}>
      {/* 1. Hero Section */}
      <RLPageSection
        variant="hero"
        headline={t("page.services.hero.headline")}
        title={t("page.services.hero.title")}
        description={t("page.services.hero.description")}
        links={heroLinks()}
      />

      {/* 2. Quality Benchmarks & Social Proof Section */}
      <RLPageSection
        orientation="vertical"
        headline={t("page.services.benchmarks.headline")}
        title={t("page.services.benchmarks.title")}
        description={t("page.services.benchmarks.description")}
        body={
          <div class="mx-auto w-full max-w-5xl">
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 items-stretch">
              <div class="p-6 md:p-8 rounded-2xl bg-neutral-500/5 hover:bg-neutral-500/10 transition-colors flex flex-col justify-between">
                <LighthouseScores />
              </div>
              <div class="p-6 md:p-8 rounded-2xl bg-neutral-500/5 hover:bg-neutral-500/10 transition-colors flex flex-col justify-between">
                <HttpObservatory />
              </div>
            </div>
          </div>
        }
      />

      {/* 3. Core Services Grid */}
      <RLPageSection
        orientation="vertical"
        headline={t("page.services.services-section.headline")}
        title={t("page.services.services-section.title")}
        description={t("page.services.services-section.description")}
        body={
          <div class="mx-auto w-full max-w-5xl">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <For each={services()}>
                {(service) => (
                  <div class="p-6 md:p-8 rounded-2xl bg-neutral-500/5 hover:bg-neutral-500/10 transition-all flex flex-col justify-between">
                    <div>
                      <div class="flex items-center gap-3.5 mb-4">
                        <div class="flex size-11 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500">
                          <span class={`${service.icon} size-5`} aria-hidden="true" />
                        </div>
                        <h3 class="text-xl font-bold text-foreground">{service.title}</h3>
                      </div>

                      <p class="text-muted-foreground text-sm leading-relaxed mb-6">
                        {service.description}
                      </p>

                      <div class="mb-6">
                        <ul class="flex flex-col gap-2.5">
                          <For each={service.features}>
                            {(feat) => (
                              <li class="flex items-start gap-2.5 text-sm text-foreground/90">
                                <span
                                  class="i-lucide-check-circle-2 size-4 text-emerald-500 shrink-0 mt-0.5"
                                  aria-hidden="true"
                                />
                                <span>{feat}</span>
                              </li>
                            )}
                          </For>
                        </ul>
                      </div>
                    </div>

                    <div class="pt-4 border-t border-border/40 flex flex-wrap gap-1.5">
                      <For each={service.tags}>
                        {(tag) => (
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-neutral-500/10 text-muted-foreground">
                            {tag}
                          </span>
                        )}
                      </For>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        }
      />

      {/* 4. Workflow / Process Section */}
      <RLPageSection
        orientation="vertical"
        headline={t("page.services.process.headline")}
        title={t("page.services.process.title")}
        description={t("page.services.process.description")}
        body={
          <div class="mx-auto w-full max-w-5xl">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <For each={workflowSteps()}>
                {(step) => (
                  <div class="p-6 rounded-2xl bg-neutral-500/5 hover:bg-neutral-500/10 transition-all flex flex-col justify-between relative overflow-hidden group">
                    <div class="absolute -top-3 -right-2 text-5xl font-black text-muted-foreground/10 select-none group-hover:text-primary-500/15 transition-colors">
                      {step.num}
                    </div>
                    <div>
                      <div class="flex size-10 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500 mb-4">
                        <span class={`${step.icon} size-5`} aria-hidden="true" />
                      </div>
                      <h4 class="text-base font-bold text-foreground mb-2">{step.title}</h4>
                      <p class="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        }
      />

      {/* 5. Technologies & Standards Grid */}
      <RLPageSection
        orientation="vertical"
        headline={t("page.services.tech.headline")}
        title={t("page.services.tech.title")}
        description={t("page.services.tech.description")}
        body={
          <div class="mx-auto w-full max-w-5xl">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <For each={techStack}>
                {(tech) => (
                  <div class="flex items-center gap-3 p-3.5 rounded-xl bg-neutral-500/5 hover:bg-neutral-500/10 transition">
                    <span class={`${tech.icon} size-6 shrink-0`} aria-hidden="true" />
                    <div class="flex flex-col min-w-0">
                      <span class="font-semibold text-sm text-foreground truncate">
                        {tech.name}
                      </span>
                      <span class="text-xs text-muted-foreground truncate">{tech.category}</span>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        }
      />

      {/* 6. FAQ Section */}
      <RLPageSection
        orientation="vertical"
        headline={t("page.services.faq.headline")}
        title={t("page.services.faq.title")}
        description={t("page.services.faq.description")}
        body={
          <div class="mx-auto w-full max-w-3xl">
            <RLAccordion items={faqItems()} multiple={false} />
          </div>
        }
      />

      {/* 7. Final Call to Action */}
      <RLPageSection
        variant="cta"
        ctaVariant="solid"
        title={t("page.services.cta.final.title")}
        description={t("page.services.cta.final.desc")}
        links={ctaLinks()}
      />
    </AppLayout>
  );
};

export default ServicesPage;
