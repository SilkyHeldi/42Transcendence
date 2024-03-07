<script setup lang="ts">
    const props = defineProps<{
        isLoading: boolean
    }>()
</script>
<template>
    <div v-if="isLoading" key="loading" class="h-100vh overflow-hidden bg-zinc-800 flex flex-col items-center justify-center">
        <div>
            <p class="text-4xl sm:text-7xl text-center font-bold text-zinc-200 m-4">Transcendence</p>
            <p class="text-xl text-center text-zinc-400 mb-4">Loading...</p>
        </div>
        <div class="flex justify-center items-center animate-bounce h-[12px] w-[12px] bg-zinc-200 rounded-full"></div>
    </div>
</template>