<script setup lang="ts">
const client = useClient();
const auth = useAuth();

</script>

<template>
  <div class="flex flex-col w-2/3 p-2 m-2">
        <FriendList v-if="client.chat.chatState.select === 'Amis'"/>
        <!-- Messages -->
        <ChatMessageWindowDM/>

        <ChatChannelList v-if="client.chat.chatState.select === 'ChannelList'"/>
        <!-- Channel -->
        <ChatMessageWindowChannel/>
      
        <!-- Input -->
        <ChatMessageWindowInputField/>
      </div>
</template>