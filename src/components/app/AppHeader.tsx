import { type Component, For, Show } from "solid-js";
import {
  RLHeader,
  RLLogo,
  RLNavigationMenu,
  RLButton,
  RLSlideover,
  RLAvatar,
  RLPopover,
  type RLButtonProps,
} from "@rimelight/ui";
import { t, getLocaleUrl } from "@rimelight/i18n";

export interface AppHeaderProps {
  session?: any;
  stackIndex?: number;
}

export const AppHeader: Component<AppHeaderProps> = (props) => {
  const leftLinks = () => [
    {
      label: t("app_header.left-links_projects_label"),
      to: getLocaleUrl("/projects"),
    },
    {
      label: t("app_header.left-links_music_label"),
      to: getLocaleUrl("/music"),
    },
    {
      label: t("app_header.left-links_blog_label"),
      to: getLocaleUrl("/blog"),
    },
    {
      label: t("app_header.left-links_about_label"),
      to: getLocaleUrl("/about"),
    },
  ];

  const rightLinks = () => [
    {
      label: t("app_header.right-links_services_label"),
      to: getLocaleUrl("/services"),
    },
    {
      label: t("app_header.right-links_resume_label"),
      to: getLocaleUrl("/resume"),
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
      left={
        <div class="flex items-center gap-md">
          <div class="hidden md:flex flex-row gap-md items-center">
            <RLLogo variant="logomark" class="h-10 w-auto" mode="white" />
            <RLNavigationMenu
              items={leftLinks()}
              variant="link"
              theme="flat"
              ui={{
                link: "text-white transition-colors duration-200 hover:text-primary-400 data-[state=open]:text-primary-400 aria-[current]:text-primary-400",
              }}
            />
          </div>

          <div class="block md:hidden">
            <RLSlideover
              side="left"
              title="Menu"
              trigger={
                <RLButton
                  color="neutral"
                  variant="ghost"
                  rounded={true}
                  leadingIcon="i-lucide-menu"
                  class="!text-white"
                  aria-label="Open Menu"
                />
              }
            >
              <RLNavigationMenu
                items={allMobileLinks()}
                orientation="vertical"
                variant="link"
                ui={{
                  link: "text-black dark:text-white flex justify-start items-center w-full text-left py-2 text-lg transition-colors duration-200 hover:text-primary-400 data-[state=open]:text-primary-400 aria-[current]:text-primary-400",
                }}
              />
            </RLSlideover>
          </div>
        </div>
      }
      center={
        <div class="flex items-center gap-md">
          <div class="block md:hidden">
            <RLLogo variant="logomark" class="h-10 w-auto" mode="white" />
          </div>
        </div>
      }
      right={
        <div class="flex items-center gap-md">
          <div class="hidden md:flex flex-row gap-md items-center">
            <RLNavigationMenu
              items={rightLinks()}
              variant="link"
              theme="flat"
              ui={{
                link: "text-white transition-colors duration-200 hover:text-primary-400 data-[state=open]:text-primary-400 aria-[current]:text-primary-400",
              }}
            />
            <For each={socials()}>{(buttonProps) => <RLButton {...buttonProps} />}</For>

            <Show when={props.session}>
              <RLPopover
                placement="bottom-end"
                class="relative group/popover ml-2"
                trigger={
                  <div class="flex items-center gap-xs cursor-pointer text-white hover:text-primary-400 transition-colors py-1 px-2 rounded-lg">
                    <div class="relative">
                      <RLAvatar src={props.session.avatar} alt={props.session.name} size="sm" />
                      <span class="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-black bg-success-500" />
                    </div>
                    <span class="hidden md:inline text-sm font-medium">{props.session.name}</span>
                  </div>
                }
              >
                <div class="flex flex-col gap-2 min-w-[240px] text-neutral-900 dark:text-neutral-100">
                  <div class="flex items-center gap-sm pb-2 border-b border-neutral-200 dark:border-neutral-800">
                    <RLAvatar src={props.session.avatar} alt={props.session.name} size="md" />
                    <div class="flex flex-col">
                      <span class="font-semibold text-sm">{props.session.name}</span>
                      <span class="text-xs text-neutral-500 truncate max-w-[150px]">
                        {props.session.email}
                      </span>
                    </div>
                  </div>
                </div>
              </RLPopover>
            </Show>
          </div>

          <div class="block md:hidden">
            <RLSlideover
              side="right"
              title="Actions"
              trigger={
                <RLButton
                  color="neutral"
                  variant="ghost"
                  rounded={true}
                  leadingIcon="i-lucide-ellipsis-vertical"
                  class="!text-white"
                  aria-label="Open Actions"
                />
              }
            >
              <div class="flex flex-col gap-md">
                <For each={socials()}>
                  {(buttonProps) => <RLButton {...buttonProps} block={true} />}
                </For>
              </div>
            </RLSlideover>
          </div>
        </div>
      }
    />
  );
};

export default AppHeader;
