import { type Component, For, Show } from "solid-js";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { t } from "@rimelight/i18n";
import {
  RLContainer,
  RLPage,
  RLPageSection,
  RLAvatar,
  RLImage,
  RLButton,
  RLBadge,
  RLIcon,
  RLProgress,
  RLTimeline,
  RLLink,
  type RLButtonProps,
} from "@rimelight/ui";

export interface LanguageSkill {
  nameKey: string;
  levelKey: string;
  score: number;
}

export interface SkillItem {
  icon: string;
  title: string;
  description: string;
}

export interface TechItem {
  label: string;
  icon: string;
  href: string;
}

export interface TechCategory {
  title: string;
  items: TechItem[];
}

export interface TechGroup {
  title: string;
  categories: TechCategory[];
}

export interface ExperienceItem {
  role: string;
  company: string;
  "company-url"?: string;
  image?: string;
  period: string;
  location?: string;
  summary?: string;
  responsibilities?: string[];
  tags?: string[];
}

export interface EducationItem {
  degree: string;
  school: string;
  period: string;
}

export interface CertificationItem {
  title: string;
  issuer: string;
  "credential-id"?: string;
}

export type DatePeriod = string | { start: string; end?: string };

export interface ResumeProject {
  name: string;
  role?: string;
  period: DatePeriod;
  href?: string;
  "image-src"?: string;
  summary?: string;
  highlights?: string[];
  tags?: string[];
}

export const ResumePage: Component = () => {
  const age = () => {
    const d = new Date();
    return (
      d.getFullYear() -
      1997 -
      (d.getMonth() < 3 || (d.getMonth() === 3 && d.getDate() < 30) ? 1 : 0)
    );
  };

  const socialLinks = () => [
    {
      icon: "i-logos-linkedin-icon",
      href: "https://linkedin.com/daniel-marchi",
      ariaLabel: t("page.resume.aria.social.linkedin") ?? "LinkedIn",
    },
    {
      icon: "i-logos-github-icon",
      href: "https://github.com/idantitydotme",
      ariaLabel: t("page.resume.aria.social.github") ?? "GitHub",
    },
  ];

  const aboutDetails = () => [
    {
      label: t("page.resume.about.gender.label"),
      value: t("page.resume.about.gender.value"),
    },
    {
      label: t("page.resume.about.pronouns.label"),
      value: t("page.resume.about.pronouns.value"),
    },
    {
      label: t("page.resume.about.nationality.label"),
      value: t("page.resume.about.nationality.value"),
    },
    {
      label: t("page.resume.about.age.label"),
      value: `${age()} ${t("page.resume.about.age.value")}`,
    },
  ];

  const languages: readonly LanguageSkill[] = [
    {
      nameKey: "lang_portuguese",
      levelKey: "level_fluent",
      score: 100,
    },
    {
      nameKey: "lang_english",
      levelKey: "level_fluent",
      score: 100,
    },
    {
      nameKey: "lang_spanish",
      levelKey: "level_intermediate",
      score: 50,
    },
    {
      nameKey: "lang_romanian",
      levelKey: "level_basic",
      score: 25,
    },
  ];

  const heroLinks = (): RLButtonProps[] => [
    {
      label: t("page.resume.hero.action.hire") ?? "",
      href: "/contact",
    },
    {
      variant: "outline",
      label: t("page.resume.hero.action.download-cv") ?? "",
      href: "https://cdn.idantity.me/Documents/Daniel_Marchi_CV.pdf",
      leadingIcon: "i-lucide-download",
    },
  ];

  const skills = (): SkillItem[] => [
    {
      icon: "i-lucide-code-2",
      title: t("page.resume.skills.web-dev.title"),
      description: t("page.resume.skills.web-dev.desc"),
    },
    {
      icon: "i-lucide-gamepad-2",
      title: t("page.resume.skills.game-dev.title"),
      description: t("page.resume.skills.game-dev.desc"),
    },
    {
      icon: "i-lucide-palette",
      title: t("page.resume.skills.design.title"),
      description: t("page.resume.skills.design.desc"),
    },
  ];

  const techGroups = (): TechGroup[] => [
    {
      title: t("page.resume.tech.group.web-dev"),
      categories: [
        {
          title: t("page.resume.tech.cat.languages"),
          items: [
            {
              label: t("app.text.typescript"),
              icon: "i-logos-typescript-icon",
              href: "https://www.typescriptlang.org/",
            },
            {
              label: t("app.text.astro"),
              icon: "i-logos-astro-icon?mask text-white",
              href: "https://astro.build/",
            },
            { label: t("app.text.vue"), icon: "i-logos-vue", href: "https://vuejs.org/" },
            {
              label: t("app.text.solidjs"),
              icon: "i-logos-solidjs-icon",
              href: "https://www.solidjs.com/",
            },
            { label: t("app.text.unocss"), icon: "i-logos-unocss", href: "https://unocss.dev/" },
          ],
        },
        {
          title: t("page.resume.tech.cat.environment"),
          items: [
            {
              label: t("app.text.webstorm"),
              icon: "i-logos-webstorm",
              href: "https://www.jetbrains.com/webstorm/",
            },
          ],
        },
        {
          title: t("page.resume.tech.cat.build"),
          items: [
            {
              label: t("app.text.vite-plus"),
              icon: "i-logos-vite-icon-dark",
              href: "https://viteplus.dev/",
            },
            { label: "pnpm", icon: "i-logos-pnpm", href: "https://pnpm.io/" },
          ],
        },
        {
          title: t("page.resume.tech.cat.deployment"),
          items: [
            {
              label: t("app.text.cloudflare"),
              icon: "i-logos-cloudflare-icon",
              href: "https://cloudflare.com/",
            },
          ],
        },
      ],
    },
    {
      title: t("page.resume.tech.group.game-dev"),
      categories: [
        {
          title: t("page.resume.tech.cat.languages"),
          items: [
            { label: t("app.text.c"), icon: "i-logos-c-plusplus", href: "https://isocpp.org/" },
            {
              label: t("app.text.verse"),
              icon: "i-simple-icons-fortnite",
              href: "https://dev.epicgames.com/documentation/en-us/uefn/verse-language-reference",
            },
          ],
        },
        {
          title: t("page.resume.tech.cat.environment"),
          items: [
            {
              label: t("app.text.unreal-engine"),
              icon: "i-logos-unrealengine-icon?mask text-white",
              href: "https://www.unrealengine.com/",
            },
            {
              label: t("app.text.rider"),
              icon: "i-logos-rider",
              href: "https://www.jetbrains.com/rider/",
            },
          ],
        },
      ],
    },
    {
      title: t("page.resume.tech.group.shared"),
      categories: [
        {
          title: t("page.resume.tech.cat.data"),
          items: [
            {
              label: t("app.text.postgresql"),
              icon: "i-logos-postgresql",
              href: "https://www.postgresql.org/",
            },
            {
              label: t("app.text.drizzle"),
              icon: "i-catppuccin-drizzle-orm",
              href: "https://orm.drizzle.team/",
            },
          ],
        },
        {
          title: t("page.resume.tech.cat.auth"),
          items: [
            {
              label: t("app.text.cloudflare-access"),
              icon: "i-simple-icons-cloudflare",
              href: "https://cloudflare.com/",
            },
          ],
        },
        {
          title: t("page.resume.tech.cat.project"),
          items: [
            { label: t("app.text.git"), icon: "i-logos-git-icon", href: "https://git-scm.com/" },
            {
              label: t("app.text.lore"),
              icon: "i-simple-icons-epicgames?mask text-white",
              href: "https://dev.epicgames.com/documentation/en-us/uefn/unreal-revision-control-in-unreal-editor-for-fortnite",
            },
            {
              label: t("app.text.youtrack"),
              icon: "i-logos-youtrack",
              href: "https://www.jetbrains.com/youtrack/",
            },
          ],
        },
      ],
    },
  ];

  const experiences = () => t.raw<ExperienceItem[]>("page.resume.experiences", []);
  const education = () => t.raw<EducationItem[]>("page.resume.education", []);
  const certifications = () => t.raw<CertificationItem[]>("page.resume.certifications", []);
  const projects = () => t.raw<ResumeProject[]>("page.resume.projects", []);

  useHead(() =>
    createSeoHead({
      title: t("page.resume.meta.title"),
      description: t("page.resume.meta.description"),
    }),
  );

  return (
    <>
      <RLContainer class="max-w-none">
        <RLPage
          ui={{
            // Resume-only: the sidebar stays after the body in source order (h1 before h2),
            // but is shown first on every breakpoint, so it sits above the body on mobile
            // and on the left on large screens.
            right: (base) =>
              `${base
                .split(" ")
                .filter((cls) => !/(^|:)order-/.test(cls))
                .join(" ")} order-first`,
          }}
          right={
            <aside
              aria-label={t("page.resume.aria.sidebar.profile")}
              class="order-first flex flex-col w-full gap-xl py-8 md:py-16 border-b md:border-b-0 md:border-r border-primary-500 md:pr-8"
            >
              {/* Introduction Section */}
              <section aria-labelledby="resume-sidebar-name" class="flex flex-col items-center">
                <header class="flex flex-col gap-xs items-center">
                  <RLAvatar
                    src="https://cdn.idantity.me/Images/Users/Avatars/idantity.me_0000_00.webp"
                    alt={t("page.resume.sidebar.name")}
                    class="!size-40 border-4 border-primary-500 shadow-xl"
                  />

                  <div class="text-center">
                    <h2 id="resume-sidebar-name" class="text-3xl font-bold">
                      {t("page.resume.sidebar.name")}
                    </h2>
                    <p class="text-md text-neutral-500">{t("page.resume.sidebar.title")}</p>
                  </div>
                </header>

                {/* Socials */}
                <ul class="flex gap-sm justify-center w-full">
                  <For each={socialLinks()}>
                    {(socialLink) => (
                      <li>
                        <RLButton
                          size="lg"
                          variant="ghost"
                          leadingIcon={`${socialLink.icon}?mask text-white hover:text-primary-500`}
                          href={socialLink.href}
                          aria-label={socialLink.ariaLabel}
                        />
                      </li>
                    )}
                  </For>
                </ul>
              </section>

              {/* About Me Section */}
              <section aria-labelledby="resume-about-heading" class="flex flex-col gap-sm">
                <header class="flex flex-col gap-2">
                  <div class="flex flex-row items-center gap-2">
                    <RLIcon name="i-lucide-user" class="text-sm" />
                    <h3 id="resume-about-heading" class="text-md font-bold">
                      {t("page.resume.about.heading")}
                    </h3>
                  </div>
                  <hr aria-hidden="true" class="border-neutral-500" />
                </header>

                <dl class="flex flex-col gap-sm text-sm text-neutral-500">
                  <For each={aboutDetails()}>
                    {(aboutDetail) => (
                      <div class="flex justify-between">
                        <dt>{aboutDetail.label}</dt>
                        <dd>
                          <span>{aboutDetail.value}</span>
                        </dd>
                      </div>
                    )}
                  </For>
                  <div class="flex justify-between items-center pb-1.5">
                    <dt>{t("page.resume.about.location.label")}</dt>
                    <dd>
                      <RLLink
                        // Resume-only: keep the city on one line so the external icon sits right after it.
                        ui={{ root: "whitespace-nowrap" }}
                        leadingIcon="i-lucide-map-pin"
                        label={t("page.resume.sidebar.location")}
                        aria-label={`${t("page.resume.about.location.label")}: ${t("page.resume.sidebar.location")}`}
                        href="https://en.wikipedia.org/wiki/Curitiba"
                        class="text-sm hover:text-primary-400"
                      />
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Languages Section */}
              <section aria-labelledby="resume-languages-heading" class="flex flex-col gap-sm">
                <header class="flex flex-col gap-2">
                  <div class="flex flex-row items-center gap-2">
                    <RLIcon name="i-lucide-languages" class="text-sm" />
                    <h3 id="resume-languages-heading" class="text-md font-bold">
                      {t("page.resume.languages.heading")}
                    </h3>
                  </div>
                  <hr aria-hidden="true" class="border-neutral-500" />
                </header>
                <dl class="flex flex-col gap-sm">
                  <For each={languages}>
                    {(language) => (
                      <div class="grid grid-cols-[1fr_auto] gap-y-1 items-center">
                        <dt class="text-sm">
                          {t(`page.resume.${language.nameKey.replace(/_/g, ".")}`)}
                        </dt>
                        <dd class="text-sm text-neutral-500 text-end">
                          {t(`page.resume.${language.levelKey.replace(/_/g, ".")}`)}
                        </dd>
                        <dd class="col-span-2">
                          <RLProgress
                            size="sm"
                            value={language.score}
                            aria-label={`${t(`page.resume.${language.nameKey.replace(/_/g, ".")}`)}: ${t(`page.resume.${language.levelKey.replace(/_/g, ".")}`)}`}
                          />
                        </dd>
                      </div>
                    )}
                  </For>
                </dl>
              </section>
            </aside>
          }
        >
          {/* Page Body */}
          <div class="flex flex-col gap-xl py-8 md:py-16">
            <RLPageSection
              variant="hero"
              orientation="horizontal"
              title={t("page.resume.hero.title")}
              description={t("page.resume.hero.description")}
              links={heroLinks()}
            >
              <RLImage
                src="https://cdn.idantity.me/Images/Users/Avatars/idantity.me_0000_00.webp"
                alt={t("page.resume.sidebar.name")}
                width={800}
                height={800}
              />
            </RLPageSection>

            {/* Skills Section */}
            <section aria-labelledby="resume-skills-heading" class="flex flex-col gap-md">
              <header class="flex flex-col gap-xs">
                <h2 id="resume-skills-heading" class="text-3xl font-bold">
                  {t("page.resume.skills.heading")}
                </h2>
                <hr aria-hidden="true" class="border-neutral-500" />
              </header>
              <ul class="grid grid-cols-1 md:grid-cols-3 gap-lg">
                <For each={skills()}>
                  {(skill) => (
                    <li>
                      <div class="flex items-center gap-sm">
                        <RLIcon name={skill.icon} size="lg" class="text-primary-500" />
                        <h3 class="text-lg font-bold">{skill.title}</h3>
                      </div>
                      <p class="text-sm text-neutral-500">{skill.description}</p>
                    </li>
                  )}
                </For>
              </ul>
            </section>

            {/* Technologies & Tools Section */}
            <section aria-labelledby="resume-tech-heading" class="flex flex-col gap-md">
              <header class="flex flex-col gap-xs">
                <h2 id="resume-tech-heading" class="text-3xl font-bold">
                  {t("page.resume.tech.heading")}
                </h2>
                <hr aria-hidden="true" class="border-neutral-500" />
              </header>

              <For each={techGroups()}>
                {(group, groupIndex) => (
                  <section
                    aria-labelledby={`resume-tech-group-${groupIndex()}`}
                    class="flex flex-col gap-md"
                  >
                    <div class="flex flex-col gap-sm">
                      <h3 id={`resume-tech-group-${groupIndex()}`} class="text-lg font-bold">
                        {group.title}
                      </h3>
                      <hr aria-hidden="true" class="border-neutral-500" />
                    </div>

                    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
                      <For each={group.categories}>
                        {(category) => (
                          <li class="flex flex-col gap-md">
                            <h4 class="text-sm font-bold">{category.title}</h4>
                            <ul class="flex flex-col gap-xs w-full">
                              <For each={category.items}>
                                {(item) => (
                                  <li class="w-full">
                                    <RLButton
                                      justify="start"
                                      variant="ghost"
                                      color="neutral"
                                      leadingIcon={item.icon}
                                      href={item.href}
                                      label={item.label}
                                      class="w-full text-sm"
                                    />
                                  </li>
                                )}
                              </For>
                            </ul>
                          </li>
                        )}
                      </For>
                    </ul>
                  </section>
                )}
              </For>
            </section>

            {/* Experience Section */}
            <section aria-labelledby="resume-experience-heading" class="flex flex-col gap-md">
              <header class="flex flex-col gap-xs">
                <h2 id="resume-experience-heading" class="text-3xl font-bold">
                  {t("page.resume.experience.heading")}
                </h2>
                <hr aria-hidden="true" class="border-neutral-500" />
              </header>
              <RLTimeline
                orientation="vertical"
                size="xl"
                class="w-full"
                items={[...experiences()].reverse().map((exp) => ({
                  date: exp.period,
                  title: `${exp.role} @ ${exp.company}`,
                  ...(exp.image
                    ? { avatar: { src: exp.image, alt: exp.company } }
                    : { icon: "i-lucide-briefcase" }),
                  exp,
                }))}
              >
                {(ctx) => {
                  const exp =
                    (ctx as { exp?: ExperienceItem }).exp ?? (ctx as unknown as ExperienceItem);
                  return (
                    <div class="flex flex-col gap-2">
                      <Show when={exp.location}>
                        <p class="text-sm text-neutral-500">{exp.location}</p>
                      </Show>
                      <Show when={exp.tags && exp.tags.length > 0}>
                        <div class="flex flex-wrap gap-1.5">
                          <For each={exp.tags}>
                            {(tag) => <RLBadge variant="soft">{tag}</RLBadge>}
                          </For>
                        </div>
                      </Show>
                      <Show when={exp.summary}>
                        <div>
                          <span class="text-sm font-bold text-neutral-500 block">
                            {t("page.resume.exp.summary.label")}:
                          </span>
                          <p class="text-sm text-neutral-500">{exp.summary}</p>
                        </div>
                      </Show>
                      <Show when={exp.responsibilities && exp.responsibilities.length > 0}>
                        <div>
                          <span class="text-sm font-bold text-neutral-500 block">
                            {t("page.resume.exp.responsibilities.label")}:
                          </span>
                          <ul class="flex flex-col gap-sm pl-lg list-disc text-sm text-neutral-500">
                            <For each={exp.responsibilities}>{(resp) => <li>{resp}</li>}</For>
                          </ul>
                        </div>
                      </Show>
                    </div>
                  );
                }}
              </RLTimeline>
            </section>

            {/* Education Section */}
            <section aria-labelledby="resume-education-heading" class="flex flex-col gap-md">
              <header class="flex flex-col gap-xs">
                <h2 id="resume-education-heading" class="text-3xl font-bold">
                  {t("page.resume.headings.education")}
                </h2>
                <hr aria-hidden="true" class="border-neutral-500" />
              </header>
              <RLTimeline
                orientation="vertical"
                size="xl"
                items={[...education()].reverse().map((edu) => ({
                  date: edu.period,
                  title: edu.degree,
                  description: edu.school,
                  icon: "i-lucide-graduation-cap",
                }))}
              />
            </section>

            {/* Projects Section */}
            <section aria-labelledby="resume-projects-heading" class="flex flex-col gap-md">
              <header class="flex flex-col gap-xs">
                <h2 id="resume-projects-heading" class="text-3xl font-bold">
                  {t("page.resume.headings.projects")}
                </h2>
                <hr aria-hidden="true" class="border-neutral-500" />
              </header>
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md md:gap-lg">
                <For each={projects()}>
                  {(project) => (
                    <article class="flex flex-col gap-sm">
                      <header class="flex items-start justify-between gap-sm">
                        <div class="flex flex-col gap-0.5 min-w-0">
                          <h3 class="text-base font-bold">{project.name}</h3>
                          <div class="flex flex-wrap items-center gap-x-1.5 text-xs text-neutral-500">
                            {typeof project.period === "object" ? (
                              <span class="inline-flex items-center gap-1">
                                <time datetime={project.period.start}>{project.period.start}</time>
                                <span aria-hidden="true">–</span>
                                {project.period.end ? (
                                  <time datetime={project.period.end}>{project.period.end}</time>
                                ) : (
                                  <span>{t("page.resume.period.present")}</span>
                                )}
                              </span>
                            ) : (
                              <time datetime={project.period}>{project.period}</time>
                            )}
                            <Show when={project.role}>
                              <span aria-hidden="true">·</span>
                              <span>{project.role}</span>
                            </Show>
                          </div>
                        </div>

                        <Show when={project.href}>
                          <RLButton
                            size="sm"
                            variant="soft"
                            href={project.href}
                            label={t("page.resume.project.view.button")}
                            aria-label={`${t("page.resume.project.view.button")}: ${project.name}`}
                            trailingIcon="i-lucide-external-link"
                            class="shrink-0"
                          />
                        </Show>
                      </header>

                      <Show when={project.tags && project.tags.length > 0}>
                        <div class="flex flex-wrap gap-1.5">
                          <For each={project.tags}>
                            {(tag) => (
                              <RLBadge size="sm" variant="soft">
                                {tag}
                              </RLBadge>
                            )}
                          </For>
                        </div>
                      </Show>

                      <Show when={project["image-src"]}>
                        {(imageSrc) => (
                          <RLImage
                            src={imageSrc()}
                            alt={project.name}
                            width={600}
                            height={338}
                            ui={{
                              root: "w-full block",
                              trigger: "w-full aspect-video",
                              triggerImage: "w-full h-full max-w-none object-cover",
                            }}
                          />
                        )}
                      </Show>

                      <Show when={project.summary}>
                        <p class="text-sm text-neutral-500">{project.summary}</p>
                      </Show>

                      <Show when={project.highlights && project.highlights.length > 0}>
                        <ul class="space-y-1 pl-4 list-disc text-xs text-neutral-500">
                          <For each={project.highlights}>{(highlight) => <li>{highlight}</li>}</For>
                        </ul>
                      </Show>
                    </article>
                  )}
                </For>
              </div>
            </section>

            {/* Certifications Section */}
            <section aria-labelledby="resume-certifications-heading" class="flex flex-col gap-md">
              <header class="flex flex-col gap-xs">
                <h2 id="resume-certifications-heading" class="text-3xl font-bold">
                  {t("page.resume.headings.certifications")}
                </h2>
                <hr aria-hidden="true" class="border-neutral-500" />
              </header>
              <ul class="grid grid-cols-1 sm:grid-cols-2 gap-lg">
                <For each={certifications()}>
                  {(cert) => (
                    <li>
                      <details class="group cursor-pointer flex flex-col gap-1.5">
                        <summary class="flex items-start justify-between gap-sm select-none">
                          <span class="flex flex-col">
                            <strong class="text-lg font-bold group-hover:text-primary-500 transition-colors">
                              {cert.title}
                            </strong>
                            <span class="text-sm text-neutral-500">{cert.issuer}</span>
                          </span>
                          <Show when={cert["credential-id"]}>
                            <span class="i-lucide-chevron-down text-neutral-500 transition-transform duration-200 group-open:rotate-180" />
                          </Show>
                        </summary>
                        <Show when={cert["credential-id"]}>
                          <div class="flex flex-col gap-1.5 pt-1">
                            <code class="block text-xs text-neutral-500 break-all">
                              {t("page.resume.labels.credential-id")}: {cert["credential-id"]}
                            </code>
                          </div>
                        </Show>
                      </details>
                    </li>
                  )}
                </For>
              </ul>
            </section>
          </div>
        </RLPage>
      </RLContainer>
    </>
  );
};

export default ResumePage;
