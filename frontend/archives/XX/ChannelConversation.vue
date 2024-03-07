<script setup lang="ts">
    const auth = useAuth()
	const chat = useChat()
   
	const tab = ref("chat")

	onMounted(() => {
		tab.value = 'chat'
	})
</script>
<template>
    <div class="flex text-white flex-1 h-full w-full">
		<div class="flex flex-col gap-2 w-full h-full">
			<div class="text-3xl text-white px-5 pt-5 flex items-center gap-2">
				<div>#{{ chat.conversation.channel.name }}</div>
				<div @click="tab = 'settings'" class="text-xl bg-gray-400 rounded p-1 hover:scale-110 cursor-pointer transition-all" v-if="chat.conversation.role == 'OWNER'">
					<div class="i-mdi:cog"></div>
				</div>
				<div @click="chat.leaveChannel(chat.conversation.channelId)" class="text-xl bg-gray-400 rounded p-1 hover:scale-110 cursor-pointer transition-all" >
					<div class="i-mdi:sign-out"></div>
				</div>
			</div>
			<div class="text-sm text-white px-5 flex items-center gap-2" style="font-family: terminal;">
				<div>En ligne: {{ chat.getChannelOnlineUsers(chat.conversation).length }}</div>
				
			</div>
			<div class="text-sm text-white px-5 flex items-center gap-2 break-all">{{ chat.conversation.channel.description }}</div>
			<!-- Tabs -->
			<div class="text-lg sm:text-xl text-white px-5 ">
				<div class="w-full">
				<div class="relative right-0">
					<ul
					class="relative flex list-none flex-wrap rounded-lg bg-blue-gray-50/60 p-1"
					data-tabs="tabs"
					role="list"
					>
					<li class="z-30 flex-auto text-center">
						<a
						:class="[tab == 'chat' ? 'bg-white/50' : 'bg-inherit' ]"
						class="text-slate-700 z-30 mb-0  px-2 flex w-full  cursor-pointer items-center justify-center rounded-lg border-0  px-0 py-1 transition-all ease-in-out"
						@click="tab = 'chat'"
						active
						role="tab"
						aria-selected="true"
						>
						<span class="ml-1">Chat</span>
						</a>
					</li>
					<li class="z-30 flex-auto text-center">
						<a
						
						:class="[tab == 'members' ? 'bg-white/50' : 'bg-inherit' ]"
						class="text-slate-700 z-30 mb-0  px-2 flex w-full cursor-pointer items-center justify-center rounded-lg border-0  px-0 py-1 transition-all ease-in-out"
						@click="tab = 'members'"
						role="tab"
						aria-selected="false"
						>
						<span class="ml-1">Members ({{ chat.getChannelUsers(chat.conversation).length }})</span>
						</a>
					</li>
					<li class="z-30 flex-auto text-center">
						<a
						:class="[tab == 'invite' ? 'bg-white/50' : 'bg-inherit' ]"
						class="text-slate-700 z-30 mb-0  px-2 flex w-full cursor-pointer items-center justify-center rounded-lg border-0 bg-inherit px-0 py-1 transition-all ease-in-out"
						@click="tab = 'invite'"
						role="tab"
						aria-selected="false"
						>
						<span class="ml-1">Invite</span>
						</a>
					</li>
					</ul>
				</div>
				</div>
			</div>
			<!-- Tab view -->
			<div v-if="tab == 'chat'" class="flex flex-col p-2 h-full overflow-auto">
				<ChatMessages />
				<ChatSendMessage />
			</div>
			<div v-if="tab == 'members'" class="flex flex-col p-2 h-full overflow-auto">
				<ChatMembers/>
			</div>
			<div v-if="tab == 'settings'" class="flex flex-col p-2 h-full overflow-auto">
				<ChatSettings/>
			</div>
		</div>
    </div>
</template>