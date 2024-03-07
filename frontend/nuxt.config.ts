import { appDescription } from './constants/index'

export default defineNuxtConfig({
    ssr: false,
    router: {
      options: {
        hashMode: true
      }
    },
    runtimeConfig: {
        public: {
            GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
            INTRA_CLIENT_ID: process.env.INTRA_CLIENT_ID,
            backendURL: process.env.BACKEND_URL || 'http://localhost:3001',
            baseURL: process.env.BACKEND_URL + process.env.BACKEND_API_VERSION || 'http://localhost:3001/api/v0',
        },
    },
    telemetry: false,
    modules: [
        '@vueuse/nuxt',
        '@unocss/nuxt',
        '@pinia/nuxt',
        '@nuxtjs/color-mode',
    ],
    css: [
        '@unocss/reset/tailwind.css',
    ],
    colorMode: {
        classSuffix: '',
    },

    nitro: {
        esbuild: {
            options: {
                target: 'esnext',
            },
        },
    },

    imports: {
        presets: [
          {
            from: '@kyvg/vue3-notification',
            imports: ['useNotification']
          }
        ]
      },
    
    app: {
        head: {
            viewport: 'width=device-width,initial-scale=1',
            link: [
                { rel: 'icon', href: '/logo.png', sizes: 'any' },
                // { rel: 'icon', type: 'image/svg+xml', href: '/nuxt.svg' },
                { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
            ],
            meta: [
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: appDescription },
                { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
            ],
        },
    },

    devtools: {
        enabled: false,
    },
})
