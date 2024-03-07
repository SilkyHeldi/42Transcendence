<script setup lang="ts">
    const auth = useAuth()
    const conversation = ref({
        users: [
            {
                id: 1,
                username: 'mguerra'
            },
            {
                id: 2,
                username: 'jij'
            },
        ],
        messages: [
            {
                from: 1,
                content: 'Hello',
                timestamp: new Date()
            },
            {
                from: 2,
                content: 'Yoooooo',
                timestamp: new Date()
            },
            {
                from: 1,
                content: 'Hello',
                timestamp: new Date()
            },
            {
                from: 2,
                content: 'Yoooooo',
                timestamp: new Date()
            },
            {
                from: 1,
                content: 'Hello',
                timestamp: new Date()
            },
            {
                from: 2,
                content: 'Yoooooo',
                timestamp: new Date()
            },
            {
                from: 1,
                content: 'Hello',
                timestamp: new Date()
            },
            {
                from: 2,
                content: 'Yoooooo',
                timestamp: new Date()
            },
            {
                from: 1,
                content: 'Hello',
                timestamp: new Date()
            },
            {
                from: 2,
                content: 'Yoooooo',
                timestamp: new Date()
            },
        ],
        isPrivate: true
    })
    const content = ref("")
    const messagesContainer = ref(null)
    const getUserFromId = (id: number) => conversation.value.users.find(u => u.id == id)
    const dest = computed(() => {
        return conversation.value.users.find(u => u.id != auth.session.id)
    })
    const sendMessage = async (e) => {
        if (e.type == 'click') {
            conversation.value.messages.push({
                from: auth.session.id,
                content: content.value,
                timestamp: new Date()
            })
            content.value = ''
            await nextTick()
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        } else if(e.type == 'keypress') {
            if(e.key == 'Enter' && e.shiftKey != true) {
                e.preventDefault();
                conversation.value.messages.push({
                    from: auth.session.id,
                    content: content.value,
                    timestamp: new Date()
                })
                content.value = ''
                await nextTick()
                messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
            }
        }
    }
    onMounted(() => {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    })
</script>
<template>
    <div class="flex text-white flex-1 h-full w-full">
        <div class="p-2.5 flex justify-center w-full" v-if="conversation.isPrivate">
            <div class="flex flex-col gap-2 w-full">
                <div class="flex w-full gap-2">
                        <div class="rounded-full bg-gray p-2">
                            <div class="i-mdi:user text-3xl text-white"></div>
                        </div>
                    <div class="flex flex-col gap-1 it-center">
                    <div class="">
                        @{{ dest.username }}
                    </div>
                    <div class="">
                        ELO: 123 | Victories: 111 | Defeats: 111
                    </div>
                    </div>
                </div>
                <div class="flex items-center justify-center w-full">
                    <div class="flex-1 hover:bg-white hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1 b-1 rounded-l">
                        <div class="i-mdi:user"></div>
                        Add Friend</div>
                    <div class="flex-1 hover:bg-white hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1 b-y">
                        <div class="i-mdi:trophy"></div>
                        Challenge</div>
                    <div class="flex-1 hover:bg-white hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1 b-1 rounded-r">
                        <div class="i-mdi:block-helper"></div>
                        Block</div>
                </div>
                <div class="flex flex-col gap-2 overflow-y-scroll pb-3 pr-3" ref="messagesContainer">
                    <div v-for="message,i in conversation.messages" class="rounded-lg shadow-md p-2.5 w-80% flex" :class="[
                        message.from == auth.session.id ? 'bg-green/50 ml-auto shadow-green' : 'bg-blue/50 shadow-blue',
                        message.from != conversation.messages[i - 1]?.from ? 'mt-5' : ''
                    ]">
                        <div class="flex gap-2">
                            <div class="">
                                <div class="rounded-full bg-gray p-2">
                                    <div class="i-mdi:user text-lg text-white"></div>
                                </div>
                            </div>
                            <div class="flex flex-col">
                                <div class="flex gap-2 items-center leading-1">
                                    <div>{{ getUserFromId(message.from)?.username }}</div>
                                    <div class="text-xs text-gray-300">{{ message.timestamp.toLocaleString() }}</div>
                                </div>
                                <div class="text-sm mt-1.5 text-white/80">{{ message.content }}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class=" flex items-center w-full bg-gray-800 p-1 rounded-lg gap-2">
                        <textarea v-model="content" @keypress.enter="sendMessage" class="h-80px flex-1 w-full bg-transparent text-lg outline-none pl-3 pt-1 resize-none"></textarea>
                    <div>
                        <div @click=sendMessage class="bg-blue hover:scale-110 cursor-pointer rounded-full text-3xl p-2 mr-2">
                            <div class="i-mdi:send"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>