<script setup lang="ts">
import { appName } from '~/constants'

const isLoading = ref(true)
useHead({
  title: appName,
})

onBeforeMount(async () => {
  isLoading.value = true
})

onMounted(async () => {
  isLoading.value = false
})
</script>

<template>
  <transition name="fade" mode="out-in">
    <Loader :is-loading="isLoading" />
  </transition>
  <NuxtLayout v-if="!isLoading">
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
  /* Define the fade transition */
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }

  /* Rest of your styles */
  html, body {
    height: 100vh;
    margin: 0;
    padding: 0;
  }

  html.dark {
    background: #000;
    color: white;
  }
</style>
