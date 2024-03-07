import Notifications from '@kyvg/vue3-notification'

export default defineNuxtPlugin({
  name: 'notify',
  enforce: 'pre', // or 'post'
  async setup(nuxtApp) {
    nuxtApp.vueApp.use(Notifications)
  },
})
