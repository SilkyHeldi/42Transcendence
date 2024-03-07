<script setup lang="ts">
import '/public/styles/home.css';
    const auth = useAuth()
	const chat = useChat()

   
	const tab = ref("chat")

	onMounted(() => {
		tab.value = 'chat'
	})


</script>
<template>
    <div class="flex text-white flex-1 h-[calc(100vh-100px)] w-full " v-if="chat.manager.active">
		<div class="flex flex-col gap-2 w-full flex-1">
			<div class="text-3xl text-white px-5 pt-5 flex items-center gap-2" style="font-family : terminal; letter-spacing : 2px;">
				<div>#{{ chat.manager.active.channel.name }}</div>
				<div @click="tab = 'settings'" class="text-xl term-box p-1 hover:scale-110 cursor-pointer transition-all" v-if="chat.manager.active.isOwner">
					<div class="i-mdi:cog"></div>
				</div>
				<div v-if="!chat.manager.active.isBanned"  @click="chat.manager.leaveConversation(chat.manager.active)" class="text-xl term-box p-1 hover:scale-110 cursor-pointer transition-all" >
					<div class="i-mdi:sign-out"></div>
				</div>
			</div>
            <div v-if="chat.manager.active.isBanned"  class="flex flex-col items-center b-t-1 p-2.5  h-full w-full">
                <div class="font-bold text-2xl my-5" style="font-family: terminal;">
                You have been banned from this channel until {{ new Date(chat.manager.active.bannedUntil)?.toLocaleString('fr-FR', {
                            timeZone: 'Europe/Paris',
                        })}}
                </div>
            </div>
            <div v-else class="flex flex-col gap-2 w-full flex-1">

            <div class="text-xs text-white px-5 flex items-center gap-2" style="font-family: terminal;">
				<div>En ligne: {{ chat.manager.active.users.length }}</div>
			</div>
			<div v-if="chat.manager.active.channel.description" class="text-sm text-white px-5 flex items-center gap-2 break-all" style="font-family: terminal;">{{ chat.manager.active.channel.description }}</div>
			<div class="text-lg sm:text-xl text-white px-5 ">
				<div class="w-full">
				<div class="relative right-0">
					<ul
					class="relative flex list-none flex-wrap term-box p-1"
					data-tabs="tabs"
					role="list"
					>
					<li class="flex-auto text-center">
						<a
						:class="[tab == 'chat' ? 'bg-white/50' : 'bg-inherit' ]"
						class="text-slate-700 mb-0  px-2 flex w-full  cursor-pointer items-center justify-center border-0  px-0 py-1 transition-all ease-in-out"
						@click="tab = 'chat'"
						active
						role="tab"
						aria-selected="true"
						>
						<span class="ml-1 text-white mono" style="font-family : terminal; letter-spacing : 1px;">Chat</span>
						</a>
					</li>
					<li class="flex-auto text-center">
						<a
						
						:class="[tab == 'members' ? 'bg-white/50' : 'bg-inherit' ]"
						class="text-slate-700 mb-0  px-2 flex w-full cursor-pointer items-center justify-center  border-0  px-0 py-1 transition-all ease-in-out"
						@click="tab = 'members'"
						role="tab"
						aria-selected="false"
						>
						<span class="ml-1 text-white" style="font-family : terminal; letter-spacing : 1px;">Members ({{ chat.manager.active.users.length }})</span>
						</a>
					</li>
					<!--<li class="flex-auto text-center">
						<a
						:class="[tab == 'invite' ? 'bg-white/50' : 'bg-inherit' ]"
						class="text-slate-700 mb-0  px-2 flex w-full cursor-pointer items-center justify-center rounded-lg border-0 bg-inherit px-0 py-1 transition-all ease-in-out"
						@click="tab = 'invite'"
						role="tab"
						aria-selected="false"
						>
						<span class="ml-1">Invite</span>
						</a>
					</li>-->
					</ul>
				</div>
				</div>
			</div>
			<div v-if="tab == 'chat'" class=" justify-between flex flex-1  flex-col overflow-auto">
				
                <div class="relative flex-1 ">
                    <div class="absolute px-2 bottom-0 left-0 right-0 top-0 overflow-auto pb-3" >
                       
                        <ChatMessages />
                   
                    </div>
                </div>
                <div class=" h-100px ">
                    <ChatSendMessage />
                </div>
			</div>
			<div v-if="tab == 'members'" class="flex flex-col p-2 flex-1 overflow-auto">
				<ChatChannelMembers/>
			</div>
			<div v-if="tab == 'settings'" class="flex flex-col  flex-1 overflow-auto">
                <div class="relative flex-1 ">
                    <div class="absolute px-2 bottom-0 left-0 right-0 top-0 overflow-auto" >
				<ChatChannelSettings/>
			</div>

</div>
			</div>
			</div>
		</div>
    </div>
</template>