<script setup lang="ts">
    const auth = useAuth()
    const game = useGame()
    const {width} = useWindowSize()
    const route = useRoute()

    const board = ref()

    const maxWidth = computed(() => {
        return width.value > 800 ? 800 : 400
    })
    const maxHeight = computed(() => {
        return width.value > 800 ? 500 : 250
    })
    const isHalved = computed(() => {
        return width.value < 800
    })

    const init = () => {
        const canvas = board.value as HTMLCanvasElement
        if (canvas === undefined) return

        canvas.style.width ='100%';
        canvas.style.height='100%';
        canvas.style.borderColor='white';
        canvas.style.borderWidth='1px';
        canvas.style.borderRadius='8px';

        canvas.width  = canvas.offsetWidth;
        canvas.height  = canvas.offsetHeight;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        
        
    }
    //watch(() => props.state, (newVal, oldVal) => {
    //    draw()
    //})

    const draw = () => {
        const canvas = board.value as HTMLCanvasElement
        if (!canvas) return 
        canvas.width  = canvas.offsetWidth;
        canvas.height  = canvas.offsetHeight;
        canvas.style.width ='100%';
        canvas.style.height='100%';
        canvas.style.maxWidth = maxWidth.value + 'px'
        canvas.style.maxHeight = maxHeight.value + 'px'
        if (canvas === undefined) return
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D


        ctx.clearRect(0, 0, canvas.width, canvas.height)

        //ctx.fillStyle = props.state.ball.color
        //ctx.fillRect(props.state.ball.x * canvas.width - props.state.ball.w / 2, props.state.ball.y * canvas.height - props.state.ball.h / 2, props.state.ball.w, props.state.ball.h)
        ctx.globalCompositeOperation = 'destination-over';
        // draw the net down the middle), with dashed line
        //ctx.fillStyle = 'white'
        ctx.strokeStyle = 'white'
        ctx.setLineDash([30, 52])
        ctx.beginPath()
        ctx.moveTo(canvas.width / 2, 0)
        ctx.lineTo(canvas.width / 2, canvas.height)
        ctx.lineWidth = 6
        ctx.stroke()


        //draw background
        ctx.globalCompositeOperation = 'source-over';
        
        // write Score on the board
        ctx.font = isHalved.value ? '40px Arial' : '80px Arial'
        ctx.fillStyle = '#ffffffa0'

        if (!game.state.left?.userId) return 
        if (!game.state.right?.userId) return 
        //if (!game.state.left?.score) return console.log("NO LEFT")
        //if (!game.state.right?.score) return console.log("NO RIGHT")
        //console.log("NO")
        ctx.fillText(game.state.left.score, canvas.width / 4 - 25, 80)
        ctx.fillText(game.state.right.score, canvas.width / 4 * 3 - 25, 80)

        ////draw the paddles
        ctx.fillStyle = game.state.left.color
        // place in the middle of the screen on the left
        // clearFirst to avoid ghosting
        let leftSize = {
            y: isHalved.value ? game.state.left.y / 2 : game.state.left.y,
            x: isHalved.value ? game.state.left.x / 2 : game.state.left.x,
            w: isHalved.value ? game.state.left.w / 2 : game.state.left.w ,
            h: isHalved.value ? game.state.left.h / 2 : game.state.left.h
        }
        //ctx.clearRect(5, 5, leftSize.w, canvas.height)
        ctx.fillRect(5, leftSize.y - leftSize.h / 2, leftSize.w, leftSize.h)

        ctx.fillStyle = game.state.right.color

        let rightSize = {
            y: isHalved.value ? game.state.right.y / 2 : game.state.right.y,
            x: isHalved.value ? game.state.right.x / 2 : game.state.right.x ,
            w: isHalved.value ? game.state.right.w / 2 : game.state.right.w ,
            h: isHalved.value ? game.state.right.h / 2 : game.state.right.h
        }
        // place in the middle of the screen on the right
        //ctx.clearRect(canvas.width - 5 - rightSize.w, 5, rightSize.w, canvas.height)
        ctx.fillRect(canvas.width - 5 - rightSize.w, rightSize.y - (leftSize.h /2) , rightSize.w, rightSize.h)

        //////draw the ball
        //ctx.fillStyle = game.state.ball.color

        let ballSize = {
            w: isHalved.value ? game.state.ball.w /2 : game.state.ball.w,
            h: isHalved.value ? game.state.ball.h /2 : game.state.ball.h,
            x: isHalved.value ? game.state.ball.x / 2: game.state.ball.x,
            y: isHalved.value ? game.state.ball.y / 2: game.state.ball.y
        }
        
        //ctx.clearRect(0, 0, ballSize.w, ballSize.w)
        ctx.fillRect(canvas.width - ballSize.x, canvas.height - ballSize.y, ballSize.w, ballSize.w)

        //ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = localStorage.getItem("pong-bg") || 'black'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    let intv = ref()
    onMounted(() => {
        init()
        draw()
        intv.value = setInterval(() => {
            draw()
        }, 1000 / 60)
    })

    onBeforeUnmount(() => {
        clearInterval(intv.value)
    })
</script>
<template>
    <div class="w-full my-4   mx-auto flex flex-col  justify-center relative ">
        <div >

        <div class="mt-6  w-full flex-col items-center  mx-auto flex " :class="[isHalved ? `w-${maxWidth}px h-${maxHeight}px` : `w-${maxWidth}px h-${maxHeight}px`]">
        <div  v-if="game.state.status == 'ready'" class="relative flex ">
            <div v-if="game.state?.left" :style="[`width: ${(maxWidth/2)-10}px; height: ${maxHeight-10}px`]"  class="bg-green/40 top-5px  right-5px p-2  absolute z-4 flex items-center justify-center">
            <div  class="w-50" >
                <div class="term-box py-4 px-2" style="font-family : terminal;" v-if="game.state.left?.ready == false && game.state.left.userId != auth.session.id">
                    <div >
                        <div class="flex justify-center mx-auto">
                            <div class="animate-bounce h-[16px] w-[16px] bg-white rounded-full" ></div>
                        </div>
                        <div class="bg-white h-1 w-10 m-2 mx-auto "></div>
                        <p class="text-sm text-white text-center">Waiting for ready</p>
                    </div>
                </div>
                <div class="flex justify-center" v-if="game.state.left?.ready === false && game.state.left.userId === auth.session.id">
                    <button @click="game.beReady($route.params.game)" class="term-box w-60 hover:bg-teal/30 px-2 py-1 m-2 cursor-pointer" style="font-family : terminal;">
                        <p class="text-zinc-200 text-center">
                            I'm ready
                        </p> 
                    </button>
                </div>
                <div v-else-if="game.state.left?.ready">
                    <div >
                        <div class="flex justify-center mx-auto">
                            <div class="text-3xl  rounded-full p-2.5 b-2" >
                            <div class="text-3xl bg-zinc-200 rounded-full i-mdi:check" ></div>
                        </div>
                        </div>
                        <p class="text-xs mt-5 text-zinc-200 text-center">READY</p>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="game.state?.right"   :style="[`width: ${(maxWidth/2)-10}px; height: ${maxHeight-10}px;  right: 5px `]"    class="bg-green/40 top-5px  left-5px  p-2  rounded absolute z-4 flex items-center justify-center">
            <div  class="w-50" >
                <div class="term-box py-4 px-2" style="font-family : terminal;" v-if="game.state.right?.ready == false && game.state.right.userId != auth.session.id">
                    <div >
                        <div class="flex justify-center mx-auto">
                            <div class="animate-bounce h-[16px] w-[16px] bg-white rounded-full" ></div>
                        </div>
                        <div class="bg-white h-1 w-10 m-2 mx-auto"></div>
                        <p class="text-sm  text-white text-center">Waiting for ready</p>
                    </div>
                </div>
                <div class="flex justify-center" v-if="game.state.right?.ready === false && game.state.right.userId === auth.session.id">
                    <button @click="game.beReady($route.params.game)" class="term-box w-60 hover:bg-teal/30 px-2 py-1 m-2 cursor-pointer" style="font-family : terminal;">
                        <p class="text-white text-center">
                            I'm ready
                        </p> 
                    </button>
                </div>
                <div v-else-if="game.state.right?.ready">
                    <div >
                        <div class="flex justify-center mx-auto">
                            <div class="text-3xl  rounded-full p-2.5 b-2" >
                            <div class="text-3xl bg-zinc-200 rounded-full i-mdi:check" ></div>
                        </div>
                        </div>
                        <p class="text-xs mt-5 text-zinc-200 text-center">READY</p>
                    </div>
                </div>
            </div>
        </div>
        </div>
        <!--<div>{{ game.state.left.w }} {{ game.state.left.h }} {{ game.state.left.x }} {{ game.state.left.y }}</div>-->
        
        <!--<div>{{ game.state.ball.w }} {{ game.state.ball.h }} {{ game.state.ball.x }} {{ game.state.ball.y }}</div>
        <div>{{ game.state.right.w }} {{ game.state.right.h }} {{ game.state.right.x }} {{ game.state.right.y }}</div>-->
            <canvas ref="board" id="pong" class="z-2" ></canvas>
        </div>
        </div>
    </div>
</template>