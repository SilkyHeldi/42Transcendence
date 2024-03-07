<script setup lang="ts">
    const route = useRoute()
    const socket = useSocket()
    const game = useGame()
    const chat = useChat()
    const auth = useAuth()

    const profile = ref({
        id: '',
    })
    onMounted(() => {
        socket.emit('profile', route.params.user, (data) => {
            profile.value = data
        })
    })
</script>
<template>
    <div class="flex flex-col items-center  h-full" v-if="profile?.id">
        <div class="flex-1 w-full  h-full max-w-5xl flex flex-col gap-5">
        <div class="mt-10 font-bold text-5xl home-font">
            Profile of {{ profile.username }}
        </div>
        <div class=" term-box p-2.5 text-3x flex flex-col items-center" style="font-family: terminal;">
            <ChatUserAvatar size="h-24 w-24 " :userId="profile.id" :avatar="profile.avatar" />
            <div class="text-white text-2xl pt-3 font-bold">
                {{ profile.username }}
            </div>
            <div class="text-xl">
                {{ profile.email }}
            </div>
            <div class="text-xl mb-2">
                {{ profile.points }} ELO
            </div>
            <div class="flex flex-wrap home-font justify-center gap-5 b-y-1 mb-5 w-full pb-2 pt-2">
          <div class="flex items-center justify-center flex-col">
            <div class="font-bold text-2xl">{{ profile.victories }}</div>
            <div>Victories</div>
          </div>
          <div class="flex items-center justify-center flex-col">
            <div class="font-bold text-2xl">{{ profile.defeats }}</div>
            <div>Defeats</div>
          </div>
        </div>
        <div v-if="auth.session.id != profile.id" class="flex items-center justify-center m-2">
            <div
              @click="game.challenge(profile.id)"
              class="flex-1 hover:bg-white w-full hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1"
            >
            <div class="i-mdi:trophy"></div>
              Play Pong
            </div>
            <div
                @click="chat.addFriend(profile.id)"
                class="flex-1  hover:bg-white w-full hover:text-gray-700 cursor-pointer whitespace-nowrap flex items-center px-2 gap-2  justify-center py-1"
            >
            <div class="i-mdi:user"></div>
                {{ chat.friends.find(u => u.id == profile?.id) ? 'Remove Friend' : 'Add Friend' }}
            </div>
        </div>
        <!--{{ profile }}-->
     <div v-if="profile.currentGame" class="my-5">

         <div class="text-3xl mb-5">Currently Playing</div>
         <div class="b-1 rounded p-2.5">
             
             <PongBanner :gameId="profile.currentGame.id" :state="profile.currentGame.state" />
            </div>
        </div>
     <div  class="my-5 w-full">
         <div class="text-3xl mb-5 home-font">History</div>
         <div class="b-1 term-box p-2.5 w-full" v-if="profile.gameHistory">
             <div class="grid grid-cols-3">
                    <div class="text-xl font-bold">Winner</div>
                    <div class="text-xl font-bold">Loser</div>
                    <div class="text-xl font-bold">Score</div>
             </div>
             <PongHistory v-for="game in profile.gameHistory"  :game="game" />
            </div>
            <div  v-else class="text-xl mb-5">No game found.</div>
        </div>
    </div>
    </div>
    </div>
</template>