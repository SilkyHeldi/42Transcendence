<script setup lang="ts">
import '/public/styles/home.css';
	import slugify from 'slugify';
	const { notify }  = useNotification()

	const auth = useAuth()
	const chat = useChat()


	const search = ref('')
	let timer
	watch(() => chat.manager.active.channel.name, async (v) => {
		await nextTick()
		clearTimeout(timer)
        let newName = slugify(v, {strict: true, lower: true})
			.trim()
			.slice(0, 20)
		timer = setTimeout(() => {
			chat.manager.active.channel.name = newName
		}, 400)
	})
</script>
<template>
	<div class="flex-1 overflow-y-scroll" v-if="chat.manager.active">
		<div class="flex flex-col gap-2  pb-3 px-3" >
			<div class="p-2.5 flex flex-col gap-5 items-center justify-center w-full">
                <div class="font-bold home-font text-4xl" style="letter-spacing : 2px">Update channel</div>
            <div class="w-60%">
                <input
                    v-model="chat.manager.active.channel.name"
                    type="text"
                    maxlength="20"
                    placeholder="Update your channel name"
                    class="w-full px-4 py-2 text-sm term-box focus:outline-none focus:text-zinc-300"
                    style="border-width : 1px; font-family : terminal;"
                />
            </div>
            <div class="w-60%">
                <textarea
                    v-model="chat.manager.active.channel.description"
                    type="text"
                    rows="4"
                    maxlength="160"
                    placeholder="Enter a channel description"
                    class="w-full px-4 py-2 text-sm term-box focus:outline-none focus:text-zinc-300"
                    style="border-width : 1px; font-family : terminal;"
                />
            </div>
            <div class="w-full flex flex-col gap-2 items-center">
                <div class="text-center font-bold">Channel Type</div>

                <ChatChannelTypeTabs :channel="chat.manager.active.channel"/>

                <div class="w-60% mt-2" v-if="chat.manager.active.channel.type == 'PROTECTED'">
                    <input
                    v-model="chat.manager.active.channel.password"
                    type="text"
                    placeholder="Enter channel password"
                    style="font-family : terminal; border-width : 1px;"
                    class="w-full px-4 py-2 text-sm term-box focus:outline-none focus:text-zinc-300"
                    />
                </div>
            </div>
            <div class="w-60% mt-5">
                <button @click="chat.manager.active.saveSettings" class="bg-zinc-500 px-3 py-2 home-font term-box w-full home-button layers hero glitch" data-text="Update channel">Update channel</button>
            </div>
        </div>
		</div>
	</div>
</template>