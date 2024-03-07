<script setup lang="ts">
const chat = useChat();
const route = useRoute();

onMounted(async () => {
    while (chat.manager.isSetup === false) {
        await new Promise((resolve) => setTimeout(resolve, 100))
    }
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))
    let active = chat.manager.getConversation(Number(route.params.conversation))
    if (!active) return navigateTo('/chat')
    chat.manager.setActive(active)
});
</script>
<template>
  <div v-if="chat.manager.active">
    <ChatChannelView
      v-if="chat.manager.active?.isChannel"
    />
    <ChatDMView
      v-if="chat.manager.active?.isDM"
    />
  </div>
</template>
