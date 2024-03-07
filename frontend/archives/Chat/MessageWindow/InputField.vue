<script setup lang="ts">
const client = useClient();
const auth = useAuth();
const socket = useSocket();
const channel = useChannel();

const sendMessage = async () => {
  if (client.chat.newMessage.trim() === '') 
      return;
  socket.emit('sendPrivateMessage', {
    senderId: auth.session.id,
    receiverId: client.chat.chatState.receiver.id,
    text: client.chat.newMessage 
  });
  client.chat.newMessage = '';
  setInterval(() => {}, 20);
  client.chat.messages = await client.chat.currentHistory();
  setInterval(() => {}, 20);
  client.chat.messages = await client.chat.currentHistory();
  socket.emit('refreshPrivateChannel', {
    otherUserId: client.chat.chatState.receiver.id
  });
  channel.refresh();
};

const sendMessageInChannel = async () => {
  if (client.chat.newMessage.trim() === '') 
      return;
  socket.emit('sendMessageToChannel', {
    senderId: auth.session.id,
    //avatar: auth.session.avatar,
    receiverId: client.chat.chatState.receiver.id,
    receiver: client.chat.chatState.receiver.name,
    text: client.chat.newMessage 
  });
  client.chat.newMessage = '';
  setInterval(() => {}, 20);
  client.chat.messages = await client.chat.currentHistory();
  setInterval(() => {}, 20);
  client.chat.messages = await client.chat.currentHistory();
  socket.emit('refresh', { channelId: client.chat.chatState.receiver.id }) 
  channel.refresh();
}
</script>

<template>
    <div v-if="client.chat.chatState.select === 'DM'" class="p-2 h-[1/5] mt-auto ">
          <input
            v-model="client.chat.newMessage"
            @keyup.enter="sendMessage"
            placeholder="Send a message..."
            class="w-full px-2 py-2 text-sm rounded-lg bg-zinc-600 focus:outline-none focus:text-zinc-300"
          />
    </div>
    <div v-if="client.chat.chatState.select === 'CHANNEL'" class="p-2 h-[1/5] mt-auto ">
          <input
            v-model="client.chat.newMessage"
            @keyup.enter="sendMessageInChannel"
            placeholder="Send a message..."
            class="w-full px-2 py-2 text-sm rounded-lg bg-zinc-600 focus:outline-none focus:text-zinc-300"
          />
    </div>
    <div v-else>
        <div></div>
    </div>
</template>