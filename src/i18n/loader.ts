import type { TranslationLoader, ComponentsJSON } from "@nanostores/i18n"

const translationModules = import.meta.glob<{ default: ComponentsJSON }>("../translations/*.json", {
  eager: true
})

const loader: TranslationLoader = async (locale, _components) => {
  const key = Object.keys(translationModules).find((k) => k.includes(`/${locale}.json`))
  if (!key) return {}
  const mod = translationModules[key]
  if (!mod) return {}
  return mod.default
}

export default loader
