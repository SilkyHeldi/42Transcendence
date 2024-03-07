<script setup lang="ts">
const client = useClient();
const channel = useChannel();
const friend = useFriend();
const auth = useAuth();
const socket = useSocket();

const displayUserProfile = async (userToMessage : any) => {
    client.chat.showUserProfile = !client.chat.showUserProfile;
}

const chatWithUser = async (userToMessage : any) => {
    if (client.chat.chatState.receiver.id != userToMessage.id || client.chat.chatState.select != 'DM')
    {
      client.chat.messages = [];
      client.chat.chatState.select = 'DM';
      client.chat.chatState.receiver.id = userToMessage.id;
      client.chat.chatState.receiver.username = userToMessage.username;
      client.chat.messages = await client.chat.currentHistory();
      client.chat.chatState.receiver.avatar = userToMessage.avatar;
      client.chat.chatState.receiver.victories = userToMessage.victories;
      client.chat.chatState.receiver.defeats = userToMessage.defeats;
      client.chat.chatState.receiver.ladderPoint = userToMessage.ladderPoint;
      displayUserProfile(userToMessage);
    }
  };

  const addFriend = async (newFriendUsername: string) => {
    await client.friend.add(newFriendUsername);
    socket.emit('refreshUserProfile', {
        currentUserId: auth.session.id,
        otherUserId: client.chat.chatState.receiver.id
        })
  };

  const removeFriend = async (newFriendUsername: string) => {
    await client.friend.remove(newFriendUsername);
    if (client.chat.chatState.select == 'DM')
        {
          client.chat.chatState.select = '';
        }

    socket.emit('refreshUserProfile', {
        currentUserId: auth.session.id,
        otherUserId: client.chat.chatState.receiver.id
    });
    socket.emit('deletePrivateChannel', {
        currentUserId: auth.session.id,
        otherUserId: client.chat.chatState.receiver.id
    });
  };

    onMounted (async () => {
    await socket.connect();
    socket.on('refreshUserProfile', async () => {
        friend.toggleCategory(client.friend.categoryName);
        if (client.chat.showUserProfile) {
            client.chat.showAdd = await friend.showAddOption(client.chat.chatState.receiver.username);
        }
        await channel.refresh();
    });
  });
</script>

<template>
    <!-- div principale -->
    <div class="w-100 bg-zinc-700 px-2 py-6 rounded-lg relative flex-col">
        <!-- div user/bouton -->
        <div class="flex justify-between">
            <!-- div bouton pour fermer -->
            <div @click="client.chat.showUserProfile = false"
                class="text-2xl py+6 hover:bg-white-500 cursor-pointer hover:text-white rounded m-1 text-black absolute right-0 top-0">
                <div class="i-mdi:close"></div>
            </div>
            <!-- div avatar user -->
            <div class="flex flex-col justify-center p-2 ">
                <img :src="client.chat.chatState.receiver.avatar" class="w-14 h-14 rounded-full" />
            </div>
            <!-- div bouton -->
            <div class=" p-2 ">
                <div v-if="client.chat.showAdd === 'none' && auth.session.username != client.chat.chatState.receiver.username" class=" p-2">
                    <button class="i-mdi:account-multiple-plus" @click="addFriend(client.chat.chatState.receiver.username)">Add a friend</button>
                </div>
                <div v-else-if="client.chat.showAdd === 'mutual' && auth.session.username != client.chat.chatState.receiver.username" class=" p-2">
                    <button class="i-material-symbols:chat-add-on" @click="chatWithUser(client.chat.chatState.receiver)">Start a chat</button>
                    <button class="i-material-symbols:person-remove-rounded" @click="removeFriend(client.chat.chatState.receiver.username)">Delete a friend</button>
                </div>
                <div v-else-if="client.chat.showAdd === 'justFriend' && auth.session.username != client.chat.chatState.receiver.username" class=" p-2">
                    <button class="i-material-symbols:person-remove-rounded" @click="removeFriend(client.chat.chatState.receiver.username)">Delete a friend</button>
                </div>
            </div>
        </div>

        <!-- div rectangle noir -->
        <div class="top-4 bg-zinc-800 px-3 py-4 rounded-lg relative flex-col">
            <!-- div pseudo -->
            <div class="flex flex-col justify-center ">
                <p class=" text-lg text-zinc-200" >{{ client.chat.chatState.receiver.username }}</p>
                <!-- <p class=" text-xs text-zinc-400" >ELO : {{ client.chat.chatState.receiver.ladderPoint}}</p> -->
            </div>
            <!-- div boutons -->
            <div class="flex border-b border-zinc-600">
                <button class="border-b border-zinc-800 hover:border-zinc-200 text-zinc-200 mt-2 mr-5 py-3">
                        <p class=" text-sm text-zinc-200" >Informations</p>
                </button>
                <button class="border-b border-zinc-800 hover:border-zinc-200  text-zinc-200 mt-2 mr-5 py-3">
                        <p class=" text-sm text-zinc-200" >Common channels</p>
                </button>
                <button class=" border-b border-zinc-800 hover:border-zinc-200 text-zinc-200 mt-2 mr-5 py-3">
                        <p class=" text-sm text-zinc-200" >Game history</p>
                </button>
            </div>
            <!-- div info selon bouton -->
            <div class="flex flex-col justify-center">
                <p class=" text-sm text-zinc-200 py-6" >Info selon bouton</p>
            </div>
        </div>
    </div>
</template>