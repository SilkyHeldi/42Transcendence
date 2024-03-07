// Le client est un objet qui contient toutes les fonctions de l'app.
// Il peut être utilisé partout dans la partie front pour interagir avec les différents composants.
// Vous pouvez ajouter des fonctions ici pour les rendre accessibles partout dans l'app, mais ne supprimez pas les fonctions existantes si il y a encore des références à celles-ci. (Ctrl + F: client.xxx)
// Cela nous permettra de tous bosser sur le même code sans avoir à se soucier des conflits de merge.
// Merci d'ajouter des commentaires pour expliquer ce que fait chaque fonction ainsi que le typage des paramètres et du retour.
import { defineStore } from 'pinia'
import { RefSymbol } from '@vue/reactivity'
import { useFetch } from '#app'

export const useRequest: typeof useFetch = (path, options = {}) => {
  const config = useRuntimeConfig()
  options.credentials = 'include'
  options.baseURL = config.public.baseURL
  return useFetch(path, options)
}

interface AppClient {

  auth: {
    login: (provider:string, {
      email,
      password,
    }?: {
      email: string
      password: string
    }) => void // login
    authenticateUser: ({
      email,
      password,
    }: {
      email: string
      password: string
    }) => void
    signup: ({
      username,
      email,
      password,
    }: {
      username: string
      email: string
      password: string
    }) => void // login

    update: ({
      username,
      email,
      password,
      newPassword,
      newPasswordConfirmation,
    }: {
      username: string
      email: string
      password: string
      newPassword: string
      newPasswordConfirmation: string
    },) => void // update user data

    onFileSelected: (event: any) => void // upload avatar
    avatarFile: Ref<File | undefined> // avatar file
    loginWithGoogle: () => void // login with google
    login42: () => void // login 42
    logout: () => void // logout
    session: () => any // get user data
    verify2FA: (code: string) => any // verify2FA

    onOff2FA: () => any
    get2FA: () => any
    get2FAQr: () => any

    findByUsername: (mailOrUsername: string) => Promise<any> // get user from mail or username

  }

  friend: {
    profile: () => void // get user profile
    list: () => void // get friends list
    inverselist: () => void
    pendinglist: () => void
    add: (username: string) => void // add friend
    remove: (friendName: string) => void // remove friend
    isJustFriend: (friendName: string) => Promise<string>
    areMutualFriends: (friendName: string) => Promise<string>

    categoryArray: any[]
    categoryName: string
  }

  chat: {
    // Channels
    getOnlineUsers: () => any // get online users
    getAllUsers: () => any // get all users
    getOfflineUsers: () => any // get offline users
    setAdmin: (userId: string, status: boolean) => void // set moderator

    // Admin
    kick: (userId: string) => void // kick user
    ban: (userId: string) => void // ban user
    mute: (userId: string) => void // mute user

    // User
    list: () => void // get channels list
    join: () => void // join channel
    leave: () => void // leave channel
    send: () => void // send message to channel
    sendTo: () => void // send DM to user
    block: () => void // block user
    inviteGame: () => void // invite user to game
    clearChat: (div: any) => void
    scrollToBottom: (div: any) => void
    currentHistory: () => any // { sender: string; text: string; time?: string; avatar?: string; user?: any }[]

    usersArray: globalThis.Ref<any[]>
    channelArray: globalThis.Ref<any[]>
    chatVisible: boolean
    chatMessages: globalThis.Ref<any>
    chatState: { select: string; receiver: any }
    newMessage: string
    messages: any[]
    showUserProfile: boolean
    showAdd: string
  }

  game: {
    getNormalQueuePlayers: () => Promise<any>
    getNumberOfIdlePlayers: () => Promise<number>
    addToGameQueue: (playerUsername: string) => Promise<any>
    removeFromGameQueue: (playerUsername: string) => Promise<any>
    setQueueStatus: (playerUsername: string, queueStatus: string) => Promise<any>
    findAMatch: (playerUsername: string) => Promise<any>
    joinGameLobby: (playerOneId: number, playerTwoId: number) => Promise<any>
    getLobbiesForPlayer: (playerId: number) => Promise<any>
    getLobbyById: (lobbyId: string) => Promise<any>
    deleteLobbyById: (lobbyId: string) => Promise<any>
    getAllLobbies: () => Promise<any>
    create: () => void // create game
  }
}

// client store
export const useClient = defineStore('client', () => {
  const client: AppClient = {} as AppClient
  const authStore = useAuth()
  const config = useRuntimeConfig()

  client.auth = {} as AppClient['auth']


  client.auth.login = async (provider, payload?) => {
    if (provider === '42') {
        const redirect = encodeURIComponent(`${config.public.baseURL}/auth/42/callback`)
        location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${config.public.INTRA_CLIENT_ID}&redirect_uri=${redirect}&response_type=code`
        return
    }
    if (provider === 'credentials') {
        const { data, error } = await useRequest('/auth/login', {
            method: 'POST',
            body: payload,
        })
    }
  }

  client.auth.session = async () => {
    // using $fetch here because nuxt SSR fucks up with cookies
    const data: any = await $fetch(`${useRuntimeConfig().public.baseURL}/auth/session`, {
      method: 'GET',
      credentials: 'include',
    }).catch((x) => {
      return null
    })

    return data
  }

  client.auth.verify2FA =  async (code) => {
    const { data, error } = await useRequest('/auth/2fa', {
        method: 'POST',
        body: {
            code,
        },
    })

    if(data.value?.verified != true)
    {
        authStore.error = "Wrong code !"
    } else {
        authStore.error = ""
        await authStore.refreshSession()
        if(authStore.logged) {
            navigateTo('/')
        }
    }
  }
    client.auth.logout = async () => {
      const { data, error } = await useRequest('/auth/logout', {
        method: 'POST',
      })
    }


  client.auth.signup = async ({
    username,
    email,
    password,
  }) => {
    await $fetch('/auth/signup', {
      method: 'POST',
      baseURL: config.public.baseURL,
      body: {
        username,
        email,
        password,
      },
    })
    .then(async (data) => {
        useNotification().notify({
            text: data.message,
            type: 'success',
        })
        await client.auth.login('credentials', {
          email,
          password,
        })
    })
    .catch((error) => {
        useNotification().notify({
            text: error.data.message,
            type: 'error',
        })
    })
  }

    client.auth.authenticateUser = async ({
                email,
                password,
            }) => {
          }

  return client
})
