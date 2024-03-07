import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { useAuth } from './auth'
import { useFetch } from '#app'

// remove later
interface AppChannel {

    getAllChannels: () => any // get all channels
    getChannels: () => any // get channels
    createChannel: () => any // create channel
    leaveChannel: () => any // leave channel
    getOnlineUsers: () => any // get online users
    getUserCount: () => any // get user count
    refresh: () => any // refresh users
    allChannelArray: globalThis.Ref<any[]> // all channel array
}

export const useChannel = defineStore('channel', () => {
    const channel: AppChannel = {} as AppChannel
    const authStore = useAuth()
    const client = useClient()
    const socket = useSocket()
    const friend = useFriend()

    channel.getAllChannels = async () => {
        const { data, error } = await useRequest('/socket/getallchannels', {
            method: 'GET',
        })

        if (error.value?.statusCode) {
            authStore.error = error.value?.statusMessage as string
            return null
        }

        return data.value
    }

    channel.getChannels = async () => {
        const { data, error } = await useRequest('/socket/getchannels', {
            method: 'POST',
            body: {
                userId: authStore.session.id,
            },
        })

        if (error.value?.statusCode) {
            authStore.error = error.value?.statusMessage as string
            return null
        }

        return data.value
    }

    channel.createChannel = async () => {
        const name = prompt('Enter channel name')
        if (name === null || name === '')
            return null

        if (name.length > 20) {
            alert('Channel name too long')
            return null
        }

        const { data, error } = await useRequest('/socket/createchannel', {
            method: 'POST',
            body: {
                name,
            },
        })
        if (error.value?.statusCode || data.value === null) {
            alert('Channel already exists')
            authStore.error = error.value?.statusMessage as string
            return null
        }
        if (data.value !== null && data.value !== undefined) {
            client.chat.messages = []
            client.chat.chatState.select = 'CHANNEL'
            client.chat.chatState.receiver.id = data.value.id
            client.chat.chatState.receiver.name = data.value.name
            socket.emit('joinChannel', {
                sender: authStore.session.username,
                receiver: data.value.name,
            })
        }

        channel.refresh()
    }

    channel.leaveChannel = async () => {
        const { data, error } = await useRequest('/socket/leavechannel', {
            method: 'POST',
            body: {
                channelName: client.chat.chatState.receiver.name,
                channelId: client.chat.chatState.receiver.id,
                userId: authStore.session.id,
                userName: authStore.session.username,
            },
        })

        if (data.value === '1') { // if one user has been found and deleted
            socket.emit('leaveChannel', {
                sender: authStore.session.username,
                receiver: client.chat.chatState.receiver.name,
            })
            socket.emit('refresh', { channelId: client.chat.chatState.receiver.id })
            channel.refresh()
            client.chat.chatState.select = 'EMPTY'
            client.chat.chatState.receiver.id = null
            client.chat.chatState.receiver.name = null
            client.chat.messages = []
        }

        if (error.value?.statusCode) {
            authStore.error = error.value?.statusMessage as string
            return null
        }
    }

    channel.getOnlineUsers = async () => {
        if (client.chat.chatState.select !== 'CHANNEL')
            return null

        for (let i = 0; i < client.chat.channelArray.length; i++) {
            if (client.chat.channelArray[i].name === client.chat.chatState.receiver.name)
                return client.chat.channelArray[i].onlineUsers
        }
        return null
    }

    channel.getUserCount = async () => {
        if (client.chat.chatState.select !== 'CHANNEL')
            return null

        for (let i = 0; i < client.chat.channelArray.length; i++) {
            if (client.chat.channelArray[i].name === client.chat.chatState.receiver.name)
                return client.chat.channelArray[i].userCount
        }
        return null
    }

    channel.refresh = async () => {
        client.chat.messages = await client.chat.currentHistory()
        client.chat.usersArray = await friend.getFriends()
        client.chat.channelArray = await channel.getChannels()
        if (client.chat.chatState.select === 'CHANNEL') {
            client.chat.chatState.receiver.onlineUsers = await channel.getOnlineUsers()
            client.chat.chatState.receiver.userCount = await channel.getUserCount()
        }
    }

    return channel
})
