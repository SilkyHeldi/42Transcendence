<script setup lang="ts">
const chat = useChat();
</script>
<template>
  <div
    class=" bottom-0 left-0  w-full h-full overflow-hidden"
  >
    <div class="w-full h-full p-2 relative">
      <div class="relative w-full h-full">
        <ChatContainer />
      </div>
      <div
        v-if="chat.currentProfile?.id"
        class="absolute left-0 right-0 top-0 bottom-0 flex justify-center items-center"
      >
        <ChatProfileModal />
      </div>
    </div>
  </div>
</template>
