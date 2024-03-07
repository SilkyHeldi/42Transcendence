<script setup lang="ts">
    const props = defineProps<{
        gameId: string,
        state: any,
    }>();


    const game = useGame()

    let playerLeft = computed(() => {
        return props.state.left || {}
    })
    let playerRight = computed(() => {
        return props.state.right || {}
    })

    
</script>
<template>
    <div v-if="playerLeft?.userId && playerRight?.userId">
        <div class="term-box p-2.5 py-5 gap-5 shadow-lg w-full cursor-pointer flex flex-col justify-center"
        style="font-family : terminal">

            <nuxt-link :to="{
                name: 'game-game',
                params: {
                    game: gameId
                }
            }" class="home-font flex justify-center text-lg sm:text-[1.5rem] md:text-3xl lg:text-4xl  font-bold">
                    Game #{{ gameId  }}
            </nuxt-link>
            <div class="flex mt-1 justify-around px-10 gap-5 flex-col sm:flex-row">

                <nuxt-link v-if="playerLeft?.user" :to="{
                    name: '@user',
                    params: {
                        user: playerLeft?.user?.username
                    }
                }" class="term-box flex b-1 p-2.5 w-full justify-center hover:bg-white/20">
                    <div class="flex justify-center">
                        <div class="flex-col flex justify-center">
                            <p class="text-lg text-center text-zinc-200" >{{ playerLeft?.user?.username }}</p>
                            <p class="text-xs text-center text-zinc-400" >W/L : {{playerLeft?.user?.victories}}-{{ playerLeft?.user?.defeats }}</p>
                            <p class="text-xs text-center text-zinc-400" >Elo : {{playerLeft?.user?.points}}</p>
                        </div>
                    </div>
                    <img :src="playerLeft?.user?.avatar" :class="[playerLeft?.user?.online ? 'border-green-400' : 'border-yellow-400']" class="w-20 h-20 m-2 border-8  rounded-full" />
                </nuxt-link>
                <div class="flex flex-col justify-center">
                    <p class="text-zinc-160 ml-5 mr-5 text-7xl font-bold text-center">
                        VS
                    </p>
                </div>
                <nuxt-link v-if="playerRight?.user" :to="{
                    name: '@user',
                    params: {
                        user: playerRight?.user?.username
                    }
                }" class="term-box flex  b-1 p-2.5 w-full justify-center hover:bg-white/20">
                    <img :src="playerRight?.user?.avatar" :class="[playerRight?.user?.online ? 'border-green-400' : 'border-yellow-400']" class="w-20 h-20 m-2 border-8  rounded-full" />
                    <div class="flex justify-center">
                        <div class="flex-col flex justify-center">
                            <p class="text-lg text-center text-zinc-200" >{{ playerRight?.user?.username }}</p>
                            <p class="text-xs text-center text-zinc-400" >W/L : {{playerRight?.user?.victories}}-{{ playerRight?.user?.defeats }}</p>
                            <p class="text-xs text-center text-zinc-400" >Elo : {{playerRight?.user?.points}}</p>
                        </div>
                    </div>
                </nuxt-link>
            </div>

            <div class="flex items-center justify-center gap-5" v-if="!game.isFinished">
                <div @click="game.afk(gameId)" class="term-box b-1 px-2 py-1" style="border-width : 1px">
                    AFK
                </div>
                <div @click="game.quit(gameId)" class="term-box b-1 px-2 py-1" style="border-width : 1px">
                    QUIT
                </div>
                <div class="flex gap-2">
                    <div class="i-mdi:cogs text-2xl"></div>
                    <div @click="game.setPongBG('#00000020')" class="i-mdi:square text-[#00000020] h-10 w-10"></div>
                    <div @click="game.setPongBG('#ff000020')" class="i-mdi:square text-[#ff000020] h-10 w-10"></div>
                    <div @click="game.setPongBG('#00ff0020')" class="i-mdi:square text-[#00ff0020] h-10 w-10"></div>
                    <div @click="game.setPongBG('#0000ff20')" class="i-mdi:square text-[#0000ff20] h-10 w-10"></div>
                </div>
            </div>
</div>
    </div>
</template>