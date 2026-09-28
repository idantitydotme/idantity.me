import { type Component, Show } from "solid-js"
import { useSearchParams } from "@solidjs/router"
import BlankLayout from "#layouts/BlankLayout"
import { RLCard, RLFormField, RLInput, RLButton, RLCheckbox, RLLogo } from "@rimelight/ui"
import { t } from "@rimelight/i18n"

export const ConstructionPage: Component = () => {
  const [searchParams] = useSearchParams()
  const redirect = () => searchParams["redirect"] || "/"
  const isError = () => searchParams["error"] === "invalid"

  return (
    <BlankLayout
      title={t("page_construction.meta_title")}
      description={t("page_construction.meta_description")}
      noindex={true}
    >
      <div class="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div class="w-full max-w-md space-y-6 text-center">
          <div class="flex flex-col items-center gap-4">
            <RLLogo class="h-12 w-auto" variant="logomark" />
            <h1 class="m-0 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("page_construction.title")}
            </h1>
            <p class="m-0 text-neutral-400 text-sm">{t("page_construction.description")}</p>
          </div>

          <RLCard class="text-left w-full">
            <Show when={isError()}>
              <div
                class="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400"
                role="alert"
              >
                Invalid credentials. Please try again.
              </div>
            </Show>

            {/* Native Server-Side Form POST */}
            <form method="post" action="/api/construction-guest" class="flex flex-col gap-4">
              <input type="hidden" name="redirect" value={redirect()} />

              <RLFormField label={t("page_construction.form_passphrase_label")} required>
                <RLInput
                  id="construction-passphrase-input"
                  type="password"
                  name="passphrase"
                  placeholder={t("page_construction.form_passphrase_placeholder")}
                  class="w-full"
                  required
                  autofocus
                  autocomplete="current-password"
                />
              </RLFormField>

              <RLCheckbox
                id="construction-remember-me-checkbox"
                name="rememberMe"
                label={t("page_construction.form_remember_me_label")}
                checked
              />

              <RLButton type="submit" color="primary" variant="solid" block class="w-full mt-2">
                {t("page_construction.form_sign_in_button")}
              </RLButton>
            </form>
          </RLCard>
        </div>
      </div>
    </BlankLayout>
  )
}

export default ConstructionPage
