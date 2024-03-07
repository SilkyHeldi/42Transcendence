
export const useGame = defineStore("game", () => {

    const auth = useAuth();
    const socket = useSocket();

    const tmpGame = ref({

    })

    const autoClean = ref(null)
    const isReady = ref(false)
    const isAvailable = ref(false)
    const isFinished = ref(false)
    const endGame = ref({})
    const state = ref({
        ball: { h: 0, w: 0, x: 0, y: 0, vx: 6, vy: 6 },
        left: {
            h: 0,
            w: 0,
            x: 0,
            y: 0,
            user: {
                
            },
            color: '',
            ready: false,
            score: 0,
            userId: 0,
        },
        right: {
            h: 0,
            w: 0,
            x: 0,
            y: 0,
            user: {
                
            },
            color: '',
            ready: false,
            score: 0,
            userId: 0,
        },
        status: 'started',
    })

    const beReady = (gameId) => {
        socket.emit("game:ready", { gameId })
    }



    const init = async () => {
        const { notify } = useNotification();
        const route = useRoute();


        socket.on("game:challenged", async (data) => {
            tmpGame.value = data;
            autoClean.value = setTimeout(() => {
                tmpGame.value = {};
            }, 15000);
        });
        socket.on("game:challenge-declined", async (data) => {
            tmpGame.value = {};
        });
        socket.on("game:challenge-accepted", async (data) => {
            tmpGame.value = {};
        });

        socket.on("game:start", async (data) => {
            console.log("game:start")
            navigateTo({
                name: "game-game",
                params: {
                    game: data,
                },
            })
        });
        socket.on("game:state", async (newState) => {
            console.log("game:state")
            state.value = newState;
            if (state.value.status === "finished") {
                isFinished.value = true;
            }
        });
        socket.on("game:ready", async (newState) => {
            console.log("game:ready")
            isReady.value = true;
            isFinished.value = false;

        });
        socket.on("game:finished", async (newState) => {
            console.log("game:finished", newState)
            isFinished.value = true;
            endGame.value = newState
        });

        if (route.params.game) {
            await connect(route.params.game)
        }
    }

    const setPongBG = (color) => {
        localStorage.setItem("pong-bg", color);
    }
    const challenge = async (destUserId) => {
        if (auth.session?.id !== destUserId){
            socket.emit("game:challenge", destUserId);
        }
    }

    const acceptChallenge = (gameId) => {
        socket.emit("game:challenge-accept", { gameId })
    }
    const declineChallenge = (gameId) => {
        socket.emit("game:challenge-decline", { gameId })
    }
    const connect = async (gameId) => {
        socket.emit("game:connect", { gameId })
    }

    const moveUp = (gameId) => {
        socket.emit("game:moveup", {gameId})
    }
    const moveDown = (gameId) => {
        socket.emit("game:movedown", {gameId})
    }

    const afk = (gameId) => {
        console.log("afk", gameId)
        socket.emit("game:afk", {gameId})
    }
    const quit = (gameId) => {
        console.log("afk", gameId)
        socket.emit("game:quit", {gameId})
    }

    const queue = () => {
        socket.emit("game:queue")
    }
    return {
        init,
        state,
        beReady,
        challenge,
        tmpGame,
        acceptChallenge,
        declineChallenge,
        connect,
        isReady,
        moveUp,
        moveDown,
        afk,
        quit,
        isFinished,
        endGame,
        queue,
        setPongBG,
    }
})