import type { Component } from "solid-js"
import AppLayout from "#layouts/AppLayout"
import { RLPageSection, RLImage } from "@rimelight/ui"
import { t } from "@rimelight/i18n"

export const AboutPage: Component = () => {
  return (
    <AppLayout title={t("page_about.title")} description={t("page_about.description")}>
      <RLPageSection variant="hero" title="About Me" orientation="horizontal">
        <RLImage src="https://cdn.idantity.me/images/placeholder.webp" alt="Daniel Marchi" />
      </RLPageSection>

      <RLPageSection
        title="Behind the name"
        orientation="horizontal"
        reverse
        body={
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
        <RLImage src="https://cdn.idantity.me/images/placeholder.webp" alt="Daniel Marchi" />
      </RLPageSection>

      <RLPageSection
        title="Pets"
        description="Who keeps me company throughout my day."
        orientation="horizontal"
        footer={
          <div>
            <p class="text-sm text-muted-foreground">
              I've had cats my entire life, and currently live with two beautiful companions.
            </p>
          </div>
        }
      >
        <RLImage src="https://cdn.idantity.me/images/placeholder.webp" alt="Daniel Marchi" />
      </RLPageSection>
    </AppLayout>
  )
}

export default AboutPage
