import { type Component, For } from "solid-js";
import { RLHeader } from "@rimelight/ui/components/header/RLHeader.tsx";
import { RLLogo } from "@rimelight/ui/components/logo/RLLogo.tsx";
import { RLNavigationMenu } from "@rimelight/ui/components/navigation-menu/RLNavigationMenu.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLSlideover } from "@rimelight/ui/components/slideover/RLSlideover.tsx";
import type { RLButtonProps } from "@rimelight/ui/components/button/button.types.ts";
import { t } from "@rimelight/i18n";

export interface AppHeaderProps {
  stackIndex?: number;
}

export const AppHeader: Component<AppHeaderProps> = (props) => {
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
      leadingIcon: "i-logos-instagram-icon?mask text-white group-hover:text-primary-500",
      href: "https://instagram.com/idantity.me",
    },
    {
      variant: "ghost",
      leadingIcon: "i-logos-github-icon?mask text-white group-hover:text-primary-500",
      href: "https://github.com/idantitydotme",
    },
  ];

  const allMobileLinks = () => [...leftLinks(), ...rightLinks()];

  return (
    <RLHeader
      contain={false}
      fixed={true}
      stackIndex={props.stackIndex ?? 1}
      data-theme="dark"
      class="bg-black"
      leadingSlot={
        <div class="flex items-center gap-md">
          <div class="hidden md:flex flex-row gap-md items-center">
            <RLLogo variant="logomark" class="h-10 w-auto" mode="white" />
            <RLNavigationMenu
              items={leftLinks()}
              ui={{
                link: "text-white transition-colors duration-200 hover:text-primary-400 data-[state=open]:text-primary-400 aria-[current]:text-primary-400",
              }}
            />
          </div>

          <div class="block md:hidden">
            <RLSlideover
              side="left"
              title={t("app.header.menu.title")}
              triggerSlot={
                <RLButton
                  color="neutral"
                  variant="ghost"
                  rounded={true}
                  leadingIcon="i-lucide-menu"
                  class="!text-white"
                  aria-label={t("app.header.menu.open")}
                />
              }
            >
              {() => (
                <RLNavigationMenu
                  items={allMobileLinks()}
                  orientation="vertical"
                  ui={{
                    link: "text-black dark:text-white flex justify-start items-center w-full text-left py-2 text-lg transition-colors duration-200 hover:text-primary-400 data-[state=open]:text-primary-400 aria-[current]:text-primary-400",
                  }}
                />
              )}
            </RLSlideover>
          </div>
        </div>
      }
      centerSlot={
        <div class="flex items-center gap-md">
          <div class="block md:hidden">
            <RLLogo variant="logomark" class="h-10 w-auto" mode="white" />
          </div>
        </div>
      }
      trailingSlot={
        <div class="flex items-center gap-md">
          <div class="hidden md:flex flex-row gap-md items-center">
            <RLNavigationMenu
              items={rightLinks()}
              ui={{
                link: "text-white transition-colors duration-200 hover:text-primary-400 data-[state=open]:text-primary-400 aria-[current]:text-primary-400",
              }}
            />
            <For each={socials()}>{(buttonProps) => <RLButton {...buttonProps} />}</For>
          </div>

          <div class="block md:hidden">
            <RLSlideover
              side="right"
              title={t("app.header.actions.title")}
              triggerSlot={
                <RLButton
                  color="neutral"
                  variant="ghost"
                  rounded={true}
                  leadingIcon="i-lucide-ellipsis-vertical"
                  class="!text-white"
                  aria-label={t("app.header.actions.open")}
                />
              }
            >
              {() => (
                <div class="flex flex-col gap-md">
                  <For each={socials()}>
                    {(buttonProps) => <RLButton {...buttonProps} block={true} />}
                  </For>
                </div>
              )}
            </RLSlideover>
          </div>
        </div>
      }
    />
  );
};

export default AppHeader;
