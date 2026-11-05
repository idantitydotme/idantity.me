import { type Component, For } from "solid-js";
import { RLHeader } from "@rimelight/ui/components/header/RLHeader.tsx";
import { RLLogo } from "@rimelight/ui/components/logo/RLLogo.tsx";
import { RLNavigationMenu } from "@rimelight/ui/components/navigation-menu/RLNavigationMenu.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import type { RLButtonProps } from "@rimelight/ui/components/button/button.types.ts";
import { RLSlideover } from "@rimelight/ui/components/slideover/RLSlideover.tsx";
import { t } from "@rimelight/i18n";

export const AppHeader: Component = () => {
  const leftLinks = () => [
    {
      label: t("app.header.left-links.projects.label"),
      to: "/projects",
    },
    {
      label: t("app.header.left-links.music.label"),
      to: "/music",
    },
    {
      label: t("app.header.left-links.blog.label"),
      to: "/blog",
    },
    {
      label: t("app.header.left-links.about.label"),
      to: "/about",
    },
  ];

  const rightLinks = () => [
    {
      label: t("app.header.right-links.services.label"),
      to: "/services",
    },
    {
      label: t("app.header.right-links.resume.label"),
      to: "/resume",
    },
  ];

  const socials = (): RLButtonProps[] => [
    {
      variant: "ghost",
      leadingIcon: "i-logos-instagram-icon?mask text-white group-hover:text-[#ffbe76]",
      href: "https://instagram.com/idantity.me",
    },
    {
      variant: "ghost",
      leadingIcon: "i-logos-github-icon?mask text-white group-hover:text-[#ffbe76]",
      href: "https://github.com/idantitydotme",
    },
  ];

  const mobileLinks = () => [...leftLinks(), ...rightLinks()];

  return (
    <RLHeader
      contain={false}
      fixed={true}
      data-theme="dark"
      class="bg-primary"
      leadingSlot={
        <div class="flex items-center gap-md">
          <div class="hidden md:flex flex-row gap-md items-center">
            <RLLogo variant="logomark" class="h-8 w-auto" mode="white" />
            <RLNavigationMenu accent="secondary" items={leftLinks()} />
          </div>

          <div class="block md:hidden">
            <RLSlideover
              side="left"
              title={t("app.header.menu.title")}
              ui={{ content: "bg-primary text-white [&_[data-slot=close-button]]:text-white" }}
              triggerSlot={
                <RLButton
                  color="neutral"
                  variant="ghost"
                  leadingIcon="i-lucide-menu"
                  class="text-white"
                  aria-label={t("app.header.menu.open")}
                />
              }
            >
              {() => (
                <div class="flex flex-col gap-sm">
                  <RLNavigationMenu
                    accent="secondary"
                    items={mobileLinks()}
                    orientation="vertical"
                  />
                  <div class="flex flex-row flex-wrap justify-start gap-md">
                    <For each={socials()}>{(buttonProps) => <RLButton {...buttonProps} />}</For>
                  </div>
                </div>
              )}
            </RLSlideover>
          </div>
        </div>
      }
      centerSlot={
        <div class="flex items-center gap-md">
          <div class="block md:hidden">
            <RLLogo variant="logomark" class="size-6" mode="white" />
          </div>
        </div>
      }
      trailingSlot={
        <div class="flex items-center gap-md">
          <div class="hidden md:flex flex-row gap-md items-center">
            <RLNavigationMenu accent="secondary" items={rightLinks()} />
            <For each={socials()}>
              {(buttonProps) => <RLButton {...buttonProps} class="group" />}
            </For>
          </div>
        </div>
      }
    />
  );
};

export default AppHeader;
