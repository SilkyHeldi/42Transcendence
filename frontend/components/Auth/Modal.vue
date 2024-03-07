<script setup lang="ts">
const auth = useAuth()
const socket = useSocket();
const client = useClient();

const { gameProps } = defineProps<{
      gameProps: any
  }>();

</script>

<template>

  <div v-if="auth.showForm" class="absolute top-0 bottom-0 left-0 right-0 z-10 flex justify-center items-center bg-black/60 backdrop-blur-sm" >
    <AuthLoginForm v-if="auth.mode === 'login'" />
    <AuthSignUpForm v-else />
    <!-- <AuthUserForm v-if="auth.mode === 'login'" /> -->
  </div>

  <div v-if="client.chat.showUserProfile" class="absolute top-0 bottom-0 left-0 right-0 z-10 flex justify-center items-center bg-black/82 backdrop-blur-sm" >
    <ChatUserProfile/>
  </div>
  
  <div v-if="auth.showUserForm" class="absolute top-0 bottom-0 left-0 right-0 z-10 flex justify-center items-center bg-black/60 backdrop-blur-sm" >
    <UserForm v-if="auth.logged === true" />
  </div>
  <div v-if="auth.showQRCode === true" class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 p-8 rounded-lg shadow-lg z-50">
    <img :src="auth.QRCodeURL" alt="QR Code" class="w-64 h-64 mx-auto" />
  </div>

  <div v-if="auth.logged === true" >
    <ChatContainer :gameProps="gameProps"/>
  </div>

</template>
