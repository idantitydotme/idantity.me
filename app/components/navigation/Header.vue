<script setup lang="ts">

</script>

<template>
  <RLLayoutBox tag="header" direction="horizontal" align-items="center" justify-content="center" class="sticky top-0 z-50 h-16 bg-primary-600 shadow-[0_4px_0_0_#000]">
    <RLLayoutBox tag="nav" direction="horizontal" class="max-w-[1440px]">
      <RLLayoutBox tag="ul" direction="horizontal" gap="xl" align-items="center">
        <li>
          <NuxtLink href="/">
            <RLImage
                src="/logos/logomark.webp"
                alt="idantity.me Logo"
                class="h-[2.5rem] w-[2.5rem]"
            />
          </NuxtLink>
        </li>
        <li>
          <RLHeaderTab label="me.games" href="/games" />
        </li>
        <li>
          <RLHeaderTab label="me.music" href="/music" />
        </li>
        <li>
          <RLHeaderTab label="me.portfolio" href="/portfolio" />
        </li>
        <li>
          <RLHeaderTab label="me.about" href="/about" />
        </li>
        <li>
          <RLHeaderTab label="me.contact" href="/contact" />
        </li>
      </RLLayoutBox>
    </RLLayoutBox>
  </RLLayoutBox>
</template>

<style scoped>

</style>