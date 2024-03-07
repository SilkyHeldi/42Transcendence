<script setup lang="ts">
    import { WrappedConversation } from '~/composables/chat';
	const chat = useChat()
    const props = defineProps<
    {
        conversations: WrappedConversation[]
    }
    >()
</script>
<template>
    <div class="h-50% text-white flex flex-col ">
        <div class="font-bold capitalize flex justify-between items-center p-2.5 ">
            <div>Channels</div>
            <div class="flex items-center gap-2">

                <div @click="chat.setView('search_channel')" class="bg-gray p-1 rounded cursor-pointer hover:scale-110">
                    <div class="i-mdi:search"></div>
                </div>
                <div @click="chat.setView('create_channel')" class="bg-gray p-1 rounded cursor-pointer hover:scale-110">
                    <div class="i-mdi:plus"></div>
                </div>
            </div>
        </div>
        <div class="overflow-y-scroll flex-1">
            <div v-for="conversation in conversations" @click="chat.showConversation(conversation)" class="px-2.5 mb-1 py-2 hover:bg-white/10 cursor-pointer flex justify-center flex-col relative" :class="[chat.isActiveConversation(conversation) ? 'bg-white/20' :'bg-zinc-600/60']">
				<div>#{{ conversation.channel.name }}</div>
				<div class="flex items-center justify-between flex-wrap break-all">
					<div class="text-xs text-gray">{{ conversation.users.length }} membre{{ conversation.users.length > 1 ? 's' : '' }}, {{ conversation.online.length }} en ligne</div>
                	<div class="bg-red rounded-l text-xs px-2 font-bold py-1 absolute bottom-1 right-0">10k+</div>
				</div>
            </div>
        </div>
    </div>
</template>