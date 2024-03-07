<script setup lang="ts">
const chat = useChat();
const channel = ref<Omit<Channel, "id" | "messages" | "users" | "unread">>({
  name: "",
  description: "",
  type: "PUBLIC",
  password: "",
});
</script>
<template>
  <div class="overflow-auto h-full flex-1">
    <div class="flex text-white flex-1 h-full w-full ">
      <div class="py-5 w-full h-full justify-center items-center" >
        <div
          class="p-2.5 flex flex-col gap-5 items-center justify-center  min-h-[calc(100vh-61px-40px)]  w-full  "
        >
        <div class="home-font font-bold text-4xl" style="letter-spacing : 2px;">Create channel</div>
          <div class="w-60%">
            <input
              v-model="channel.name"
              type="text"
              maxlength="20"
              placeholder="Enter a name for your channel"
              style="font-family : terminal"
              class="w-full px-4 py-2 text-sm term-box focus:outline-none focus:text-zinc-300"
            />
          </div>
          <div class="w-60%">
            <textarea
              v-model="channel.description"
              type="text"
              maxlength="160"
              rows="4"
              placeholder="Enter a channel description"
              style="font-family : terminal"
              class="w-full px-4 py-2 text-sm term-box focus:outline-none focus:text-zinc-300"
            />
          </div>
          <div class="w-full flex flex-col gap-2 items-center">
            <div class="text-center font-bold home-font">Channel Type</div>
            <ChatChannelTypeTabs :channel="channel" />
            <div class="w-60% mt-2" v-if="channel.type == 'PROTECTED'">
              <input
                v-model="channel.password"
                type="text"
                placeholder="Enter channel password"
                style="font-family : terminal; border-width : 1px;"
                class="w-full px-4 py-2 text-sm term-box focus:outline-none focus:text-zinc-300"              />
            </div>
          </div>
          <div class="w-60% mt-5">
            <button
              @click="chat.createConversation(channel)"
              class="home-font px-3 py-2 w-full term-box home-button layers hero glitch" data-text="Create channel"
            >
              Create channel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
