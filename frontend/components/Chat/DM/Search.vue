<script setup lang="ts">
const chat = useChat();
const auth = useAuth();
const query = ref("");

</script>
<template>
  <div class="overflow-auto h-full flex-1">
    <div class="flex text-white flex-1 h-full w-full">
      <div class="py-5 w-full h-full">
        <div
          class="p-2.5 flex flex-col gap-5 items-center justify-center w-full"
        >
          <div class="font-bold text-4xl" style="font-family : terminal;">Search a friend</div>
          <div class="w-60%">
            <input
              v-model="query"
              @input="chat.searchFriend(query)"
              type="text"
              placeholder="Search a friend..."
              style="font-family : terminal;"
              class="w-full px-4 py-2 text-sm term-box b-1 focus:outline-none focus:text-zinc-300"
            />
          </div>
          <div class="grid sm:grid-cols-2 gap-5 w-full">
            <div
              v-for="friend in chat.searchFriendResults"
            >
            <ChatProfileCard
              v-if="friend"
              :user="friend"
              :more="true"
              :stats="false"
             />
            </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>
