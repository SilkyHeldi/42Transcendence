<script setup lang="ts">
const client = useClient();
const auth = useAuth();
const friend = useFriend();
const socket = useSocket();
const channel = useChannel();
client.chat.showUserProfile = false;

const chatMessages = ref();

const scrollToBottom = () => {
    if (chatMessages.value === undefined)
      return ;
    chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
  };

const displayUserProfile = async () => {
    client.chat.showUserProfile = !client.chat.showUserProfile;
    client.chat.showAdd = await friend.showAddOption(client.chat.chatState.receiver.username);
  }

onUpdated(async () => {
  // if(auth.logged)
  // {
  //   client.chat.messages = await client.chat.currentHistory()
    scrollToBottom();
  // }
})

onMounted(async () => {
  await socket.connect();
  socket.on('refreshPrivateChannel', async () => {
    setInterval(() => {}, 20);
    client.chat.messages = await client.chat.currentHistory();
  });
  socket.on('deletePrivateChannel', async (currentUserId : number, otherUserId : number) => {
    if (client.chat.chatState.select == 'DM'
      && auth.session.id == currentUserId
      && client.chat.chatState.receiver.id == otherUserId)
      {
        client.chat.chatState.select = '';
      }
  });
});
</script>

<template>

    <!-- la div ci-dessous sur laquelle t'appuie pour ouvrir le profil d'un user-->
    <div @click="displayUserProfile" v-if="client.chat.chatState.select === 'DM'" class="p-2 h-[1/5] w-full bg-zinc-600 hover:bg-zinc-500 rounded-lg flex mr-auto mb-2 cursor-pointer">
        <div class="flex flex-col justify-center">
          <img :src="client.chat.chatState.receiver.avatar" class="w-12 h-12 rounded-full" />
        </div>
        <div class="flex flex-col justify-center">
          <p class="ml-3 text-md text-zinc-200" >{{ client.chat.chatState.receiver.username }}</p>
          <p class="ml-3 text-xs text-zinc-400" >W/L : {{ client.chat.chatState.receiver.victories }}-{{ client.chat.chatState.receiver.defeats }}</p>
          <p class="ml-3 text-xs text-zinc-400" >Elo : {{ client.chat.chatState.receiver.ladderPoint }}</p>
        </div>
    </div>

    <div id="chatMessages" ref="chatMessages" class="overflow-y-auto max-w-full h-[3/5] px-1 rounded-lg">
      <div class="flex flex-col">
        <div v-if="client.chat.chatState.select === 'DM'">
          <div v-for="message in client.chat.messages" class="mb-2">
            <div :class="{ 'text-left': message.senderId !== auth.session.id, 'text-right': message.senderId === auth.session.id }">
              <p class="text-sm text-zinc-300 w-full break-all rounded-lg hover:bg-zinc-600 inline-block p-2">
                {{ message.content }} 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>