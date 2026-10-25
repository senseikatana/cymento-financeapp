import { fileURLToPath } from 'node:url';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  // Alias de rutas del proyecto: "@" apunta a app/ (srcDir de Nuxt 4)
  alias: {
    '@': fileURLToPath(new URL('./app', import.meta.url)),
  },

  css: ['@/assets/css/main.css'],

  components: [{ path: '@/components', pathPrefix: false }],

  tailwindcss: {
    cssPath: false,
  },

  app: {
    head: {
      title: 'Finanzas Personales — Regla 50/30/20',
      htmlAttrs: { lang: 'es' },
      meta: [
        {
          name: 'description',
          content:
            'Gestión de finanzas personales con dashboard, suscripciones y sincronización Excel. Pensado para SMI 2026 y meta de colchón sept-2027.',
        },
      ],
    },
  },
});
