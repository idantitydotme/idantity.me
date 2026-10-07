import { type Component, For, Show } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import { t, getRelativeLocaleUrl } from "@rimelight/i18n";
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
  companyUrl?: string;
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
  credentialId?: string;
}

export type DatePeriod = string | { start: string; end?: string };

export interface ResumeProject {
  name: string;
  role?: string;
  period: DatePeriod;
  href?: string;
  imageSrc?: string;
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
      ariaLabel: t("page_resume.aria_social_linkedin") ?? "LinkedIn",
    },
    {
      icon: "i-logos-github-icon",
      href: "https://github.com/idantitydotme",
      ariaLabel: t("page_resume.aria_social_github") ?? "GitHub",
    },
  ];

  const aboutDetails = () => [
    {
      label: t("page_resume.about_gender_label"),
      value: t("page_resume.about_gender_value"),
    },
    {
      label: t("page_resume.about_pronouns_label"),
      value: t("page_resume.about_pronouns_value"),
    },
    {
      label: t("page_resume.about_nationality_label"),
      value: t("page_resume.about_nationality_value"),
    },
    {
      label: t("page_resume.about_age_label"),
      value: `${age()} ${t("page_resume.about_age_value")}`,
    },
    {
      label: t("page_resume.about_location_label"),
      leadingIcon: "i-lucide-map-pin",
      value: "Curitiba, Brazil",
      trailingIcon: "i-lucide-external-link",
      href: "https://en.wikipedia.org/wiki/Curitiba",
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
      label: t("page_resume.hero_action_hire") ?? "",
      href: getRelativeLocaleUrl("/contact"),
    },
    {
      variant: "outline",
      label: t("page_resume.hero_action_downloadCv") ?? "",
      href: "https://cdn.idantity.me/Documents/Daniel_Marchi_CV.pdf",
      leadingIcon: "i-lucide-download",
    },
  ];

  const skills = (): SkillItem[] => [
    {
      icon: "i-lucide-code-2",
      title: t("page_resume.skills_webDev"),
      description: t("page_resume.skills_webDev_desc"),
    },
    {
      icon: "i-lucide-gamepad-2",
      title: t("page_resume.skills_gameDev"),
      description: t("page_resume.skills_gameDev_desc"),
    },
    {
      icon: "i-lucide-palette",
      title: t("page_resume.skills_design"),
      description: t("page_resume.skills_design_desc"),
    },
  ];

  const techGroups = (): TechGroup[] => [
    {
      title: t("page_resume.tech_group_webDev"),
      categories: [
        {
          title: t("page_resume.tech_cat_languages"),
          items: [
            {
              label: "TypeScript",
              icon: "i-logos-typescript-icon",
              href: "https://www.typescriptlang.org/",
            },
            {
              label: "Astro",
              icon: "i-logos-astro-icon?mask text-white",
              href: "https://astro.build/",
            },
            { label: "Vue", icon: "i-logos-vue", href: "https://vuejs.org/" },
            { label: "SolidJS", icon: "i-logos-solidjs-icon", href: "https://www.solidjs.com/" },
            { label: "UnoCSS", icon: "i-logos-unocss", href: "https://unocss.dev/" },
          ],
        },
        {
          title: t("page_resume.tech_cat_environment"),
          items: [
            {
              label: "WebStorm",
              icon: "i-logos-webstorm",
              href: "https://www.jetbrains.com/webstorm/",
            },
          ],
        },
        {
          title: t("page_resume.tech_cat_build"),
          items: [
            {
              label: "Vite-plus",
              icon: "i-logos-vite-icon-dark",
              href: "https://viteplus.dev/",
            },
            { label: "pnpm", icon: "i-logos-pnpm", href: "https://pnpm.io/" },
          ],
        },
        {
          title: t("page_resume.tech_cat_deployment"),
          items: [
            {
              label: "Cloudflare",
              icon: "i-logos-cloudflare-icon",
              href: "https://cloudflare.com/",
            },
          ],
        },
      ],
    },
    {
      title: t("page_resume.tech_group_gameDev"),
      categories: [
        {
          title: t("page_resume.tech_cat_languages"),
          items: [
            { label: "C++", icon: "i-logos-c-plusplus", href: "https://isocpp.org/" },
            {
              label: "Verse",
              icon: "i-simple-icons-fortnite",
              href: "https://dev.epicgames.com/documentation/en-us/uefn/verse-language-reference",
            },
          ],
        },
        {
          title: t("page_resume.tech_cat_environment"),
          items: [
            {
              label: "Unreal Engine",
              icon: "i-logos-unrealengine-icon?mask text-white",
              href: "https://www.unrealengine.com/",
            },
            { label: "Rider", icon: "i-logos-rider", href: "https://www.jetbrains.com/rider/" },
          ],
        },
      ],
    },
    {
      title: t("page_resume.tech_group_shared"),
      categories: [
        {
          title: t("page_resume.tech_cat_data"),
          items: [
            {
              label: "PostgreSQL",
              icon: "i-logos-postgresql",
              href: "https://www.postgresql.org/",
            },
            {
              label: "Drizzle",
              icon: "i-catppuccin-drizzle-orm",
              href: "https://orm.drizzle.team/",
            },
          ],
        },
        {
          title: t("page_resume.tech_cat_auth"),
          items: [
            {
              label: "Cloudflare Access",
              icon: "i-simple-icons-cloudflare",
              href: "https://cloudflare.com/",
            },
          ],
        },
        {
          title: t("page_resume.tech_cat_project"),
          items: [
            { label: "Git", icon: "i-logos-git-icon", href: "https://git-scm.com/" },
            {
              label: "Lore",
              icon: "i-simple-icons-epicgames?mask text-white",
              href: "https://dev.epicgames.com/documentation/en-us/uefn/unreal-revision-control-in-unreal-editor-for-fortnite",
            },
            {
              label: "YouTrack",
              icon: "i-logos-youtrack",
              href: "https://www.jetbrains.com/youtrack/",
            },
          ],
        },
      ],
    },
  ];

  const experiences = () => t.raw<ExperienceItem[]>("page_resume.experiences", []);
  const education = () => t.raw<EducationItem[]>("page_resume.education", []);
  const certifications = () => t.raw<CertificationItem[]>("page_resume.certifications", []);
  const projects = () => t.raw<ResumeProject[]>("page_resume.projects", []);

  return (
    <AppLayout title={t("page_resume.meta_title")} description={t("page_resume.meta_description")}>
      <RLContainer class="max-w-none">
        <RLPage>
          <div class="flex flex-col md:flex-row gap-xl">
            {/* Page Body */}
            <div class="flex flex-col gap-xl py-8 md:py-16 flex-1">
              <RLPageSection
                variant="hero"
                orientation="horizontal"
                title={t("page_resume.hero_title")}
                description={t("page_resume.hero_description")}
                links={heroLinks()}
              >
                <RLImage
                  src="https://cdn.idantity.me/Images/Users/Avatars/idantity.me_0000_00.webp"
                  alt={t("page_resume.sidebar_name")}
                  width={800}
                  height={800}
                />
              </RLPageSection>

              {/* Skills Section */}
              <section aria-labelledby="resume-skills-heading" class="flex flex-col gap-md">
                <header class="flex flex-col gap-xs">
                  <h2 id="resume-skills-heading" class="text-3xl font-bold">
                    {t("page_resume.skills_heading")}
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
                    {t("page_resume.tech_heading")}
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
                                        block
                                        justify="start"
                                        variant="ghost"
                                        color="neutral"
                                        leadingIcon={item.icon}
                                        href={item.href}
                                        label={item.label}
                                        class="text-sm"
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
                    {t("page_resume.experience_heading")}
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
                              {t("page_resume.exp_summary_label")}:
                            </span>
                            <p class="text-sm text-neutral-500">{exp.summary}</p>
                          </div>
                        </Show>
                        <Show when={exp.responsibilities && exp.responsibilities.length > 0}>
                          <div>
                            <span class="text-sm font-bold text-neutral-500 block">
                              {t("page_resume.exp_responsibilities_label")}:
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
                    {t("page_resume.education_heading")}
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
                    {t("page_resume.projects_heading")}
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
                                  <time datetime={project.period.start}>
                                    {project.period.start}
                                  </time>
                                  <span aria-hidden="true">–</span>
                                  {project.period.end ? (
                                    <time datetime={project.period.end}>{project.period.end}</time>
                                  ) : (
                                    <span>{t("page_resume.period_present")}</span>
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
                              label={t("page_resume.project_view_button")}
                              aria-label={`${t("page_resume.project_view_button")}: ${project.name}`}
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

                        <Show when={project.imageSrc}>
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
                            <For each={project.highlights}>
                              {(highlight) => <li>{highlight}</li>}
                            </For>
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
                    {t("page_resume.certifications_heading")}
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
                            <Show when={cert.credentialId}>
                              <span class="i-lucide-chevron-down text-neutral-500 transition-transform duration-200 group-open:rotate-180" />
                            </Show>
                          </summary>
                          <Show when={cert.credentialId}>
                            <div class="flex flex-col gap-1.5 pt-1">
                              <code class="block text-xs text-neutral-500 break-all">
                                {t("page_resume.certifications_id_label")}: {cert.credentialId}
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

            {/* Left Sidebar */}
            <aside
              aria-label={t("page_resume.aria_sidebar_profile")}
              class="order-first flex flex-col w-full gap-xl py-8 md:py-16 md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-primary-500 md:pr-8"
            >
              {/* Introduction Section */}
              <section aria-labelledby="resume-sidebar-name" class="flex flex-col items-center">
                <header class="flex flex-col gap-xs items-center">
                  <RLAvatar
                    src="https://cdn.idantity.me/Images/Users/Avatars/idantity.me_0000_00.webp"
                    alt={t("page_resume.sidebar_name")}
                    class="!size-40 border-4 border-primary-500 shadow-xl"
                  />

                  <div class="text-center">
                    <h2 id="resume-sidebar-name" class="text-3xl font-bold">
                      {t("page_resume.sidebar_name")}
                    </h2>
                    <p class="text-md text-neutral-500">{t("page_resume.sidebar_title")}</p>
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
                      {t("page_resume.about_heading")}
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
                          <Show when={aboutDetail.leadingIcon}>
                            <span class={aboutDetail.leadingIcon} />
                          </Show>
                          <span>{aboutDetail.value}</span>
                          <Show when={aboutDetail.trailingIcon}>
                            <span class={aboutDetail.trailingIcon} />
                          </Show>
                        </dd>
                      </div>
                    )}
                  </For>
                  <div class="flex justify-between items-center pb-1.5">
                    <dt>{t("page_resume.about_location_label")}</dt>
                    <dd>
                      <RLLink
                        leadingIcon="i-lucide-map-pin"
                        label={t("page_resume.sidebar_location")}
                        aria-label={`${t("page_resume.about_location_label")}: ${t("page_resume.sidebar_location")}`}
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
                      {t("page_resume.languages_heading")}
                    </h3>
                  </div>
                  <hr aria-hidden="true" class="border-neutral-500" />
                </header>
                <dl class="flex flex-col gap-sm">
                  <For each={languages}>
                    {(language) => (
                      <div class="grid grid-cols-[1fr_auto] gap-y-1 items-center">
                        <dt class="text-sm">{t(`page_resume.${language.nameKey}`)}</dt>
                        <dd class="text-sm text-neutral-500 text-end">
                          {t(`page_resume.${language.levelKey}`)}
                        </dd>
                        <dd class="col-span-2">
                          <RLProgress
                            size="sm"
                            value={language.score}
                            aria-label={`${t(`page_resume.${language.nameKey}`)}: ${t(`page_resume.${language.levelKey}`)}`}
                          />
                        </dd>
                      </div>
                    )}
                  </For>
                </dl>
              </section>
            </aside>
          </div>
        </RLPage>
      </RLContainer>
    </AppLayout>
  );
};

export default ResumePage;
