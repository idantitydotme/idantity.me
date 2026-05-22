<script setup lang="ts">
import { reactive, onMounted, useTemplateRef, watch, nextTick, computed } from "vue"
import { Modal, Icon, Button, Separator } from "@rimelight/ui/nuxt"

/* region Props */
export interface AssetImageProps {
  src: string
  alt?: string
  height?: string | number
  width?: string | number
  loading?: "lazy" | "eager"
  fit?: "cover" | "contain" | "fill" | "inside" | "outside"
  /**
   * Optional pre-calculated metadata
   */
  metadata?: {
    width?: number
    height?: number
    size?: string | number
    format?: string
  }
}

const {
  src,
  alt = "Image",
  height,
  width,
  loading = "lazy",
  fit = "cover",
  metadata: initialMetadata
} = defineProps<AssetImageProps>()
/* endregion */

/* region Emits */
export interface AssetImageEmits {}
const emit = defineEmits<AssetImageEmits>()
/* endregion */

/* region Slots */
export interface AssetImageSlots {
  /**
   * The trigger content for the image viewer
   */
  trigger?: (props: { open: () => void }) => any
}
defineSlots<AssetImageSlots>()
/* endregion */

/* region State */
const open = defineModel<boolean>("open", { default: false })
const imgElement = useTemplateRef<HTMLImageElement>("imgRef")
const expandedImgElement = useTemplateRef<HTMLImageElement>("expandedImgRef")

const internalMetadata = reactive({
  width: initialMetadata?.width ?? 0,
  height: initialMetadata?.height ?? 0,
  size:
    typeof initialMetadata?.size === "number"
      ? formatBytes(initialMetadata.size)
      : (initialMetadata?.size ?? ""),
  format: initialMetadata?.format ?? "",
  mimeType: ""
})

const displayMetadata = computed(() => ({
  width: internalMetadata.width || 0,
  height: internalMetadata.height || 0,
  size: internalMetadata.size || "Unknown",
  format: internalMetadata.format || "IMG"
}))
/* endregion */

/* region Lifecycle */
onMounted(() => {
  nextTick(() => {
    if (imgElement.value) {
      const el = imgElement.value
      if (el.complete) {
        updateMetadata(el)
      }
    }
  })
})

watch(open, (isOpen) => {
  if (isOpen && (!internalMetadata.width || !internalMetadata.size)) {
    // Try to fetch metadata if missing when opened
    if (expandedImgElement.value) {
      updateMetadata(expandedImgElement.value)
    } else {
      fetchExtendedMetadata()
    }
  }
})

watch(
  () => imgElement.value,
  (el) => {
    if (el && el.complete && el.naturalWidth > 0) {
      updateMetadata(el)
    }
  },
  { immediate: true }
)
/* endregion */

/* region Logic */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

async function fetchExtendedMetadata() {
  try {
    const response = await fetch(src, {
      method: "GET"
    })

    if (!response.ok) throw new Error("Network response was not ok")

    const blob = await response.blob()

    if (!internalMetadata.size || internalMetadata.size === "Unknown") {
      internalMetadata.size = formatBytes(blob.size)
    }

    const type = response.headers.get("content-type") || blob.type
    if (type) {
      internalMetadata.mimeType = type
      if (!internalMetadata.format) {
        internalMetadata.format = type.split("/")[1]?.split("+")[0]?.toUpperCase() || "IMG"
      }
    }

    if (internalMetadata.format === "SVG" && !internalMetadata.width) {
      const tempImg = new Image()
      tempImg.src = URL.createObjectURL(blob)
      await tempImg.decode()
      internalMetadata.width = tempImg.naturalWidth
      internalMetadata.height = tempImg.naturalHeight
      URL.revokeObjectURL(tempImg.src)
    }
  } catch (e) {
    console.warn("Metadata fetch failed:", e)
    if (!internalMetadata.format) {
      internalMetadata.format = src.split(".").pop()?.toUpperCase() || "IMG"
    }
  }
}

function updateMetadata(el: HTMLImageElement | null) {
  if (typeof window === "undefined" || !el) return

  if (el.naturalWidth > 0) {
    internalMetadata.width = el.naturalWidth
    internalMetadata.height = el.naturalHeight
    fetchExtendedMetadata()
  }
}

function handleImageLoad(event: Event, isExpanded = false) {
  if (isExpanded) return
  updateMetadata(event.currentTarget as HTMLImageElement)
}

async function downloadImage() {
  try {
    const response = await fetch(src)
    const blob = await response.blob()

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `file-${Date.now()}.${displayMetadata.value.format.toLowerCase()}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Download failed", error)
  }
}
/* endregion */
</script>

<template>
  <Modal
    v-model:open="open"
    title="Image Viewer"
    :description="src"
    :ui="{
      content: 'w-fit max-w-[98vw] sm:max-w-[95vw] mx-auto'
    }"
  >
    <template #default>
      <slot name="trigger" :open="() => (open = true)">
        <div class="relative inline-block cursor-pointer" @click.stop="open = true">
          <img
            ref="imgRef"
            :src="src"
            :alt="alt"
            :height="height"
            :width="width"
            :loading="loading"
            class="w-full h-full transition-transform duration-300 hover:scale-[1.02] active:scale-95"
            :style="{ objectFit: fit }"
            @load="handleImageLoad($event, false)"
          />
        </div>
      </slot>
    </template>

    <template #body>
      <div class="flex flex-col gap-4">
        <div class="flex-1 min-h-0 w-full flex items-center">
          <img
            ref="expandedImgRef"
            :src="src"
            :alt="alt"
            class="w-full h-full object-contain mx-auto block rounded-lg"
            @load="handleImageLoad($event, true)"
          />
        </div>

        <Separator />

        <div class="flex items-center justify-between gap-8">
          <div class="flex flex-col gap-1">
            <div class="flex flex-row gap-2 items-center">
              <Icon name="lucide:image" class="size-4" />
              <p class="text-sm">
                Source: <span class="text-neutral-500">{{ src }}</span>
              </p>
            </div>
            <div class="flex flex-row gap-2 items-center">
              <Icon name="lucide:file-question" class="size-4" />
              <p class="text-sm">
                Format: <span class="text-neutral-500">{{ displayMetadata.format }}</span>
              </p>
            </div>
            <div class="flex flex-row gap-2 items-center">
              <Icon name="lucide:weight" class="size-4" />
              <p class="text-sm">
                Size: <span class="text-neutral-500">{{ displayMetadata.size }}</span>
              </p>
            </div>
            <div class="flex flex-row gap-2 items-center">
              <Icon name="lucide:maximize" class="size-4" />
              <p class="text-sm">
                Dimensions:
                <span class="text-neutral-500"
                  >{{ displayMetadata.width }} × {{ displayMetadata.height }}</span
                >
              </p>
            </div>
          </div>

          <Button icon="lucide:download" label="Download Original" @click="downloadImage" />
        </div>
      </div>
    </template>
  </Modal>
</template>
