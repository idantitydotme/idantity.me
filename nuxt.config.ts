import { defineNuxtConfig  } from 'nuxt/config';
import type { NuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
  ],
  runtimeConfig: {
    apiSecret: 'my-api-secret',

    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
    }
  },
  app: {
    head: {
      title: 'idantity.me',
      titleTemplate: '%s | idantity.me',
      meta: [
        { name: 'description', content: '' },
        { name: 'author', content: 'Daniel Marchi' },
        { name: 'creator', content: 'Daniel Marchi' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },
  css: ["@/assets/css/main.css"],
  fonts: {
    google: {
      families: {
        'Noto Sans': {
          weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        },
      },
      display: 'swap',
      prefetch: true,
      preconnect: true,
    },
  } as NuxtConfig['fonts'],
})