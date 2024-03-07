<script setup lang="ts">
const chat = useChat()
</script>
<template>
	<div class=" overflow-auto h-full flex-1">

    <div class="flex text-white flex-1 h-full w-full">
    <div class="py-5 w-full h-full">
        <div class="p-2.5 flex flex-col gap-5 items-center justify-center w-full">
            <div class="font-bold text-4xl">Create channel</div>
            <div class="w-60%">
                <input
                    v-model="chat.newChannel.name"
                    type="text"
                    maxlength="20"
                    placeholder="Enter a name for your channel"
                    class="w-full px-4 py-2 text-sm rounded-lg bg-zinc-600 focus:outline-none focus:text-zinc-300"
                    />
            </div>
            <div class="w-60%">
                <textarea
                    v-model="chat.newChannel.description"
                    type="text"
                    maxlength="160"
                    rows="4"
                    placeholder="Enter a channel description"
                    class="w-full px-4 py-2 text-sm rounded-lg bg-zinc-600 focus:outline-none focus:text-zinc-300"
                    />
            </div>
            <div class="w-full flex flex-col gap-2 items-center">
                <div class="text-center font-bold">Channel Type</div>
                <ChatChannelTypeTabs :channel="chat.newChannel"/>
                <div class="w-60% mt-2" v-if="chat.newChannel.type == 'PROTECTED'">
                    <input
                    v-model="chat.newChannel.password"
                    type="text"
                    placeholder="Enter channel password"
                    class="w-full px-4 py-2 text-sm rounded-lg bg-zinc-600 focus:outline-none focus:text-zinc-300"
                    />
                </div>
            </div>
            <div class="w-60% mt-5">
                <button @click="chat.createChannel" class="bg-zinc-500 px-3 py-2 rounded-lg w-full hover:bg-zinc-400">Create channel</button>
            </div>
        </div>
    </div>
    </div>
	</div>
</template>