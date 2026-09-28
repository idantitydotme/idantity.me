import { type Component, For } from "solid-js"
import {
  RLFooter,
  RLLogo,
  RLButton,
  RLLinkGroup,
  RLThemeSelector,
  RLLocaleSelector,
  type RLButtonProps,
  type RLLinkGroupProps
} from "@rimelight/ui"
import { t, getRelativeLocaleUrl } from "@rimelight/i18n"

export const AppFooter: Component = () => {
  const columns = (): RLLinkGroupProps[] => [
    {
      label: t("app_footer.links_resources_label"),
      links: [
        {
          label: t("app_footer.links_resources_branding"),
          href: getRelativeLocaleUrl("/branding")
        }
      ]
    },
    {
      label: t("app_footer.links_legal_label"),
      links: [
        {
          label: t("app_footer.links_legal_privacy-policy"),
          href: getRelativeLocaleUrl("/legal/privacy-policy")
        },
        {
          label: t("app_footer.links_legal_other-documents"),
          href: getRelativeLocaleUrl("/legal")
        }
      ]
    }
  ]

  const socials = (): RLButtonProps[] => [
    {
      leadingIcon: "i-logos-instagram-icon?mask text-white group-hover:text-primary-500",
      href: "https://www.instagram.com/idantity.me"
    },
    {
      leadingIcon: "i-logos-discord-icon?mask text-white group-hover:text-primary-500",
      href: "https://discord.com/users/682049695173836979"
    },
    {
      leadingIcon: "i-logos-spotify-icon?mask text-white group-hover:text-primary-500",
      href: "https://open.spotify.com/user/v5m4qoc9j35ccc6nbzqcookvj?si=d795f9bc1cb34222"
    },
    {
      leadingIcon: "i-logos-github-icon?mask text-white group-hover:text-primary-500",
      href: "https://www.github.com/idantitydotme"
    },
    {
      leadingIcon: "i-logos-linkedin-icon?mask text-white group-hover:text-primary-500",
      href: "https://www.linkedin.com/daniel-marchi"
    }
  ]

  const targetLanguages = () => [
    { code: "en", label: "English", href: getRelativeLocaleUrl("/en") },
    { code: "pt", label: "Português", href: getRelativeLocaleUrl("/pt") }
  ]

  return (
    <RLFooter
      contain={false}
      data-theme="dark"
      class="bg-black z-50"
      left={
        <div class="flex flex-col justify-between h-full gap-xs lg:items-start">
          <RLLogo variant="logotype" class="h-6 w-auto" />
          <div>
            <p class="text-sm text-white">Accessing me.</p>
            <span class="text-sm text-white">© {new Date().getFullYear()} idantity.me</span>
          </div>
        </div>
      }
      center={
        <div class="flex flex-col md:flex-row gap-12">
          <For each={columns()}>{(column) => <RLLinkGroup {...column} />}</For>
        </div>
      }
      right={
        <div class="flex flex-col justify-between h-full gap-sm lg:items-end">
          <div class="flex flex-col gap-sm items-center lg:items-end">
            <RLThemeSelector class="min-w-44" />
            <RLLocaleSelector locales={targetLanguages()} class="min-w-44" />
          </div>
          <div class="flex flex-row flex-wrap gap-sm justify-center lg:justify-end items-center lg:items-end">
            <For each={socials()}>
              {(social) => <RLButton variant="ghost" size="xl" {...social} />}
            </For>
          </div>
        </div>
      }
    />
  )
}

export default AppFooter
