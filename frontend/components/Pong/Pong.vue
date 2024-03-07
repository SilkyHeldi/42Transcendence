<template>
    <div class="flex-col " v-show="stateProps.showPong.value">
        <div class="flex justify-between p-2 mx-4">
            <div class="text-lg text-zinc-100">
                {{ gameProps.Player1.value.name }} - <b> {{ gameProps.Player1.value.score }} </b>
            </div>
            <div class="text-lg text-zinc-100">
                <b> {{ gameProps.Player2.value.score }} </b> - {{ gameProps.Player2.value.name }}
            </div>
        </div>

        <div class="">
            <canvas tabindex="0" @keydown.down="gameProps.player1MoveDown" @keydown.up="gameProps.player1MoveUp" class="bg-zinc-300 focus-outline-none rounded-lg cursor-crosshair" id="canvas"></canvas>
        </div>
    </div>
</template>

<script setup lang="ts">
    const auth = useAuth()
    const client = useClient()
    const socket = useSocket()

    const { stateProps, gameProps } = defineProps<{
        stateProps: any;
        gameProps: any;
    }>();

    const hasRefresh = async() => {

        const userExists: any = await useRequest(`/matchmaking/getUserInGameFromQueue?playerUsername=${auth.session.username}`, {
            method: 'GET',
        })

        //check if the user is in a queue with status "in game"
        if (userExists.data.value.profile !== undefined) {
            auth.refresh = true
        }
        else {
            // console.log('not in game')
            const userInQueue: any = await useRequest(`/matchmaking/getUserFromQueue?playerUsername=${auth.session.username}`, {
                method: 'GET',
            })
            if (userInQueue.data.value.profile !== undefined) {
                // console.log('in queue')
                console.log('hasRefresh: ', auth.session.username,' is not in game. Removing from game queue...')
                await client.game.removeFromGameQueue(auth.session.username)
            }
            else
            {
                console.log('hasRefresh: ', auth.session.username,' is not in game or in queue.')
            }

        }
    }

    onMounted( async () => {
        stateProps.canvas.value = document.getElementById("canvas");
        stateProps.context.value = stateProps.canvas.value.getContext("2d");
 
        stateProps.canvas.value.width = 800;
        stateProps.canvas.value.height = 600;

        stateProps.context.value.fillStyle = "blue";
        stateProps.context.value.fillRect(gameProps.Player1.value.x, gameProps.Player1.value.y, gameProps.Player1.value.width, gameProps.Player1.value.height)
        stateProps.context.value.fillRect(gameProps.Player2.value.x, gameProps.Player2.value.y, gameProps.Player2.value.width, gameProps.Player2.value.height)
        stateProps.context.value.fillRect(gameProps.Ball.value.x, gameProps.Ball.value.y, gameProps.Ball.value.width, gameProps.Ball.value.height)

        socket.on('playerMovementResponse', (data: any) => {
            if (data.player === stateProps.opponentProfile.value.username)
            {
                if (data.move === 'moveUp')
                    gameProps.player2MoveUp();
                else
                    gameProps.player2MoveDown();
            }
        });
        
        socket.on('challengePlayerResponse', async (data: any) => {
            if (data.challenger === stateProps.opponentProfile.value.username)
            {
                if (stateProps.gameLobbyId.value !== data.lobbyId)
                    await client.game.deleteLobbyById(stateProps.gameLobbyId.value)
                stateProps.gameLobbyId.value = data.lobbyId
                console.log('socketChallengePlayerResponse: Received challenge socket from ', data.challenger, ' with lobby ', data.lobbyId)
            }
        })

        socket.on('matchmakingConfirmResponse', (data: any) => {
            if (data.player === stateProps.opponentProfile.value.username)
            {
                if (data.confirm === 'decline')
                    stateProps.opponentDeclined.value = true;
                if (data.confirm === 'accept')
                    stateProps.opponentAccepted.value = true;
            }
        });

        socket.on('abortMatchResponse', async (data: any) => {
            console.log('socketAbortMatchResponse: Received abort match socket from ', data.player)

            if ((auth.session.username === gameProps.Player1.value.name && data.player === gameProps.Player2.value.name) || (auth.session.username === gameProps.Player2.value.name && data.player === gameProps.Player1.value.name))
            {
                console.log('socketAbortMatchResponse: Aborting match between ', auth.session.username, ' and ', data.player, ' in lobby ', stateProps.gameLobbyId.value)
                gameProps.resetGame();
                cancelAnimationFrame(stateProps.animationFrameId.value);
                stateProps.showPong.value = false;
                stateProps.showPlayButton.value = true;
                stateProps.resetMatchmakingWindow()
                await client.game.deleteLobbyById(stateProps.gameLobbyId.value)
            }

            console.log('socketAbortMatchResponse: Resetting chat status to ONLINE')
            socket.emit('chatStatus', {
                sender: auth.session.username,
                text: 'ONLINE',
            });
        });

        await hasRefresh();
        if (auth.refresh === true) {
            stateProps.showPong.value = true;
            stateProps.showPlayButton.value = true;
            auth.refresh = false;
            gameProps.refreshGameSession();
            gameProps.gameLoop();    
        }

    });
</script>
