export interface PropMeta {
  name: string
  type: string
  default?: string
  required: boolean
  description: string
}

export interface SlotMeta {
  name: string
  bindings: Record<string, string>
  description: string
}

export interface EmitMeta {
  name: string
  type: string
  description: string
}

export interface ThemeMeta {
  slots: string[]
  base: Record<string, string | string[]>
  variants: Record<string, Record<string, Record<string, string | string[]>>>
  compoundVariants: Record<string, unknown>[]
  defaultVariants: Record<string, unknown>
}

export interface ComponentMeta {
  name: string
  astroComponent: string | null
  vueComponent: string | null
  frameworks: ("astro" | "vue")[]
  props: PropMeta[]
  slots: SlotMeta[]
  emits: EmitMeta[]
  theme: ThemeMeta | null
}

export type ComponentMetaMap = Record<string, ComponentMeta>
