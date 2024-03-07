<script setup lang="ts">
    const route = useRoute()
    const auth = useAuth()
    const game = useGame()

    const state = ref({
        canvas: {
            w: 600,
            h: 600,
        },
        left: {
            x: 0,
            y: 0,
            w: 20,
            h: 80,
            score: 0,
            color: 'white'
        },
        right: {
            x: 0,
            y: 0,
            w: 20,
            h: 80,
            score: 0,
            color: 'white'
        },
        ball: {
            x: 0.5,
            y: 0.5,
            w: 20,
            h: 20,
            speed: 0,
            velX: 6,
            velY: 6,
            color: 'white'
        },
    })
    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            game.moveDown(route.params.game)
        }
        if (e.key === 'ArrowUp') {
            game.moveUp(route.params.game)
        }
    }

let inv = ref()
    onMounted(async () => {
        await game.connect(route.params.game)
        while (!playerLeft.value.userId || !playerLeft.value.userId) {
            await new Promise((resolve) => {
                setTimeout(resolve, 100)
            })
        }
        if (game.state.left.userId === auth.session?.id) {
            state.value.left.color = 'red'
            document.addEventListener('keydown', handleKeydown)
        } else if (game.state.right.userId === auth.session?.id) {
            state.value.right.color = 'red'
            document.addEventListener('keydown', handleKeydown)
        }
        //inv.value = setInterval(() => {
        //    // ball.x is percentage of canvas width, so 
        //    let realX = state.value.ball.x * state.value.canvas.w
        //    if (realX + state.value.ball.w >= state.value.canvas.w) {
        //        state.value.ball.velX = -state.value.ball.velX
        //    }
        //    if (realX - state.value.ball.w  <= 0) {
        //        state.value.ball.velX = -state.value.ball.velX
        //    }
        //    let realY = state.value.ball.y * state.value.canvas.h
        //    if (realY + state.value.ball.h >= state.value.canvas.h) {
        //        state.value.ball.velY = -state.value.ball.velY
        //    }
        //    if (realY - state.value.ball.h <= 0) {
        //        state.value.ball.velY = -state.value.ball.velY
        //    }
        //    state.value.ball.x += state.value.ball.velX / state.value.canvas.w
        //    state.value.ball.y += state.value.ball.velY / state.value.canvas.h

        //}, 1000/60)
    })

    let playerLeft = computed(() => {
        return game.state.left || {}
    })
    let playerRight = computed(() => {
        return game.state.right || {}
    })

    onBeforeUnmount(() => {
        document.removeEventListener('keydown', handleKeydown)
        clearInterval(inv.value)
    })
</script>
<template>
    <div class="flex flex-col items-center  h-full">
        <div class="flex-1 w-full h-full max-w-5xl flex flex-col gap-5">
            
            <div class="">

            <PongBanner :gameId="$route.params.game" :state="game.state" />

           
            </div>
            <div class=" shadow-lg  w-full flex-1 cursor-pointer rounded-lg flex flex-col justify-center">
                <PongContainer
                v-if="game.state.status != 'finished' && !game.isFinished"
                :state="game.state"/>
                <div v-if="game.isFinished">
                <div>
                    <nuxt-link :to="{
                name: 'game-game',
                params: {
                    game: route.params.game
                }
            }" style="font-family : terminal;" class=" flex justify-center text-lg sm:text-[1.5rem] md:text-3xl lg:text-4xl  font-bold">
                    Game #{{ route.params.game  }}
            </nuxt-link>
                    <div class="flex mt-3 term-box items-center justify-center ">
                    <div class="flex-col m-3 justify-center " style="font-family : terminal;" v-if="game.endGame?.winner">

                    
                    <p class="text-zinc-200 ml-5 mr-5 text-5xl font-bold text-center" >
                        {{ (game.endGame.winner.id === auth.session.id) ? 'You win !' : game.endGame.winner.username + ' wins !' }}
                    </p>
                    
                    <div class="flex justify-center m-2">
                        <img  :src="game.endGame.winner.avatar" class="w-20 h-20 border-4 border-zinc-100 rounded-full justify-center" />
                    </div>

                    <div class="flex justify-center m-4">
                        <nuxt-link v-if="game.endGame?.winner?.username" :to="{
                            name: '@user',
                            params: {
                                user: game.endGame?.winner?.username
                            }
                        }" class="flex b-1 p-2 term-box">
                        {{ game.endGame.winner.username }} {{ game.endGame.winner.id === auth.session.id ? '(You)' : '' }}<br/> +20 points
                        </nuxt-link>
                        <div class=" m-1">
                        </div>
                        <nuxt-link  v-if="game.endGame?.loser?.username" :to="{
                            name: '@user',
                            params: {
                                user:game.endGame?.loser?.username
                            }
                        }" class=" flex b-1 p-2 term-box">
                        {{ game.endGame.loser.username }} {{ game.endGame.loser.id === auth.session.id ? '(You)' : '' }} <br/> -20 points
                        </nuxt-link>
                    </div>

                    </div>
                </div>
                </div>
        </div>
            </div>
        </div>
    </div>
</template>