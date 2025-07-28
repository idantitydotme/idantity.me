<script setup lang="ts">
useHead({
  title: 'home',
});
</script>

<template>
  <RLLayoutBox direction="vertical">
    <LayoutBox
        tag="section"
        direction="vertical"
        padding="xl"
        gap="xl"
        align-items="center"
        class="bg-primary-500 py-12"
    >
      <RLImage src="/logos/logomark.webp" alt="Queer Kit Logo" size="512px"/>
      <h1 class="text-6xl font-bold">Your guide to all things queer.</h1>
      <RLButton variant="social" size="md" start-icon="third-party:instagram"/>
    </LayoutBox>
    <LayoutBox
        direction="vertical"
        class="bg-primary-600 py-12"
    >
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </LayoutBox>
    <RLLayoutBox
        direction="vertical"
        align-items="center"
        class="w-full bg-primary-200 py-12"
    >
      <h2 class="text-5xl text-white">Latest Blog Posts</h2>
    </RLLayoutBox>
  </RLLayoutBox>
</template>

<style scoped>

</style>