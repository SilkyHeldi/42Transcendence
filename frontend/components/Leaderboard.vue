<script setup lang="ts">
    const route = useRoute()
    const socket = useSocket()
    const game = useGame()

    const leaderboard = ref()
    onMounted(() => {
        socket.emit('leaderboard', (data : any) => {
            leaderboard.value = data;
        })
    })
</script>
<template>

<div class="flex justify-center">
    <div class="term-box min-h-60 min-w-80  overflow-y-scroll">
        <p class="text-4xl text-center m-2 font-bold home-font" style="letter-spacing : 2px;"> Leaderboard </p>
        <div v-for="player in leaderboard" >
            <nuxt-link :to="{
                name: '@user',
                params: {
                    user: player.username
                }
            }" class="flex m-4" style="font-family : terminal">
                <img :src="player.avatar" alt="" class="h-10 w-10">
                <div class="flex flex-col justify-center m-2">
                    <p class="text-white text-center">{{ player.username }}</p>
                </div>
                <p class="flex flex-col justify-center ml-auto"> {{ player.points }}</p>
            </nuxt-link>
        </div>
    </div>
</div>

</template>