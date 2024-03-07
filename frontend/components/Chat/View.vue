<script setup lang="ts">
const chat = useChat();

const route = useRoute();
</script>

<template>
  <div
  class="relative w-full min-w-300px flex flex-col term-box justify-center "
    v-if="
      chat.compactMode == false ||
      (chat.compactMode == true && chat.currentMode == 'chat')
    "
    :class="[
      chat.compactMode == true && chat.currentMode == 'chat'
      ? 'w-full min-w-300px max-w-800px s b-r-0'
        : '',
    ]"
  >
    <div
      @click="chat.currentMode = 'channels'"
      class="b-blue z-15 b-1 bg-slate-700 md:hidden h-50px w-10px absolute top-[calc(50%-25px)] px-6px cursor-pointer hover:bg-blue hover:text-white left-0 rounded-r flex flex-col justify-center items-center"
    >
      <div class="i-mdi:chevron-right"></div>
    </div>
    <ChatEmpty v-if="$route.name == 'chat'" />
    <ChatChannelCreate v-if="$route.name == 'chat-create-channel'" />
    <ChatChannelSearch v-if="$route.name == 'chat-search-channel'" />
    <ChatConversation v-if="$route.name == 'chat-conversation'" />
    <ChatDMSearch v-if="$route.name ==  'chat-search-friend'" />
    <!--<ChatConversation v-if="$route.name == 'dm'"/>-->
            <!--<ChatConversation v-if="chat.current == 'search'"/>-->
    <!--<ChatChannelView v-if="chat.view == 'channel'" />
    <ChatChannelSearch v-if="chat.view == 'search_channel'" />
    -->

    <!--<div
      @click="chat.setVisible(false)"
      class="absolute right-1 text-red top-1 hover:scale-110 cursor-pointer"
    >
      <div class="i-mdi:close-box text-3xl"></div>
    </div>-->
  </div>
</template>
