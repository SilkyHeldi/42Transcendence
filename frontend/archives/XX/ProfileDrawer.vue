<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
const auth = useAuth();
const chat = useChat();
const target = ref(null);

onClickOutside(target, () => {
  chat.currentProfile = null
});
</script>
<template>
  <div
    v-if="chat.currentProfile"
    class="relative h-full w-full backdrop-blur-2"
  >
    <div
      class="absolute top-50% left-50% z-10000 -translate-x-1/2 -translate-y-1/2 z-500 overflow-hidden"
    >
      <ChatProfileCard
        @keypress.escape="chat.currentProfile = null"
        @click.away="chat.currentProfile = null"
        ref="target"
        :user="chat.currentProfile"
      />
    </div>
  </div>
</template>
