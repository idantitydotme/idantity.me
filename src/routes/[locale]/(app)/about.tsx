import { useHead } from "@solidjs/web";
import { createPageHead } from "@rimelight/seo/head";
import { RLPageSection } from "@rimelight/ui/components/page-section/RLPageSection.tsx";
import { RLImage } from "@rimelight/ui/components/image/RLImage.tsx";
import { t } from "@rimelight/i18n";

export default function AboutPage() {
  useHead(() =>
    createPageHead({
      title: t("page.about.meta.title"),
      description: t("page.about.meta.description"),
    }),
  );

  return (
    <>
      <RLPageSection layout="hero" title={t("page.about.heading")} orientation="horizontal">
        <RLImage
          src="https://cdn.idantity.me/images/placeholder.webp"
          alt={t("page.about.image-alt")}
        />
      </RLPageSection>

      <RLPageSection
        title={t("page.about.sections.name.title")}
        orientation="horizontal"
        reverse
        bodySlot={
          <p class="text-sm sm:text-base text-muted-foreground leading-relaxed">
            In many programming languages,{" "}
            <a
              href="https://en.wikipedia.org/wiki/Property_(programming)#Dot_notation"
              class="underline hover:text-primary transition-colors font-medium"
            >
              "dot notation"
            </a>{" "}
            is the concept of using dots ('.') as a way to access internal properties or
            functionality of an entity. It symbolizes struggles I've had throughout the years with
            self identity, and in accessing emotions.
          </p>
        }
      >
        <RLImage
          src="https://cdn.idantity.me/images/placeholder.webp"
          alt={t("page.about.image-alt")}
        />
      </RLPageSection>

      <RLPageSection
        title={t("page.about.sections.pets.title")}
        description="Who keeps me company throughout my day."
        orientation="horizontal"
        footerSlot={
          <div>
            <p class="text-sm text-muted-foreground">
              I've had cats my entire life, and currently live with two beautiful companions.
            </p>
          </div>
        }
      >
        <RLImage
          src="https://cdn.idantity.me/images/placeholder.webp"
          alt={t("page.about.image-alt")}
        />
      </RLPageSection>
    </>
  );
}
