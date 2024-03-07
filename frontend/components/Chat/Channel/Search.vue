<script setup lang="ts">

const chat = useChat()
const auth = useAuth()
const query = ref('')
const results = ref([])
//const searchChannel = async () => {
//    if(chat.searchTextChannel) {
//        results.value = await chat.searchChannel(chat.searchTextChannel)
//    } else {
//        results.value = []
//    }
//}
const isOwner = (users) => {
    return users.find(u => u.role == 'OWNER' && u.userId == auth.session.id)
}
const hasJoined = (users) => {
    return users.find(u => u.userId == auth.session.id)
}

const leaveChannel = (channel: any) => {
    let conversation = chat.conversations.get(channel.id)
    if(conversation) {
        conversation.leave((answer) => {
            if(answer.success) {

                setTimeout(() => {
                    chat.searchChannel()
                }, 100)
                channel.users = channel.users.filter(u => u.userId != auth.session.id)
            }
        })
    }
}

</script>
<template>
	<div class=" overflow-auto h-full flex-1">

    <div class="flex text-white flex-1 h-full w-full">
    <div class="py-5 w-full h-full">
        <div class="p-2.5 flex flex-col gap-5 items-center justify-center w-full">
            <div class="home-font text-4xl">Search channel</div>
            <div class="w-60%">
                <input
                    v-model="chat.searchChannelQuery"
                    @input="chat.manager.searchChannel(chat.searchChannelQuery)"
                    type="text"
                    placeholder="Search channel..."
                    style="font-family : terminal"
                    class="w-full px-4 py-2 text-sm term-box b-1 focus:outline-none focus:text-zinc-300"
                    />
            </div>
            <div class="grid  gap-5 w-full" style="font-family : terminal;">
                <div v-for="channel in chat.searchChannelResults" class="b-1 term-box w-full p-2 px-3 " style="border-width: 1px;">
                    <div class="flex justify-between items-center">
                        <div class="font-bold">#{{ channel.name }}</div>
                    </div>
                    <div>{{ channel.description }}</div>
                    <div>{{ channel.users.length }} membre{{ channel.users.length > 1 ? 's' : '' }}</div>
                    <div v-if="hasJoined(channel.users)">
                        <div v-if="isOwner(channel.users)">{{ 'You are OWNER of this channel'  }}</div>
                        <div class="flex w-full" >
                            <div  disabled  class="w-full bg-gray/50 hover:bg-gray/75  cursor-forbidden select-none   px-4 py-1 flex items-center font-bold capitalize justify-center">ALREADY JOINED</div>
                            <div>
                            <div @click="chat.manager.leaveConversation({
                                channelId: channel.id,
                                stay: true
                            })" class="w-full bg-teal/80 hover:bg-teal/60 cursor-pointer  px-2 py-1 flex items-center font-bold capitalize justify-center">LEAVE</div>
                        </div>
                        </div>
                    </div>
                    <div v-else>
                        <div v-if="channel.type == 'PUBLIC'" @click="chat.manager.joinConversation({channelId: channel.id})"  class="bg-teal/80 hover:bg-teal/60 cursor-pointer  px-2 py-1 flex items-center font-bold capitalize justify-center">JOIN</div>
                        <div class="flex " v-if="channel.type == 'PROTECTED'">
                            <div>
                                <input
                                v-model="channel.password"
                            type="text"
                            placeholder="Password..."
                            style="font-family : terminal; border-width: 1px;"
                            class="w-full px-4 py-1.5 text-sm  term-box focus:outline-none focus:text-zinc-300"
                            /></div>
                            <div  @click="chat.manager.joinConversation({channelId: channel.id, password: channel.password})"  class="bg-teal/80 hover:bg-teal/60 cursor-pointer -r px-2 py-1 flex items-center font-bold capitalize justify-center">
                                <div>JOIN</div>
                            </div>
                        </div>
                        <div v-if="channel.type == 'PRIVATE'"  disabled  class="bg-red/50 hover:bg-red/75  cursor-forbidden select-none   px-2 py-1 flex items-center font-bold capitalize justify-center">PRIVATE CHANNEL</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
	</div>
</template>