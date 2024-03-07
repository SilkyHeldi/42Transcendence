<script setup lang="ts">
const auth = useAuth()
const socket = useSocket()
const client = useClient()

const { stateProps, gameProps } = defineProps<{
    stateProps: any,
    gameProps: any
}>();

const abortMatch = () => {
    stateProps.matchDeclined.value = true;
    socket.emit('abortMatch', {
        player: auth.session.username,
    })
}

const startGame = async () => {
    stateProps.showEndGame.value = false;
    if (stateProps.showPong.value === false) {
        
        const ret = await stateProps.waitForMatch();
        if (ret === null)
        {
            stateProps.showLoader.value = false;
            await client.game.removeFromGameQueue(auth.session.username)
            stateProps.resetMatchmakingWindow()
            stateProps.showPlayButton.value = true;
            return ;
        }

        await stateProps.waitForConfirm();
        if (stateProps.matchAccepted.value === true && stateProps.opponentAccepted.value === true)
        {
            await client.game.getNormalQueuePlayers();
            stateProps.showPong.value = true;
            stateProps.showPlayButton.value = true;
            stateProps.resetMatchmakingWindow()
            const ret = gameProps.refreshGameSession();
            gameProps.gameLoop();
            await client.game.setQueueStatus(auth.session.username, 'in-game')
        }
        else
        {
            stateProps.showPlayButton.value = true;
            stateProps.resetMatchmakingWindow()
            await client.game.removeFromGameQueue(auth.session.username)
        }
    }
    else 
    {
        abortMatch();
        gameProps.resetGame();
        cancelAnimationFrame(stateProps.animationFrameId.value);
        
        await client.game.removeFromGameQueue(gameProps.Player1.value.name)
        await client.game.removeFromGameQueue(gameProps.Player2.value.name)
        
        await client.game.deleteLobbyById(stateProps.gameLobbyId.value)
        
        stateProps.showPong.value = false;
        stateProps.showPlayButton.value = true;
        stateProps.resetMatchmakingWindow()

        socket.emit('chatStatus', {
            sender: auth.session.username,
            text: 'ONLINE',
        });
        gameProps.gameStatus.value = '';
    }
}
onBeforeUnmount(() => {
        socket.disconnect()
})

onMounted(async () => {
    await socket.connect()
    await auth.refreshSession()
})

</script>

<template>
    <div class="h-62px">
        <div class="container mx-auto justify-between h-full flex items-center px-5">
            <div>
                Ft_transcendence
            </div>
            <div v-if="auth.logged === true" class="flex gap-5 items-center">
                <button @click="startGame()" v-if="stateProps.showPlayButton.value" class="bg-zinc-700 px-3 py-1 m-1 text-zinc-200 rounded-lg">
                    {{ stateProps.showPong.value ? 'Quit' : 'Play' }} 
                </button>
                <div>
                    <div  class="b-1 rounded bg-blue-500 px-2 py-1 b-blue-700 cursor-pointer hover:bg-blue-600" @click="auth.logout">Logout</div>
                </div>
                <div>
                    <div  class="b-1 rounded bg-blue-500 px-2 py-1 b-blue-700 cursor-pointer hover:bg-blue-600" @click="auth.showUserForm = true">Profile</div>
                </div>
            </div>
            <div v-if="auth.logged === false">
                <div  class="b-1 rounded bg-blue-500 px-2 py-1 b-blue-700 cursor-pointer hover:bg-blue-600" @click="auth.showForm = true">Login</div>
            </div>
        </div>
    </div>
</template>