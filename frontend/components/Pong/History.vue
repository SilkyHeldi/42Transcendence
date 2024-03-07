<script setup lang="ts">
    const props = defineProps<{
        game: {
            id: string
            winnerId: string
winner: {
    username: string
    avatar: string
}
winnerScore : number
loserId : string
loser : {
    username: string
    avatar: string
}
loserScore : number
date : string
        },
    }>();


</script>
<template>
    
    <div class="grid grid-cols-3 my-5">
        <nuxt-link  :to="{
                    name: '@user',
                    params: {
                        user: game.winner.username
                    }
                }" class="text-xl font-bold flex gap-2 w-full justify-start ">
            <div>
                <ChatUserAvatar size="h-16 w-16 " :userId="game.winnerId" :avatar="game.winner.avatar" />
            </div>
            <div class="text-xl font-bold">{{ game.winner.username }}</div>
        </nuxt-link>
        <nuxt-link  :to="{
                    name: '@user',
                    params: {
                        user: game.loser.username
                    }
                }" class="text-xl font-bold flex gap-2 w-full justify-start ">
            <div>
                <ChatUserAvatar size="h-16 w-16 " :userId="game.loserId" :avatar="game.loser.avatar" />
            </div>
            <div class="text-xl font-bold">{{ game.loser.username }}</div>
        </nuxt-link>
        <div class="text-xl font-bold">
            {{ game.winnerScore }} - {{ game.loserScore }}
        </div>

    </div>
</template>