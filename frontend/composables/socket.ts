import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

export const useSocket = defineStore('socket', () => {
    const socket = ref()
    const auth = useAuth()
	const chat = useChat()
    const game = useGame()
    const events = ref([])

    const disconnect = async () => {
        if (auth.logged === true)
        {
            socket.value.disconnect()
        }
    }

    const connect = async () => {
        const _socket = io(useRuntimeConfig().public.backendURL, {
            withCredentials: true,
        })
        _socket.on('connect', () => {
            console.log('Socket connected')
			chat.init()
			game.init()
        })
        _socket.on('disconnect', () => {
            console.log('Socket disconnected')
            events.value.forEach(({event, callback}) => {
                _socket.off(event, callback)
            })
        })
        socket.value = _socket
    }

    const emit = (event: string, data?: any, answer? :any) => {
        if (answer === undefined)
            return socket.value.emit(event, data)
        else
            return socket.value.emit(event, data, answer)
    }

    const on = (event: string, callback: (data: any) => void) => {
        socket.value.on(event, callback)
        events.value.push({event, callback})
    }

    return {
        socket,
        disconnect,
        connect,
        emit,
        on,
    }
})
