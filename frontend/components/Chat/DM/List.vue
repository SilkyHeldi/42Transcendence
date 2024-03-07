<script setup lang="ts">
import { WrappedConversation } from "~/composables/chat";
const chat = useChat();
const auth = useAuth();
const props = defineProps<{
  conversations: WrappedConversation[];
}>();
const otherUser = (conversation: WrappedConversation) => {
  return conversation.users.find((user) => user.id != auth.session.id);
};
</script>
<template>
  <div class="h-50% text-white term-box flex flex-col b-t-1 b-white/15" style="border-top: none;" >
    <div class="font-bold home-font capitalize flex justify-between items-center p-2.5">
      <div>Friends</div>
      <div class="flex items-center gap-2 mr-1.5">
        <nuxt-link
        :to="{
            name: 'chat-search-friend',
        }"
        @click="chat.manager.setActive(undefined)"
        class="bg-gray p-1 term-box cursor-pointer transition-all hover:scale-110"
        >
          <div class="i-mdi:search"></div>
        </nuxt-link>
        
        <!--<div
          @click="chat.setView('list_friends')"
          class="bg-gray p-1 rounded cursor-pointer hover:scale-110 transition-all"
        >
          <div class="i-material-symbols:format-list-bulleted"></div>
        </div>-->
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
        class=" mb-1 px-2.5 py-2 hover:bg-white/10 cursor-pointer flex justify-center flex-col relative"
        style="font-family : terminal"
        :class="[
          chat.isActiveConversation(conversation)
            ? 'bg-white/20'
            : 'bg-zinc-600/60',
        ]"
      >
      <div class="flex gap-2 justify-start">
        <div>
            <ChatUserAvatar 
            size="h-12 w-12 "
          :userId="conversation.recipient?.user.id"
          :avatar="conversation.recipient?.user.avatar"
        />
        </div>
        <div class="flex flex-col gap-1">
            <div>@{{ conversation.recipient?.user.username }}</div>

        </div>
      </div>
        
      </nuxt-link>
    
</div>
    </div>
  </div>
</template>
