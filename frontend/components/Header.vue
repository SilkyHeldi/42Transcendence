<script setup lang="ts">
import '/public/styles/home.css';
const auth = useAuth()
const game = useGame()
import { onClickOutside } from '@vueuse/core'; 
    const showUserMenu = ref(false)
    const toggleUserMenu = () => {
        showUserMenu.value = !showUserMenu.value
    }
    const menu = ref(null)

onClickOutside(menu, () => {
    showUserMenu.value = false
})
const socket = useSocket()
onMounted(async () => {
    await socket.connect()
})


</script>
<template>
    <div class=" min-h-61px home-font flex items-center justify-between px-5 relative" style="letter-spacing : 1px;">
        <div class="text-2rem">FT_transcendence</div>
        <!-- <div class="b-1 rounded p-2" @click="game.queue()">
            PLAY PONG
        </div> -->
        <img class="home-font h-34px hover:scale-110" src = "arcade-game-pong-gaming-svgrepo-com.svg" alt="te" @click="game.queue()"/>
        <nuxt-link to="/chat" class="home-font">
            <div class="i-material-symbols:chat-bubble-sharp hover:scale-110 text-2rem"></div>
        </nuxt-link>
        <!-- <div class="i-material-symbols:chat-bubble-sharp text-2rem"></div> -->
        <nuxt-link class="i-mdi:trophy hover:scale-110 text-2rem" to="/"></nuxt-link>
        <nuxt-link to="/settings" class="items-center hover:scale-110 text-white select-none py-2 cursor-pointer">
            <div class="home-font i-material-symbols:settings-sharp text-2rem"></div>
        </nuxt-link>
        <!-- <div class="i-material-symbols:settings-sharp text-2rem"></div> -->
        <nuxt-link :to="{
                    name: '@user',
                    params: {
                        user: auth.session?.username
                    }
                
                }" class="items-center home-font select-none text-white py-2 cursor-pointer">
                    <div class="i-material-symbols:account-box-sharp hover:scale-110 text-2rem"></div>
        </nuxt-link>
        <!-- <div class="i-material-symbols:account-box-sharp text-2rem"></div> -->
        <div>
            <div @click="toggleUserMenu" class="rounded bg-gray p-.5">
                <img :src="auth.session?.avatar" alt="" class="h-10 w-10">
            </div>
        </div>
        <UserMenu ref="menu" v-if="showUserMenu"/>
    </div>
</template>