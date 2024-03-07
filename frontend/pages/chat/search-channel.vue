<script setup lang="ts">
const chat = useChat()
    onMounted(() => {
        chat.currentMode = 'chat'
    })
</script>
<template>
    <ChatPage/>
</template>