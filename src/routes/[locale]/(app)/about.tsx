import { useHead } from "@solidjs/web";
import { createPageHead } from "@rimelight/seo/head";
import { RLPageSection } from "@rimelight/ui/components/page-section/RLPageSection.tsx";
import { RLImage } from "@rimelight/ui/components/image/RLImage.tsx";
import { RLLink } from "@rimelight/ui/components/link/RLLink.tsx";
import { t } from "@rimelight/i18n";
import { MosaicBackdrop } from "#components/app/MosaicBackdrop";

export default function AboutPage() {
  useHead(() =>
    createPageHead({
      title: t("page.about.meta.title"),
      description: t("page.about.meta.description"),
    }),
  );

  const [heroName, heroSuffix] = t("page.about.heading").split(".");
  const [petsName, petsSuffix] = t("page.about.sections.pets.title").split(".");

  return (
    <>
      <RLPageSection
        layout="hero"
        data-theme="light"
        titleSlot={
          <>
            {heroName}
            <span class="text-primary">.</span>
            {heroSuffix}
          </>
        }
        description={t("page.resume.hero.description")}
        backgroundSlot={<MosaicBackdrop tone="mixed" seed={5} class="opacity-100" />}
        ui={{
          title: (base) => base.replace("text-center", "text-left"),
          description: (base) => base.replace("text-center", "text-left"),
        }}
        bodySlot={
          <div class="grid gap-lg lg:grid-cols-2 lg:items-start">
            <p>
              {t("page.about.intro.before")}
              <RLLink
                href="https://en.wikipedia.org/wiki/Property_(programming)#Dot_notation"
                label={t("page.about.intro.link")}
              />
              {t("page.about.intro.after")}
            </p>
            <div class="relative pr-8 pb-6">
              <div aria-hidden="true" class="absolute inset-0 mt-4 ml-4 bg-secondary-400" />
              <RLImage
                src="https://cdn.idantity.me/images/users/avatars/idantity.me_0000_00.webp"
                alt={t("page.about.image-alt")}
                width={800}
                height={800}
                ui={{ root: (base) => base.replace("rounded-lg", "rounded-none") }}
              />
            </div>
          </div>
        }
      />

      <RLPageSection
        titleSlot={
          <>
            {petsName}
            <span class="text-primary">.</span>
            {petsSuffix}
          </>
        }
        orientation="horizontal"
        data-theme="light"
        backgroundSlot={<MosaicBackdrop tone="blue" seed={11} class="opacity-100" />}
        reverse
        ui={{
          root: (base) => `${base} text-neutral-950`,
          container: (base) => base.replace("lg:items-center", "lg:items-start"),
        }}
        footerSlot={<p>{t("page.about.sections.pets.footer")}</p>}
      >
        <div class="relative aspect-square">
          <div class="absolute top-0 left-0 w-3/5 p-8">
            <div
              aria-hidden="true"
              class="absolute inset-0 bg-primary-500 [clip-path:polygon(28%_0,100%_0,100%_72%,72%_100%,0_100%,0_28%)]"
            />
            <div class="relative flex [clip-path:polygon(28%_0,100%_0,100%_72%,72%_100%,0_100%,0_28%)]">
              <RLImage
                src="https://cdn.idantity.me/images/pets/toya.webp"
                alt={t("page.about.sections.pets.toya-alt")}
                width={800}
                height={800}
              />
            </div>
          </div>
          <div class="absolute bottom-0 right-0 w-3/5 p-8">
            <div
              aria-hidden="true"
              class="absolute inset-0 bg-secondary-400 [clip-path:polygon(0_0,72%_0,100%_28%,100%_100%,28%_100%,0_72%)]"
            />
            <div class="relative flex [clip-path:polygon(0_0,72%_0,100%_28%,100%_100%,28%_100%,0_72%)]">
              <RLImage
                src="https://cdn.idantity.me/images/pets/goldy.webp"
                alt={t("page.about.sections.pets.goldy-alt")}
                width={800}
                height={800}
              />
            </div>
          </div>
        </div>
      </RLPageSection>
    </>
  );
}
