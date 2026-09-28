import { type Component, For, Show } from "solid-js"
import { RLCard, RLIcon } from "@rimelight/ui"

function inlinesToMarkdown(inlines: any): string {
  if (!inlines) return ""
  if (typeof inlines === "string") return inlines
  if (!Array.isArray(inlines)) {
    return inlines.en || ""
  }

  return inlines
    .map((node: any) => {
      if (node.type === "text") {
        let text = node.text || ""
        const marks = node.marks || []
        if (marks.includes("code")) text = `\`${text}\``
        if (marks.includes("bold")) text = `**${text}**`
        if (marks.includes("italic")) text = `*${text}*`
        if (marks.includes("strikethrough")) text = `~~${text}~~`
        return text
      }
      if (node.type === "link") {
        const linkText = (node.children || []).map((c: any) => c.text).join("") || node.url
        return `[${linkText}](${node.url})`
      }
      if (node.type === "page_mention") {
        const title = node.displayTitle || node.pageSlug || "Page"
        return `[${title}](/${node.pageSlug || ""})`
      }
      return ""
    })
    .join("")
}

interface PageRendererProps {
  blocks?: any[]
  locale?: string
  session?: any
  class?: string
}

export const BlockRenderer: Component<{ block: any; locale?: string | undefined }> = (props) => {
  const b = () => props.block || {}
  const type = () => b().type
  const p = () => b().props || {}
  const children = () => b().children || p().children || []

  return (
    <Show when={b().type}>
      <Show when={type() === "SectionBlock"}>
        <section class="my-6">
          <Show when={p().title}>
            <h2 class="text-2xl font-bold text-highlighted mb-2">{p().title}</h2>
          </Show>
          <Show when={p().description}>
            <p class="text-sm text-muted mb-4">{p().description}</p>
          </Show>
          <For each={children()}>
            {(child) => <BlockRenderer block={child} locale={props.locale} />}
          </For>
        </section>
      </Show>

      <Show when={type() === "ParagraphBlock"}>
        <p class="text-default leading-relaxed mb-4 text-base">{inlinesToMarkdown(p().text)}</p>
      </Show>

      <Show when={type() === "CalloutBlock"}>
        <div class="my-4 p-4 rounded-xl border border-primary/20 bg-primary/5 text-default flex gap-3">
          <RLIcon name="i-lucide-info" class="size-5 text-primary shrink-0 mt-0.5" />
          <div class="flex-1 text-sm space-y-2">
            <For each={children()}>
              {(child) => <BlockRenderer block={child} locale={props.locale} />}
            </For>
          </div>
        </div>
      </Show>

      <Show when={type() === "CodeBlock"}>
        <div class="my-4 rounded-xl border border-default bg-neutral-900 text-neutral-100 overflow-hidden font-mono text-sm">
          <Show when={p().language || p().caption}>
            <div class="px-4 py-2 border-b border-neutral-800 text-xs text-neutral-400 flex justify-between">
              <span>{p().language || "code"}</span>
              <span>{p().caption || ""}</span>
            </div>
          </Show>
          <pre class="p-4 overflow-x-auto">
            <code>{p().code}</code>
          </pre>
        </div>
      </Show>

      <Show when={type() === "CardsBlock"}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <For each={children()}>
            {(child) => <BlockRenderer block={child} locale={props.locale} />}
          </For>
        </div>
      </Show>

      <Show when={type() === "CardBlock"}>
        <a href={p().href || "#"} class="block group">
          <RLCard
            title={p().title}
            description={p().description}
            class="h-full group-hover:border-primary/50 transition-colors"
          />
        </a>
      </Show>

      <Show when={type() === "ImageBlock"}>
        <figure class="my-6">
          <img
            src={p().src}
            alt={p().alt || ""}
            class="rounded-xl border border-default max-w-full h-auto"
          />
          <Show when={p().caption}>
            <figcaption class="text-xs text-muted mt-2 text-center">{p().caption}</figcaption>
          </Show>
        </figure>
      </Show>

      <Show
        when={
          ![
            "SectionBlock",
            "ParagraphBlock",
            "CalloutBlock",
            "CodeBlock",
            "CardsBlock",
            "CardBlock",
            "ImageBlock"
          ].includes(type())
        }
      >
        <Show when={p().text}>
          <p class="text-default leading-relaxed mb-4">{inlinesToMarkdown(p().text)}</p>
        </Show>
        <For each={children()}>
          {(child) => <BlockRenderer block={child} locale={props.locale} />}
        </For>
      </Show>
    </Show>
  )
}

export const PageRenderer: Component<PageRendererProps> = (props) => {
  const blockList = () => props.blocks || []

  return (
    <article class={`rimelight-cms-page ${props.class || ""}`}>
      <For each={blockList()}>
        {(block) => <BlockRenderer block={block} locale={props.locale} />}
      </For>
    </article>
  )
}

export default PageRenderer
