<template>
    <!-- Matchmaking windows -->
    <!-- Loading animation-->
    <div v-if="stateProps.showLoader.value" class="w-50">
        <div class="bg-zinc-700 rounded py-4 px-2">
            <div v-if="!stateProps.showMatchmakingError.value">
                <div class="flex justify-center mx-auto">
                    <div class="animate-bounce h-[16px] w-[16px] bg-zinc-200 rounded-full" v-if="stateProps.showLoader.value"></div>
                </div>
                <div class="bg-zinc-200 h-1 w-10 m-2 mx-auto rounded"></div>
                <p class="text-xs text-zinc-400 text-center">Waiting for an opponent...</p>
                <p class="text-xs text-zinc-400 text-center">{{ stateProps.timeElapsed.value > 9? '00:' : '00:0' }}{{ stateProps.timeElapsed.value }}</p>
            </div>
            <div v-else class="flex justify-center">
                <p class="text-xs text-zinc-200 text-center">{{ stateProps.MatchmakingError.value }}</p>
            </div>
        </div>
        <div class="flex justify-center">
            <div @click="cancelMatch" v-if="stateProps.showCancelButton.value" class="bg-zinc-600 w-60 hover:bg-zinc-700 px-2 py-1 m-2 cursor-pointer " style="font-family : terminal;>
                <p class="text-zinc-200 text-center">
                    Cancel
                </p> 
            </div>
        </div>
    </div>
    <!-- Accept match window-->
    <div v-if="stateProps.showMatchFound.value" @click="acceptMatch" :class="{'bg-zinc-700 shadow-lg hover:bg-zinc-700 w-140 h-70 cursor-pointer flex flex-col justify-center' : stateProps.matchAccepted.value === true,
                                                                              'bg-zinc-600 shadow-lg hover:bg-zinc-700 w-140 h-70 cursor-pointer  flex flex-col justify-center' : stateProps.matchAccepted.value === false} " style="font-family : terminal;">
        <p class="text-zinc-200 mt-4 ml-4 mr-4 mb-1 text-5xl font-bold text-center">
            {{ stateProps.matchAccepted.value ? 'Accepted !' : 'Match found !' }}
        </p>
        <p v-if="stateProps.matchAccepted.value === true" class="text-zinc-400 text-sm text-center">
            Waiting for {{ stateProps.opponentProfile.value.username }}...
        </p>
        <div class="flex mt-1 justify-center">
            <div class="flex">
                <div class="flex justify-center">
                    <div class="flex-col flex justify-center">
                        <p class="text-lg text-center text-zinc-200" >{{ auth.session.username }}</p>
                        <p class="text-xs text-center text-zinc-400" >W/L : 10-3</p>
                        <p class="text-xs text-center text-zinc-400" >Elo : 1230</p>
                    </div>
                </div>
                <img :src="auth.session.avatar" class="w-30 h-30 m-2 border-8 border-zinc-100 rounded-full" />
            </div>
            <div class="flex flex-col justify-center">
                <p class="text-zinc-200 ml-5 mr-5 text-7xl font-bold text-center">
                    VS
                </p>
            </div>
            <div class="flex">
                <img :src="stateProps.opponentProfile.value.avatar" class="w-30 h-30 m-2 border-8 border-zinc-100 rounded-full" />
                <div class="flex justify-center">
                    <div class="flex-col flex justify-center">
                        <p class="text-lg text-center text-zinc-200" >{{ stateProps.opponentProfile.value.username }}</p>
                        <p class="text-xs text-center text-zinc-400" >W/L : 10-3</p>
                        <p class="text-xs text-center text-zinc-400" >Elo : 1230</p>
                    </div>
                </div>
            </div>
        </div>
        <p class="text-2xl font-bold text-zinc-200 mb-4 mt-4 text-center">
            {{ stateProps.timeElapsed.value }}
        </p>
    </div>
    <!-- Decline button -->
    <div v-if="stateProps.showMatchFound.value" @click="declineMatch" class="bg-zinc-600 w-40 hover:bg-zinc-700 px-2 py-1 m-2 cursor-pointer" style="font-family : terminal;">
        <p class="text-zinc-200 text-center">
            Decline
        </p>
    </div>
</template>

<script setup lang="ts">
    const auth = useAuth()
    const client = useClient()
    const socket = useSocket()

    const cancelMatch = async () => {
        stateProps.cancelMatch.value = true;
    }

    const acceptMatch = () => {
        stateProps.matchAccepted.value = true;
        socket.emit('matchmakingConfirm', {
            player: auth.session.username, 
            confirm: 'accept',
        })
    }

    const declineMatch = () => {
        stateProps.matchDeclined.value = true;
        socket.emit('matchmakingConfirm', {
            player: auth.session.username,
            confirm: 'decline',
        })
    }

    const { stateProps } = defineProps<{
        stateProps: any;
    }>();
</script>