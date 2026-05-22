<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue"
import draggable from "vuedraggable"
import {
  Modal,
  Tree,
  Button,
  Icon,
  Empty,
  FileUpload,
  Checkbox,
  FieldGroup
} from "@rimelight/ui/nuxt"
import AssetImage from "./AssetImage.vue"

/* region Props */
export interface AssetManagerModalProps {
  selectionMode?: boolean
}

const { selectionMode = false } = defineProps<AssetManagerModalProps>()
const open = defineModel<boolean>("open", { default: false })
/* endregion */

/* region Emits */
const emit = defineEmits<{
  close: []
  select: [key: string]
}>()
/* endregion */

/* region Types */
interface Asset {
  key: string
  size: number
  uploaded: string
  contentType?: string
  etag?: string
  [key: string]: any
}

interface TreeItem {
  label: string
  fullPath: string
  icon?: string
  defaultExpanded?: boolean
  children?: TreeItem[]
}
/* endregion */

/* region State */
const assets = ref<Asset[]>([])
const status = ref<"idle" | "pending" | "success" | "error">("idle")
const selectedPath = ref("")
const selectedKeys = ref<string[]>([])
const localFolders = ref<string[]>([])
const isProcessing = ref(false)

const isDragging = ref(false)
const draggedItem = ref<any>(null)
const dropTarget = ref<any>(null)

// --- Modal States ---
const showNewFolderModal = ref(false)
const newFolderName = ref("")
const showUploadModal = ref(false)
const pendingFiles = ref<File[]>([])
const uploadFileBasename = ref("")
const uploadFileExtension = ref("")
const uploadTargetFolder = ref("")
const showMoveModal = ref(false)
const movingAsset = ref<any>(null)
const moveTargetBasename = ref("")
const moveTargetFolder = ref("")

const fileInput = ref<HTMLInputElement | null>(null)
/* endregion */

/* region API Logic */
async function refresh() {
  status.value = "pending"
  try {
    const response = await fetch(`/api/assets?t=${Date.now()}`)
    if (!response.ok) throw new Error("Failed to fetch assets")
    const data = await response.json()
    assets.value = data
    status.value = "success"
  } catch (err) {
    console.error(err)
    status.value = "error"
  }
}

async function uploadAsset(file: File | File[], targetPath: string, customBasename?: string) {
  const files = Array.isArray(file) ? file : [file]
  isProcessing.value = true

  try {
    for (const f of files) {
      const buffer = await f.arrayBuffer()
      const { extension, basename } = splitFilename(f.name)
      const finalBasename = files.length === 1 && customBasename ? customBasename : basename
      const filename = finalBasename + extension
      const fullKey = targetPath ? `${targetPath}/${filename}` : filename
      const encodedKey = fullKey.split("/").map(encodeURIComponent).join("/")

      const response = await fetch(`/api/assets/${encodedKey}`, {
        method: "PUT",
        body: buffer,
        headers: { "Content-Type": f.type }
      })
      if (!response.ok) throw new Error(`Failed to upload ${f.name}`)
    }
    await refresh()
    return true
  } catch (err) {
    console.error(err)
    window.alert("Failed to upload asset(s)")
    return false
  } finally {
    isProcessing.value = false
  }
}

async function deleteAsset(key: string) {
  if (!window.confirm(`Are you sure you want to delete ${key}?`)) return false

  try {
    const encodedKey = key.split("/").map(encodeURIComponent).join("/")
    const response = await fetch(`/api/assets/${encodedKey}`, { method: "DELETE" })
    if (!response.ok) throw new Error("Failed to delete asset")
    await refresh()
    return true
  } catch (err) {
    console.error(err)
    window.alert("Failed to delete asset")
    return false
  }
}

async function moveAsset(originalKey: string, targetFolder: string, newBasename: string) {
  const ext = getExt(originalKey)
  const cleanBasename =
    newBasename.endsWith(ext) && ext !== "" ? newBasename.slice(0, -ext.length) : newBasename
  const newFilename = cleanBasename + ext
  const normalizedFolder =
    targetFolder === "Root" || targetFolder === "/" ? "" : targetFolder.replace(/^\/|\/$/g, "")
  const newKey = normalizedFolder ? `${normalizedFolder}/${newFilename}` : newFilename

  if (originalKey === newKey) return true

  isProcessing.value = true
  try {
    const encodedOriginalKey = originalKey.split("/").map(encodeURIComponent).join("/")
    const response = await fetch(`/api/assets/${encodedOriginalKey}`, {
      method: "POST",
      body: JSON.stringify({ to: newKey }),
      headers: { "Content-Type": "application/json" }
    })
    if (!response.ok) throw new Error("Failed to move asset")
    await refresh()
    return true
  } catch (err) {
    console.error(err)
    window.alert("Failed to move/rename asset")
    return false
  } finally {
    isProcessing.value = false
  }
}

async function batchDelete() {
  if (!selectedKeys.value.length) return
  if (!window.confirm(`Are you sure you want to delete ${selectedKeys.value.length} assets?`))
    return

  isProcessing.value = true
  try {
    for (const key of selectedKeys.value) {
      const encodedKey = key.split("/").map(encodeURIComponent).join("/")
      await fetch(`/api/assets/${encodedKey}`, { method: "DELETE" })
    }
    selectedKeys.value = []
    await refresh()
  } catch (err) {
    console.error(err)
    window.alert("Failed to delete some assets")
  } finally {
    isProcessing.value = false
  }
}
/* endregion */

/* region Helpers */
function splitFilename(name: string) {
  const lastDotIndex = name.lastIndexOf(".")
  if (lastDotIndex === -1) return { basename: name, extension: "" }
  return {
    basename: name.substring(0, lastDotIndex),
    extension: name.substring(lastDotIndex)
  }
}

function getExt(key: string) {
  const fileName = key.split("/").pop() || ""
  return fileName.includes(".") ? fileName.substring(fileName.lastIndexOf(".")) : ""
}

function isImage(contentType?: string, key?: string) {
  if (contentType?.startsWith("image/")) return true
  const ext = key?.split(".").pop()?.toLowerCase()
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")
}

function formatSize(bytes: number) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function formatDate(date: string | Date) {
  if (!date) return ""
  const d = new Date(date)
  return d.toLocaleString()
}

async function copyAssetUrl(key: string) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/assets/${key.split("/").map(encodeURIComponent).join("/")}`
      : `/api/assets/${key.split("/").map(encodeURIComponent).join("/")}`
  try {
    await navigator.clipboard.writeText(url)
    window.alert("URL copied to clipboard")
  } catch (err) {
    console.error(err)
    window.alert("Failed to copy URL")
  }
}
/* endregion */

/* region Computed */
const treeItems = computed<TreeItem[]>(() => {
  const rootNode: TreeItem[] = [
    {
      label: "Root",
      fullPath: "",
      icon: "lucide:home",
      defaultExpanded: true,
      children: []
    }
  ]

  const foldersSet = new Set<string>()
  assets.value.forEach((asset) => {
    const parts = asset.key.split("/")
    if (parts.length > 1) {
      let currentPath = ""
      for (let i = 0; i < parts.length - 1; i++) {
        currentPath += (currentPath ? "/" : "") + parts[i]
        if (currentPath) foldersSet.add(currentPath)
      }
    }
  })

  localFolders.value.forEach((f) => foldersSet.add(f))

  const findOrCreateNode = (parent: TreeItem[], path: string, label: string): TreeItem => {
    let node = parent.find((n) => n.label === label)
    if (!node) {
      node = { label, fullPath: path, children: [] }
      parent.push(node)
    }
    return node
  }

  Array.from(foldersSet)
    .toSorted()
    .forEach((folderPath) => {
      const parts = folderPath.split("/")
      let currentLevel = rootNode[0].children!
      let currentFullPath = ""
      parts.forEach((part) => {
        currentFullPath += (currentFullPath ? "/" : "") + part
        const node = findOrCreateNode(currentLevel, currentFullPath, part)
        currentLevel = node.children!
      })
    })

  return rootNode
})

const currentNode = computed(() => {
  const findNode = (path: string, nodes: TreeItem[]): TreeItem | undefined => {
    for (const node of nodes) {
      if (node.fullPath === path) return node
      if (node.children?.length) {
        const found = findNode(path, node.children)
        if (found) return found
      }
    }
  }
  return findNode(selectedPath.value, treeItems.value) || treeItems.value[0]
})

const gridItems = computed(() => {
  const folders =
    currentNode.value?.children?.map((n) => ({
      key: n.fullPath,
      label: n.label,
      type: "folder" as const
    })) || []

  const assetsInDir = assets.value
    .filter((asset) => {
      const parts = asset.key.split("/")
      const assetPath = parts.slice(0, -1).join("/")
      return assetPath === selectedPath.value
    })
    .map((a) => ({ ...a, type: "asset" as const }))

  return [...folders, ...assetsInDir]
})

const localGridItems = ref<any[]>([])
watch(
  gridItems,
  (val) => {
    localGridItems.value = [...val]
  },
  { immediate: true }
)

const breadcrumbs = computed(() => {
  const crumbs = [{ label: "Root", path: "" }]
  if (selectedPath.value) {
    const parts = selectedPath.value.split("/")
    let currentPath = ""
    parts.forEach((part) => {
      currentPath += (currentPath ? "/" : "") + part
      crumbs.push({ label: part, path: currentPath })
    })
  }
  return crumbs
})
/* endregion */

/* region Handlers */
function handleFileSelected(input: any) {
  let filesList: File[] = []
  if (input instanceof FileList || Array.isArray(input)) {
    filesList = Array.from(input)
  } else if (input?.target?.files) {
    filesList = Array.from(input.target.files)
  } else if (input instanceof File) {
    filesList = [input]
  }

  if (filesList.length > 0) {
    pendingFiles.value = filesList
    uploadTargetFolder.value = selectedPath.value
    if (filesList.length === 1) {
      const { basename, extension } = splitFilename(filesList[0].name)
      uploadFileBasename.value = basename
      uploadFileExtension.value = extension
    }
    showUploadModal.value = true
  }
}

async function performUpload() {
  const success = await uploadAsset(
    pendingFiles.value,
    uploadTargetFolder.value,
    pendingFiles.value.length === 1 ? uploadFileBasename.value : undefined
  )
  if (success) {
    showUploadModal.value = false
    pendingFiles.value = []
  }
}

function triggerMove(asset: any) {
  movingAsset.value = asset
  const parts = asset.key.split("/")
  const fileName = parts.pop()!
  moveTargetFolder.value = parts.join("/")
  const lastDot = fileName.lastIndexOf(".")
  moveTargetBasename.value = lastDot === -1 ? fileName : fileName.substring(0, lastDot)
  showMoveModal.value = true
}

async function performMove() {
  if (await moveAsset(movingAsset.value.key, moveTargetFolder.value, moveTargetBasename.value)) {
    showMoveModal.value = false
  }
}

function toggleSelection(key: string) {
  const index = selectedKeys.value.indexOf(key)
  if (index > -1) selectedKeys.value = selectedKeys.value.filter((k) => k !== key)
  else selectedKeys.value = [...selectedKeys.value, key]
}

function handleDragStart(evt: any) {
  isDragging.value = true
  draggedItem.value = localGridItems.value[evt.oldIndex]
}

function handleDragMove(evt: any) {
  const related = evt.relatedContext?.element
  dropTarget.value = related?.type === "folder" ? related : null
  return false
}

async function handleDragEnd() {
  if (draggedItem.value && dropTarget.value && draggedItem.value.type === "asset") {
    const fileName = draggedItem.value.key.split("/").pop() || ""
    const { basename } = splitFilename(fileName)
    await moveAsset(draggedItem.value.key, dropTarget.value.key, basename)
  }
  isDragging.value = false
  draggedItem.value = null
  dropTarget.value = null
  localGridItems.value = [...gridItems.value]
}
/* endregion */

onMounted(() => {
  if (open.value) refresh()
})
watch(open, (val) => {
  if (val) refresh()
})
</script>

<template>
  <Modal
    v-model:open="open"
    title="Asset Manager"
    description="Manage your assets and folders"
    :ui="{
      content: 'sm:max-w-6xl max-h-[90vh] flex flex-col',
      body: 'p-0 flex-1 overflow-hidden min-h-0',
      header: 'flex items-center justify-between shrink-0'
    }"
  >
    <template #body>
      <div class="flex flex-col h-[70vh] w-full overflow-hidden">
        <div class="flex flex-1 min-h-0 overflow-hidden">
          <!-- Sidebar -->
          <div
            class="w-64 border-r border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden bg-neutral-50/30 dark:bg-neutral-950/30"
          >
            <div class="flex-1 overflow-y-auto p-2">
              <Tree
                :items="treeItems"
                :get-key="(i: any) => (i.fullPath === '' ? 'Root' : i.fullPath)"
                class="w-full"
                @update:model-value="
                  (val: any) => {
                    const selected = Array.isArray(val) ? val[0] : val
                    if (selected) selectedPath.value = selected.fullPath
                  }
                "
              />
            </div>
          </div>

          <!-- Main Content -->
          <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
            <!-- Toolbar -->
            <div
              class="p-2 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/10 dark:bg-neutral-950/10 shrink-0"
            >
              <div class="flex items-center gap-1 overflow-hidden h-6">
                <template v-for="(crumb, idx) in breadcrumbs" :key="crumb.path">
                  <span
                    v-if="idx > 0"
                    class="text-neutral-400 opacity-50 shrink-0 text-xs text-center px-1"
                    >/</span
                  >
                  <button
                    class="text-xs font-semibold truncate hover:text-primary-500 hover:bg-primary-500/10 px-1.5 py-0.5 rounded transition-colors whitespace-nowrap"
                    @click="selectedPath = crumb.path"
                  >
                    {{ crumb.label }}
                  </button>
                </template>
              </div>
              <div class="flex items-center gap-2 shrink-0 ml-4">
                <div v-if="selectedKeys.length > 0" class="flex items-center gap-1 mr-2">
                  <span class="text-xs font-bold text-primary-600"
                    >{{ selectedKeys.length }} selected</span
                  >
                  <Button
                    icon="lucide:trash-2"
                    size="xs"
                    variant="ghost"
                    color="error"
                    @click="batchDelete"
                  />
                  <Button icon="lucide:x" size="xs" variant="ghost" @click="selectedKeys = []" />
                </div>
                <span class="text-[10px] text-neutral-500 uppercase"
                  >{{ gridItems.length }} items</span
                >
                <Button
                  icon="lucide:rotate-ccw"
                  size="xs"
                  variant="ghost"
                  :loading="status === 'pending'"
                  @click="refresh"
                />
              </div>
            </div>

            <!-- Grid -->
            <div
              v-if="status === 'pending' && !assets.length"
              class="flex flex-1 items-center justify-center"
            >
              <Icon name="lucide:loader-2" class="size-8 animate-spin text-primary-500" />
            </div>
            <div
              v-else-if="!gridItems.length"
              class="flex-1 flex items-center justify-center p-8 overflow-y-auto"
            >
              <Empty
                icon="lucide:folder-open"
                title="No assets found"
                description="Try uploading some files or check another folder"
              />
            </div>
            <div v-else class="flex-1 overflow-y-auto min-h-0">
              <draggable
                v-model="localGridItems"
                item-key="key"
                :move="handleDragMove"
                :sort="true"
                @start="handleDragStart"
                @end="handleDragEnd"
                class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 items-start content-start"
                handle=".drag-handle"
                :animation="200"
                ghost-class="opacity-50"
              >
                <template #header>
                  <div
                    class="aspect-square flex items-center justify-center p-0 overflow-hidden cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg border border-neutral-200 dark:border-neutral-800"
                  >
                    <FileUpload
                      size="xs"
                      label="Upload"
                      description="Drop files here"
                      :dropzone="true"
                      multiple
                      class="size-full"
                      @update:model-value="handleFileSelected"
                    />
                  </div>
                </template>

                <template #item="{ element: itemObj }">
                  <div>
                    <!-- Folder Item -->
                    <div
                      v-if="itemObj.type === 'folder'"
                      class="group aspect-square flex flex-col gap-1 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-primary-500 transition-all bg-neutral-100/50 dark:bg-neutral-900 cursor-pointer"
                      :class="
                        dropTarget?.key === itemObj.key
                          ? 'ring-2 ring-primary-500 bg-primary-500/10'
                          : ''
                      "
                      @click="selectedPath = itemObj.key"
                    >
                      <div
                        class="flex-1 min-h-0 w-full rounded-md overflow-hidden bg-primary-50/50 dark:bg-primary-900/10 flex items-center justify-center group-hover:bg-primary-500/10 transition-colors"
                      >
                        <Icon
                          name="lucide:folder"
                          class="size-12 text-primary-500/40 group-hover:text-primary-500/60"
                        />
                      </div>
                      <div class="flex flex-col gap-0 overflow-hidden shrink-0">
                        <span class="text-[11px] font-semibold truncate leading-tight">{{
                          itemObj.label
                        }}</span>
                        <span class="text-[10px] text-neutral-500">Folder</span>
                      </div>
                    </div>

                    <!-- Asset Item -->
                    <AssetImage
                      v-else-if="isImage(itemObj.contentType, itemObj.key)"
                      :src="`/api/assets/${itemObj.key.split('/').map(encodeURIComponent).join('/')}`"
                      :metadata="{ size: itemObj.size }"
                    >
                      <template #trigger="{ open: openImage }">
                        <div
                          class="group relative aspect-square flex flex-col gap-1 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-primary-500 transition-colors bg-neutral-100/50 dark:bg-neutral-900 overflow-hidden drag-handle cursor-grab active:cursor-grabbing"
                        >
                          <!-- Actions Overlay -->
                          <div
                            class="absolute top-2 left-0 right-0 z-20 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Checkbox
                              :model-value="selectedKeys.includes(itemObj.key)"
                              @update:model-value="toggleSelection(itemObj.key)"
                              @click.stop
                            />
                            <div class="flex gap-1 bg-black/60 p-1 rounded backdrop-blur-sm">
                              <Button
                                v-if="selectionMode"
                                icon="lucide:check"
                                size="xs"
                                variant="ghost"
                                color="primary"
                                @click.stop="emit('select', itemObj.key)"
                              />
                              <Button
                                icon="lucide:copy"
                                size="xs"
                                variant="ghost"
                                @click.stop="copyAssetUrl(itemObj.key)"
                              />
                              <Button
                                icon="lucide:pencil"
                                size="xs"
                                variant="ghost"
                                @click.stop="triggerMove(itemObj)"
                              />
                              <Button
                                icon="lucide:trash-2"
                                size="xs"
                                variant="ghost"
                                color="error"
                                @click.stop="deleteAsset(itemObj.key)"
                              />
                            </div>
                          </div>

                          <div
                            class="flex-1 min-h-0 w-full rounded-md overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center"
                            @click="openImage"
                          >
                            <img
                              :src="`/api/assets/${itemObj.key.split('/').map(encodeURIComponent).join('/')}`"
                              class="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                          <div class="flex flex-col gap-0 overflow-hidden shrink-0">
                            <span
                              class="text-[11px] font-semibold truncate leading-tight"
                              :title="itemObj.key"
                              >{{ itemObj.key.split("/").pop() }}</span
                            >
                            <span class="text-[10px] text-neutral-500 uppercase">{{
                              formatSize(itemObj.size)
                            }}</span>
                          </div>
                        </div>
                      </template>
                    </AssetImage>
                  </div>
                </template>
              </draggable>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Modal>

  <!-- Move Modal -->
  <Modal v-model:open="showMoveModal" title="Move/Rename Asset">
    <template #body>
      <div class="flex flex-col gap-4 p-4">
        <FieldGroup label="New Name">
          <input
            v-model="moveTargetBasename"
            class="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-800"
          />
        </FieldGroup>
        <FieldGroup label="Target Folder">
          <select
            v-model="moveTargetFolder"
            class="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-800"
          >
            <option value="">Root</option>
            <option
              v-for="folder in Array.from(
                new Set(assets.map((a) => a.key.split('/').slice(0, -1).join('/')).filter(Boolean))
              )"
              :key="folder"
              :value="folder"
            >
              {{ folder }}
            </option>
          </select>
        </FieldGroup>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" variant="ghost" @click="showMoveModal = false" />
          <Button label="Move" color="primary" :loading="isProcessing" @click="performMove" />
        </div>
      </div>
    </template>
  </Modal>

  <!-- Upload Confirmation Modal -->
  <Modal v-model:open="showUploadModal" title="Upload Asset">
    <template #body>
      <div class="flex flex-col gap-4 p-4">
        <p v-if="pendingFiles.length > 1">
          Uploading {{ pendingFiles.length }} files to {{ uploadTargetFolder || "Root" }}
        </p>
        <template v-else-if="pendingFiles.length === 1">
          <FieldGroup label="Filename">
            <div class="flex items-center gap-1">
              <input
                v-model="uploadFileBasename"
                class="flex-1 p-2 border rounded dark:bg-neutral-900 dark:border-neutral-800"
              />
              <span class="text-neutral-500">{{ uploadFileExtension }}</span>
            </div>
          </FieldGroup>
        </template>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" variant="ghost" @click="showUploadModal = false" />
          <Button label="Upload" color="primary" :loading="isProcessing" @click="performUpload" />
        </div>
      </div>
    </template>
  </Modal>
</template>
