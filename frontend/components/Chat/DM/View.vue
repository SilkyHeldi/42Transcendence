<script setup lang="ts">
    const chat = useChat()
    const auth = useAuth()
    const friendship = computed(() => {
        return chat.friends.find((friend: any) => friend.id === chat.manager.active?.recipient?.userId)
    })
    const isAccepted = computed(() => {
        return friendship.value?.accepted === true
    })

    const isBlocked = computed(() => {
        return chat.blockedUsers.includes(chat.manager.active?.recipient?.userId)
    })

    const shouldConfirm = computed(() => {
        return friendship.value?.accepted === false && friendship.value?.source === false
    })
    const waitConfirm = computed(() => {
        return friendship.value?.accepted === false && friendship.value?.source === true
    })
</script>
<template>
    <div class="flex text-white flex-1 h-[calc(100vh-100px)] w-full " v-if="chat.manager.active">
		<div class="flex flex-col gap-2 w-full flex-1">
            <div class=" flex justify-center ">
                <ChatProfileModalTrigger
              class="hover:text-white cursor-pointer hover:scale-110 transition-all"
              v-if="chat.manager.active.recipient?.userId"
              :userId="chat.manager.active.recipient?.userId"
            >
              <template v-slot="{ user }">
                
                <ChatUserAvatar class="mt-5" size="h-24 w-24 " :userId="chat.manager.active.recipient?.userId" :avatar="chat.manager.active.recipient?.user.avatar" ></ChatUserAvatar>
              </template>
            </ChatProfileModalTrigger>
            </div>
            <div class="flex flex-col items-center">
                <ChatProfileModalTrigger
                class="hover:text-white cursor-pointer hover:scale-110 transition-all" style="font-family : terminal;"
                v-if="chat.manager.active.recipient?.userId"
                :userId="chat.manager.active.recipient?.userId"
              >
                <template v-slot="{ user }">@{{ user?.username }}</template>
              </ChatProfileModalTrigger>
                <div style="font-family : terminal;">{{ chat.manager.active.recipient?.user.email  }}</div>
            </div>
            <div class="flex flex-col items-center b-t-1 p-2.5  h-full w-full">
                <div v-if="isBlocked">
                    <div class="font-bold home-font text-2xl my-5">
                        You have blocked this user
                    </div>
                </div>
                <div  class=" justify-between flex flex-1  flex-col overflow-auto h-full   w-full " v-else-if="isAccepted">
                    <div class="relative flex-1" >
                        <div class="absolute px-2 bottom-0 left-0 right-0 top-0 overflow-auto pb-3" >
                            <ChatMessages />
                        </div>
                    </div>
                    <div class=" h-100px ">
                        <ChatSendMessage />
                    </div>
                </div>
                <div v-else>
                    <div v-if="shouldConfirm">
                        
                        <div class="font-bold  home-font text-2xl my-5">
                            @{{ chat.manager.active.recipient?.user.username }} wants to be your friend
                        </div>
                        <div class="flex gap-2 justify-center mt-5 home-font">
                            <button class="btn btn-primary" @click="chat.acceptFriend(chat.manager.active?.recipient?.userId)">Accept</button>
                            <button class="btn btn-primary" @click="chat.declineFriend(chat.manager.active?.recipient?.userId)">Decline</button>
                        </div>
                    </div>
                    <div v-else-if="waitConfirm">
                        
                    <div class="font-bold home-font text-2xl my-5">
                        You have sent a friend request to @{{ chat.manager.active.recipient?.user.username }}.
                    </div>
                    <div class="font-bold text-xl my-5" style="font-family : terminal;">
                        You'll be able to chat once they accept your request.
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>