<script setup lang="ts">
    const chat = useChat()
    const {width} = useWindowSize()
    watch(width, (data) => {
        if(data > 768) {
            chat.compactMode = false
            chat.currentMode = 'chat'
        } else {
            chat.compactMode = true
            chat.currentMode = 'chat'
        }
    })
    onMounted(() => {
        if(width.value > 768) {
            chat.compactMode = false
            chat.currentMode = 'chat'
        } else {
            chat.compactMode = true
            chat.currentMode = 'channels'
        }
    })
</script>
<template>
    <div class="absolute bottom-0 left-0 rounded-lg text-zinc-200 bg-zinc-700 w-full h-full flex">
        <ChatConversations/>
        <ChatView/>
        <!--<div class="i-mdi:chat"></div>
        <div class="i-mdi-circle text-red absolute -top-2 -right-2 text-16px"></div>-->
    </div>
    <!--<div class="absolute cursor-pointer  bottom-3 left-3 rounded-lg p-2  text-zinc-200 bg-zinc-700 font-bold flex justify-center max-h-600px flex-1">
    </div>-->
</template>