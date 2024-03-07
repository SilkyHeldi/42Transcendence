<script setup lang="ts">
import '/public/styles/home.css';
import slugify from 'slugify'
const route = useRoute();
const auth = useAuth();
const game = useGame()
const avatarFile = ref(null);
const onFileSelected = async (event: any) => {
    avatarFile.value = event.target.files[0]
}
const avatarPreview = computed(() => {
    return avatarFile.value ? URL.createObjectURL(avatarFile.value) : auth.session.avatar
})

const debounce = (func: any, wait: any, immediate: any) => {
    let timeout: any;
    return function() {
        let context = this, args = arguments;
        let later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args)
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context,args)
    }
}

const onInput = debounce((event: any) => {
    auth.session.username = slugify(event.target.value, {
        replacement: '_',
        lower: true,
        strict: true
    })
}, 400, false)
onMounted(async () => {
    
})
await auth.getSession();
</script>
<template>
  <main class="h-100vh">
    <div v-if="auth.showLoginView">
        <!-- Homepage -->
        <div class="h-full w-full video-container">
            <video class="top-0 bottom-0 left-0 right-0" autoplay loop muted preload="auto">
              <source src="/videos/grid.mp4" type="video/mp4">
            </video>
        </div>

        <div class="relative z-100 flex items-center flex-col gap-5 justify-start w-full h-full py-40 px-5">
            <div class="flex w-full max-w-1900px items-center h-100px">
              <button class="transition-all w-full big-title layers hero glitch neon-text text-3.5rem md:text-5rem lg:text-7rem" data-text="WELCOME TO PONG">WELCOME TO PONG</button>
            </div>
            <div class="grid sm:grid-cols-2 gap-5 max-w-1900px w-full">
                <div class="term-box flex flex-col">
                  <div class="home-font px-6 pt-10 text-5xl mb-6 text-center"> READY TO FIGHT ?</div>
                  <div class="px-5 py-5 flex items-center ">
                    <img class="h-full" src="/videos/green-pong.gif">
                  </div>
                </div>
                <div class="term-box flex" >
                  <Auth2FAForm v-if="auth.need2FA" />
                  <AuthLoginForm v-else-if="auth.activeForm === 'login'" />
                  <AuthSignUpForm v-else-if="auth.activeForm === 'signup'" />
                </div>
            </div>
        </div>
    </div>
    <div v-else-if="auth.isSetup == false" class="flex items-center justify-center h-full w-full video-container">
        <div class="z-0 h-full w-full video-container">
            <video class="top-0 bottom-0 left-0 right-0" autoplay loop muted preload="auto">
              <source src="/videos/grid.mp4" type="video/mp4">
            </video>
        </div>
        <div class="z-1 term-box h-700px w-800px py-10 px-5">
            <div class="home-font font-bold text-4xl text-center pb-2" style="letter-spacing: 1px;">Setup your account</div>
            <div class="home-font font-bold text-2xl pt-8 pb-2" style="letter-spacing: 1px;">Choose a username</div>
            <div class="flex flex-col">
                <input type="text" @input="onInput" v-model="auth.session.username" class="term-box px-3 py-2 home-font b-1"/>
            </div>
            <div class="home-font font-bold text-2xl pt-8 mt-4" style="letter-spacing: 1px;">Change your profile picture (optional)</div>
            <div class="flex justify-center">
                <img :src="avatarPreview" class="mt-4 h-200px w-200px max-w-200px b-2 term-box p-.5" />
            </div>
            <div class="flex items-center pt-8">
                <!-- <input type="file" accept="image/jpeg,image/png" ref="fileInput"  @change="onFileSelected"  /> -->
                <input type="file" accept="image/jpeg,image/png" name="file" id="file" class="inputfile" ref="fileInput"  @change="onFileSelected" />
                <label for="file" class="home-font home-button layers hero glitch ml-3" style="letter-spacing : 1px;" data-text="Choose a file">Choose a file</label>
                <div class="i-material-symbols:file-copy-outline-sharp ml-2 home-font"></div>
            </div>
            <div>
                <button class="home-button home-font text-4xl layers hero glitch w-full transition duration-300 px-4 py-2 mt-4" style="letter-spacing : 2px;" data-text="SETUP" @click="auth.setup({
                    username: auth.session.username,
                    avatar: avatarFile
                })">SETUP</button>
            </div>
        </div>
    </div>
    <div v-else class="flex flex-col h-full relative">
      <Header />
      <div class="flex h-full">
        <!--<aside class="w-240px bg-blue h-full">Sidebar left</aside>-->
        <section class="flex-1 w-full">
          <slot />
        </section>
        <!--<aside class="w-240px bg-green h-full">Sidebar right</aside>-->
      </div>
      <div v-if="game.tmpGame.gameId" class="bg-black/70% backdrop-blur fixed w-full h-full flex justify-center items-center flex-col">
        
        <div v-if="game.tmpGame.origin != auth.session.id">
            <div>@{{ game.tmpGame.originUsername }} has challenged you to a game of Pong!</div>
            <div class="flex gap-2">Will auto decline in : <Timer :time="game.tmpGame.expiration"/></div>
            <div class="flex items-center gap-5 justify-center">
                <button class="bg-green-500 hover:bg-green-600 rounded-lg px-4 py-2 mt-4" @click="game.acceptChallenge(game.tmpGame.gameId)">Accept</button>
                <button class="bg-red-500 hover:bg-red-600 rounded-lg px-4 py-2 mt-4" @click="game.declineChallenge(game.tmpGame.gameId)">Decline</button>
            </div>
        </div>
        <div v-if="game.tmpGame.origin == auth.session.id">
            <div>You have challenged @{{ game.tmpGame.destUsername }} to a game of Pong!</div>
            <div class="flex gap-2">Will auto cancel in : <Timer :time="game.tmpGame.expiration"/></div>
            <div class="flex items-center gap-5 justify-center">
                <button class="bg-red-500 hover:bg-red-600 rounded-lg px-4 py-2 mt-4" @click="game.declineChallenge(game.tmpGame.gameId)">Cancel</button>
            </div>
        </div>
      </div>
        <!-- <ChatTriggerButton v-if="!$route.name?.startsWith('chat')" /> -->
      <!--<ChatModule />-->
    </div>
    <notifications position="bottom center" :pauseOnHover="true" />
  </main>
</template>
<style scoped>
.vue-notification-group {
  z-index: 10000;
  z-index: 99999;
  bottom: 15px !important;
}
.inputfile {
	width: 0.1px;
	height: 0.1px;
	opacity: 0;
	overflow: hidden;
	position: absolute;
	z-index: -1;
}

.inputfile + label {
    font-size: 1.25em;
    font-weight: 700;
    display: inline-block;
    text-align : center;
}
</style>
