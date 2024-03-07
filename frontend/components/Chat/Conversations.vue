<script setup lang="ts">
const chat = useChat();

const channels = computed(() => chat.manager.channels);
const dms = computed(() => chat.manager.dms);

</script>
<template>
  <div
    class="min-w-200px b-r b-r-gray/20 w-full sm:w-auto"
    v-if="
      chat.compactMode == false ||
      (chat.compactMode == true && chat.currentMode == 'channels')
    "
  >
    <div
      @click="chat.currentMode = 'chat'"
      class="b-blue z-15 b-1 bg-slate-700 md:hidden h-50px w-10px absolute top-[calc(50%-25px)] px-6px cursor-pointer hover:bg-blue hover:text-white right-0 rounded-l flex flex-col justify-center items-center z-999"
    >
      <div class="i-mdi:chevron-left"></div>
    </div>
    <ChatChannelList :conversations="channels" />
    <ChatDMList :conversations="dms" />
  </div>
</template>
