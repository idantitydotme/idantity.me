<script setup lang="ts">
import { ref } from "vue"
import { Button } from "@rimelight/ui/nuxt"
import AssetManagerModal from "./AssetManagerModal.vue"

const isOpen = ref(false)

function onSelect(key: string) {
  console.log("Selected asset:", key)
  isOpen.value = false
}
</script>

<template>
  <div
    class="flex flex-col items-center justify-center p-12 bg-neutral-100/50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800"
  >
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold mb-2">Asset Manager Test</h2>
      <p class="text-neutral-500">Click the button below to open the asset manager modal.</p>
    </div>

    <Button
      label="Open Asset Manager"
      icon="lucide:folder-open"
      size="xl"
      color="primary"
      @click="isOpen = true"
    />

    <AssetManagerModal v-model:open="isOpen" @select="onSelect" />
  </div>
</template>
