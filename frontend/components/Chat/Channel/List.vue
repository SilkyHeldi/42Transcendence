<script setup lang="ts">
import { WrappedConversation } from "~/composables/chat";
const chat = useChat();
const props = defineProps<{
  conversations: WrappedConversation[];
}>();
</script>
<template>
  <div class="h-50% home-font term-box flex flex-col" style="letter-spacing : 1px;">
    <div class="font-bold capitalize flex justify-between items-center p-2.5">
      <div>Channels</div>
      <div class="flex items-center gap-2 mr-1.5">
        <nuxt-link
        :to="{
            name: 'chat-search-channel',
        }"
          class="bg-gray p-1 term-box cursor-pointer transition-all hover:scale-110"
        >
          <div class="i-mdi:search"></div>
        </nuxt-link>
        <nuxt-link
        :to="{
            name: 'chat-create-channel',
        }"
        @click="chat.currentMode = 'chat'"
        class="bg-gray p-1 w-full term-box cursor-pointer transition-all hover:scale-110"
        >
          <div class="i-mdi:plus"></div>
        </nuxt-link>
      </div>
    </div>
    <div class="overflow-y-scroll flex-1">

        <div 
        @click.prevent="chat.showConversation(conversation)" 
        v-for="conversation in conversations">
      <nuxt-link
        :to="{
            name: 'chat-conversation',
            params: {
                conversation: conversation.channel.id,
            },
        }"
        class="px-2.5 mb-1 py-2 hover:bg-white/10 cursor-pointer flex justify-center flex-col relative"
        :class="[
          chat.isActiveConversation(conversation)
            ? 'bg-white/20'
            : 'bg-zinc-600/60',
        ]"
      >
        <div>#{{ conversation.channel.name }}</div>
        <div class="flex items-center justify-between flex-wrap break-all">
          <div class="text-xs text-gray">
            {{ conversation.users.length }} membre{{
              conversation.users.length > 1 ? "s" : ""
            }}, {{ conversation.online.length }} en ligne
          </div>
          <!--<div
            class="bg-red rounded-l text-xs px-2 font-bold py-1 absolute bottom-1 right-0"
          >
            10k+-->
          <!--</div>-->
        </div>
      </nuxt-link>
    </div>
    </div>
  </div>
</template>
