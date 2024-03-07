import slugify from "slugify";
import { Socket } from "socket.io-client";

interface Message {
  id: number;
  content: string;
  from: number;
  timestamp: Date;
}

interface User {
  id: number;
  username: string;
  avatar: string;
  stats: {
    elo: number;
    victories: number;
    defeats: number;
  };
  isOnline: boolean;
}

interface Channel {
  id: number;
  name: string;
  description: string;
  messages: Message[];
  users: User[];
  content: string;
}

interface PrivateChannel {
  id: number;
  messages: Message[];
  users: User[];
  content: string;
}

export class WrappedConversation {
  socket: any;
  chat: any;
  messages: Message[]
  constructor(public  conversation: Conversation) {
    this.socket = useSocket();
    this.chat = useChat();
    this.messages = []
    this.init();
  }

  update(conversation: Conversation) {
    this.conversation = conversation;
    this.syncMessages();
  }

  leave(cb?: Function) {
    this.socket.emit(
      "conversations:leave",
      { channelId: this.channelId },
      (answer) => {
        if (typeof cb === "function") {
          cb(answer);
        }
      }
    );
  }

  async init() {
    // get messages
    this.syncMessages()
    // get users
  }

  sync() {
    this.socket.emit("conversations:sync", { channelId: this.channelId });
  }

  kick(userId) {
    this.socket.emit("conversations:kick", {userId, channelId: this.channelId})
  }
  mute(userId, duration) {

    if (duration === null) {
        duration = prompt("Mute for how long ? (in seconds) (default to 60)");
        duration = parseInt(String(duration) || "60");
    }
    this.socket.emit("conversations:mute", {userId, channelId: this.channelId, duration})
  }
  ban(userId, duration) {
    if (duration === null) {
        duration = prompt("Ban for how long ? (in seconds) (default to 60)");
        duration = parseInt(String(duration) || "60");
    }

    this.socket.emit("conversations:ban", {userId, channelId: this.channelId, duration})
  }

  setAdmin(userId, state) {
    this.socket.emit("conversations:admin", {userId, channelId: this.channelId, state})
  }

  isUserMuted(userId) {
    let mutedUntil = this.users.find((u) => u.userId == userId)?.mutedUntil;
    return mutedUntil !== null && new Date(mutedUntil) > new Date();
  }
  isUserBanned(userId) {
    let bannedUntil = this.users.find((u) => u.userId == userId)?.bannedUntil;
    return bannedUntil !== null && new Date(bannedUntil) > new Date();
  }
  syncMessages() {
    this.socket.emit(
      `conversations:messages`,
      { channelId: this.channelId },
      (answer) => {
        this.messages = answer.messages ? answer.messages.filter((m) => !this.chat.blockedUsers.includes(m.from)) : [];
      }
    );
  }
  saveSettings() {
    this.socket.emit(
      `conversations:update`,
      {
        channelId: this.channelId,
        name: this.channel.name,
        description: this.channel.description,
        type: this.channel.type,
        password:
          this.channel.type == "PROTECTED" ? this.channel.password : undefined,
      },
      (answer) => {
      }
    );
  }

  getAvatar(userId: number) {
    return this.getUser(userId)?.avatar || "/avatars/default.jpg";
  }
  onNewMessage(message: Message) {
    this.messages.push(message);
  }

  async syncStatus() {
    this.conversation.channel.users = this.conversation.channel.users.map((u) => {
        let status = this.chat.status[u.userId];
        if (status) {
            u.online = status == 'online';
        }
        return u;
    })
    }

  getUser(userId: number) {
    return this.users.find((u) => u.userId == userId)?.user;
  }

  searchUser(search: string) {
    return this.users.filter((u) =>
      u.user.username.toLowerCase().includes(search.toLowerCase())
    );
  }

  write() {

    this.socket.emit(
      `conversations:message`,
      { channelId: this.channelId, message: this.message },
      (answer) => {
        //this.conversation.channel.messages.push(message)
      }
    );
    this.message = "";
  }

  get channelId() {
    return this.conversation.channelId;
  }

  get isChannel() {
    return this.conversation.channel.type != "DM";
  }

  get isDM() {
    return this.conversation.channel.type == "DM";
  }

  get isPublic() {
    return this.conversation.channel.type == "PUBLIC";
  }

  get isPrivate() {
    return this.conversation.channel.type == "PRIVATE";
  }

  get isProtected() {
    return this.conversation.channel.type == "PROTECTED";
  }

  get channel() {
    return this.conversation.channel;
  }

  get role() {
    return this.conversation.role;
  }

  get mutedUntil() {
    return this.conversation.mutedUntil;
  }

  get bannedUntil() {
    return this.conversation.bannedUntil;
  }

  get users() {
    return this.conversation.channel.users;
  }

  get online() {
    return this.conversation.channel.users.filter((u) => u.online);
  }

  get user() {
    return this.conversation.user;
  }

  get message() {
    return this.conversation.message;
  }

  set message(value) {
    this.conversation.message = value;
  }

  get recipient() {
    if (this.isDM) {
      return this.users.find((u) => u.userId != this.user.id);
    }
  }

  get isOwner() {
    return this.role === "OWNER";
  }

  get isAdmin() {
    return this.role === "ADMIN" || this.isOwner;
  }

  isRole(userId:number, role: string) {
    let user = this.users.find((u) => u.userId == userId);
    return user && user.role == role;
  }
  getRole(userId:number) {
    let user = this.users.find((u) => u.userId == userId);
    return user?.role
  }

  get isMuted() {
    return this.mutedUntil !== null && new Date(this.mutedUntil) > new Date();
  }

  get isBanned() {
    return this.bannedUntil !== null && new Date(this.bannedUntil) > new Date();
  }
}

class ConversationManager {
    conversations: Map<Number, WrappedConversation> = new Map();
    socket: any;
    isSetup: boolean;
    active?: WrappedConversation;
    chat : any;
    constructor() {
        this.socket = useSocket();
        this.chat = useChat();
        this.isSetup = false;
        this.active = undefined;
    }

    init() {
        this.socket.emit("conversations:list");
        this.socket.on("conversations:list-reload", (answer) => this.socket.emit("conversations:list"));
        this.socket.on("conversations:list", (answer) => this.onConversationsList(answer));
        this.socket.on("conversations:sync", (answer) => this.onConversationSync(answer));
        this.socket.on("conversations:sync-reload", (answer) => this.socket.emit("conversations:sync", { channelId: answer.channelId }));
        this.socket.on("conversations:leave", (answer) => this.onConversationLeave(answer));
        this.socket.on("conversations:left", (answer) => this.onConversationLeft(answer));
        this.socket.on("conversations:join", (answer) => this.onConversationJoin(answer));
        this.socket.on("conversations:joined", (answer) => this.onConversationJoined(answer));
        this.socket.on("conversations:message", (answer) => this.onConversationMessage(answer));
        this.socket.emit("conversations:friends", {}, (answer) => {
        });
    }

    onConversationsList({ conversations }: { conversations: Conversation[] }) {
        let ids = conversations.map((c) => c.channelId);
        conversations.forEach((c) => this.initOrUpdateConversation(c));
        this.conversations.forEach((c, id) => {
            if (!ids.includes(id)) {
                if (this.active == c) {
                    this.setActive(undefined);
                }
                this.conversations.delete(id);
            }
        });
        this.isSetup = true;
    }

    onConversationSync({conversation, show = false} : {conversation: Conversation, show: boolean}) {
        this.initOrUpdateConversation(conversation, show);
    }
    onConversationLeave({channelId} : {channelId: number}) {

        if (this.active?.channelId == channelId) {
            this.setActive(undefined);
        }
        this.conversations.delete(channelId);
    }
    onConversationLeft({channelId, userId} : {channelId: number, userId: number}) {
        let conversation = this.getConversation(channelId);
        if (conversation) {
            conversation.conversation.channel.users = conversation.conversation.channel.users.filter((u) => u.userId != userId);
        }
    }
    async onConversationJoin({channelId} : {channelId: number}) {
        let conversation = this.getConversation(channelId);
        while (!conversation) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            await nextTick();
            conversation = this.getConversation(channelId);
        }

        this.searchChannel(this.chat.searchChannelQuery) 
    }

    onConversationJoined({channelId, userId} : {channelId: number, userId: number}) {
        let conversation = this.getConversation(channelId);
        if (conversation) {
            conversation.sync()
        }
    }

    onConversationMessage({channelId, ...message}) {
        let conversation = this.getConversation(channelId);
        if (conversation) {
            if (!this.chat.blockedUsers.includes(message.from)){
                conversation.onNewMessage(message);
            }
        }
    }

    searchChannel(query: string) {
        if (!query) return;
        this.socket.emit("conversations:search", { query }, (answer) => {
            this.chat.searchChannelResults = answer;
        });
    }
    
    getConversation(channelId: number) {
        return this.conversations.get(channelId);
    }

    get channels() {
        return Array.from(this.conversations.values()).filter((c) => c.isChannel)
        .sort((a, b) => {
            // by id
            if (a.channelId < b.channelId) return 1;
            if (a.channelId > b.channelId) return -1;
            return 0;  
        });
    }

    get dms() {
        return Array.from(this.conversations.values()).filter((c) => c.isDM);
    }
    
    initOrUpdateConversation(conversation: Conversation, show = false) {
        let exists = this.getConversation(conversation.channelId);
        if (exists) {
            exists.update(conversation);
        } else {
            this.conversations.set(conversation.channelId, new WrappedConversation(conversation));
        }

        if (show) {
            this.setActive(this.getConversation(conversation.channelId));
        }
    }

    setActive(conversation?: WrappedConversation) {
        this.active = conversation;
    }

    joinConversation({ channelId, password }) {
        this.socket.emit("conversations:join", {
            channelId,
            password,
        });
    }

    leaveConversation({ channelId, stay = false }) {
        if (!channelId) return;
        this.socket.emit("conversations:leave", {
            channelId,
        }, () => {
            this.searchChannel(this.chat.searchChannelQuery)
            this.setActive(undefined);
            if (stay) return;
            navigateTo({
                name: "chat",
            });
        });
    }

    createConversation(conversationInfo) {
        this.socket.emit("conversations:create", conversationInfo, async ({channelId}) => {
            
        });
    }
    
}


export const useChat = defineStore("chat", () => {
  const socket = useSocket();
  const manager = ref(new ConversationManager());

  const visible = ref(false);
  const setVisible = (state: boolean) => (visible.value = state === true);

  const view = ref("home");
  const setView = (_view: string) => (view.value = _view);

  const onNotification = ({
    type,
    message,
  }: {
    type?: string;
    message: string;
  }) => {
    useNotification().notify({
      text: message,
      type: type,
    });
  };

  const conversations = ref<Map<Number, WrappedConversation>>(new Map());
  const activeConversation = ref<WrappedConversation>();
  const showConversation = (conversation: WrappedConversation) => {
    currentMode.value = 'chat'
    activeConversation.value = conversation;
  };
  const hideConversation = () => {
    activeConversation.value = undefined;
    setView("home");
  };
  const isActiveConversation = (conversation: WrappedConversation) =>
    activeConversation.value === conversation;

  const joinConversation = ({ channelId, password }) => {
    socket.emit("conversations:join", {
      channelId,
      password,
    });
    setTimeout(() => {
        searchChannel()
    }, 100)
  };

  const createConversation = async (conversationInfo) => {
    socket.emit("conversations:create", conversationInfo, async (conv) => {
        await navigateTo({
            name: "chat-conversation",
            params: {
                conversation: conv.channelId,
            },
        })
    });
  };

  const searchChannelQuery = ref('');
  const searchChannelResults = ref([]);
  const searchChannel = async () => {
    socket.emit("conversations:search", { query: searchChannelQuery.value }, (answer) => {
      searchChannelResults.value = answer;
    });
  };
  const searchFriendResults = ref([]);
  const searchFriend = async (query: string) => {
    socket.emit("conversations:search-friend", { query }, (answer) => {
      searchFriendResults.value = answer;
    });
  };

  const addFriend = async (userId) => {
    socket.emit("conversations:friend-request", {userId});
  };
  const acceptFriend = async (userId) => {
    socket.emit("conversations:friend-accept", {userId});
  };
  const declineFriend = async (userId) => {
    socket.emit("conversations:friend-decline", {userId});
  };
  const challenge = async (userId) => {
  };
  const kick = async (userId, channelId) => {
    socket.emit("conversations:kick", {userId, channelId})
  };
  const mute = async (userId, channelId) => {
    let duration = prompt("Mute for how long ? (in seconds) (default to 60)");
    duration = parseInt(String(duration) || "60");
    socket.emit("conversations:mute", { userId, channelId, duration });
  };
  const ban = async (userId, channelId) => {
  };
  const setAdmin = async (userId, channelId, state) => {
  };

  const status = ref({});
  const blockedUsers = ref([]);
  const friends = ref([]);

  const hasFriend = (userId) => {
    return friends.value.find((f) => f.id == userId);
  }

  const blockUser = async (userId, status) => {
    socket.emit("conversations:block", {userId, status}, (answer) => {
    //  blockedUsers.value = answer;
        socket.emit("conversations:blocked");
    });
  }

  const init = async () => {
    const { notify } = useNotification();
    const route = useRouter();
    socket.on("notification", onNotification);

    socket.on("status", async (data) => {
        status.value = data
        await nextTick()
        setTimeout(() => {
            conversations.value.forEach((c) => {
                c.syncStatus()
            })
        }, 100)
    });

    socket.on("conversations:friends", (_friendsUsers) => {
        friends.value = _friendsUsers;
    });
    socket.on("conversations:friend-request", ({}) => {
        notify({
            text: "You have a new friend request",
            type: "info",
        });
        socket.emit("conversations:friends")
        socket.emit("conversations:list")
    });
    socket.on("conversations:friend-accept", ({}) => {
        socket.emit("conversations:friends")
        socket.emit("conversations:list")
    });
    socket.on("conversations:friend-decline", ({}) => {
        socket.emit("conversations:friends")
        socket.emit("conversations:list")
    });
    socket.on("conversations:blocked", (_blockedUsers) => {
        blockedUsers.value = _blockedUsers;
    });
    socket.emit("conversations:blocked");
    await manager.value.init();

  };

  const showProfile = (user: ChatProfile) => {
    currentProfile.value = user;
    //setView('profile')
  };

  const currentProfile = ref<ChatProfile|null>();
  const compactMode = ref(false)
  const currentMode = ref('channels')

  return {
    init,
    visible,
    setVisible,

    view,
    setView,

    conversations,
    showConversation,
    searchChannel,
    searchChannelQuery,
    searchChannelResults,
    hideConversation,
    activeConversation,
    isActiveConversation,
    joinConversation,

    createConversation,
    currentProfile,
    showProfile,

    searchFriendResults,
    searchFriend,
    addFriend,
    acceptFriend,
    declineFriend,
    challenge,
    blockUser,
    blockedUsers,
    status,
    friends,
    hasFriend,

    kick,
    mute,
    ban,
    setAdmin,
    compactMode,
    currentMode,

    manager,

    //current,
    //currentProfile,
    //compactMode,
    //currentMode,
    //searchTextChannel,
    //searchChannel,
    //searchChannelLoading,
    //searchChannelResults,
    //newChannel,
    //updateChannel,
    //createChannel,
    //leaveChannel,
    //joinChannel,
    //onJoinChannel,
    //channels,
    //getChannelUsers,
    //getChannelOnlineUsers,
    //getUserFromId,
    //conversation,
    //setConversation,
    //sendMessage,
    //dms,
  };
});



export type WrappedConversationType = typeof WrappedConversation