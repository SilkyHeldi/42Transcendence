<script setup lang="ts">
import { WrappedConversation } from '~/composables/chat';
const auth = useAuth();
const chat = useChat();


const search = ref("");
const members = computed(() => {
  if (search.value && chat.manager.active)
    return chat.manager.active.searchUser(search.value);
  return chat.manager.active?.users;
});
</script>
<template>
  <div class="flex-1 overflow-y-scroll">
    <div class="flex flex-col gap-2 pb-3 px-3">
      <div>
        <input
          v-model="search"
          type="text"
          placeholder="Search member..."
          style="font-family : terminal; border-width : 1px;"
          class="w-full px-4 py-2 text-sm b-1 term-box focus:outline-none focus:text-zinc-300"
        />
      </div>
      <div class="grid sm:grid-cols-2 gap-2">
        <ChatProfileCard :stats="false" :more="true" :user="user.user" v-for="user in members" />
      </div>
    </div>
  </div>
</template>
