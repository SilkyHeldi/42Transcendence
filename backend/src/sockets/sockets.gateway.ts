import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';

import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { Server, Socket } from 'socket.io';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { ChannelService } from '../channel/channel.service';
import { FriendService } from '../friend/friend.service';
import { PongGame } from './PongGame';

import * as crypto from 'crypto';
import { DBService } from 'src/db/db.service';
import { ValidationPipe, UsePipes } from '@nestjs/common';
import { ChannelCreateDTO, ChannelIdDto, UserIdDto } from './dto';

interface Game {
    id: string;
    players: any[];
    state: any;
    date: Date;
}

@WebSocketGateway({
    cors: {
        origin: [
            `http://${process.env.BACKEND_IP}:3000`,
            'http://frontend:3000',
        ],
        credentials: true,
    },
})
export class SocketsGateway {
    clients: object;
    status: object;
    lobby: any[];
    queue: any[];
    tmpGames: any[];
    games: Map<string, PongGame>;
    constructor(
        private authService: AuthService,
        private userService: UsersService,
        private channelService: ChannelService,
        private friendService: FriendService,
        private dbService: DBService,
    ) {
        this.clients = {};
        this.status = {};
        this.queue = [];
        this.games = new Map<string, PongGame>();
        this.tmpGames = [] as any[];
        this.retrieveGames();
    }

    async retrieveGames() {
        const activeGames = await this.dbService.game.findMany({
            where: {
                state: {
                    not: null,
                },
            },
            select: {
                id: true,
                players: true,
                state: true,
                date: true,
            },
        });

        for (const game of activeGames) {
            game.players.forEach((p) => {
                this.subscribeUserToRoom(String(p.id), `game:${game.id}`);
            });

            if (this.games.has(game.id)) {
                continue;
            }
            const gameInstance = await this.createPongGame(game);
            if (gameInstance == false) {
                continue;
            }
            this.games.set(game.id, gameInstance);
        }
    }

    async endGame(gameId: string) {
        //this.games.delete(gameId);

        const game = await this.dbService.game.findUnique({
            where: {
                id: gameId,
            },
            include: {
                players: true,
            },
        });
        if (!game) {
            const gameHistory = await this.dbService.gameHistory.findFirst({
                where: {
                    id: gameId,
                },
                select: {
                    id: true,
                    winnerId: true,
                    winner: {
                        select: {
                            username: true,
                            avatar: true,
                        },
                    },
                    winnerScore: true,
                    loserId: true,
                    loser: {
                        select: {
                            username: true,
                            avatar: true,
                        },
                    },
                    loserScore: true,
                },
            });

            this.server.in(`game:${gameId}`).emit('game:finished', gameHistory);
            return;
        }
        const state = game.state as any;
        const [winner, loser] =
            state.left?.score > state.right?.score
                ? [state.left, state.right]
                : [state.right, state.left];

        const gameHistory = await this.dbService.gameHistory.create({
            data: {
                id: gameId,
                winner: {
                    connect: {
                        id: winner.userId,
                    },
                },

                winnerScore: winner.score,
                loser: {
                    connect: {
                        id: loser.userId,
                    },
                },
                loserScore: loser.score,
            },
            select: {
                id: true,
                winner: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },

                winnerScore: true,
                loser: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
                loserScore: true,
            },
        });

        const removeGame = await this.dbService.game.findUnique({
            where: {
                id: gameId,
            },
            include: {
                players: true,
            },
        });

        //// delete game
        await this.dbService.game.delete({
            where: {
                id: removeGame.id,
            },
        });

        //// update players
        const userWinner = await this.dbService.user.findUnique({
            where: {
                id: winner.userId,
            },
        });
        await this.dbService.user.update({
            where: {
                id: winner.userId,
            },
            data: {
                points: userWinner.points + 20,
                victories: {
                    increment: 1,
                },
            },
        });

        const userLoser = await this.dbService.user.findUnique({
            where: {
                id: loser.userId,
            },
        });

        await this.dbService.user.update({
            where: {
                id: loser.userId,
            },
            data: {
                points: userLoser.points - 20,
                defeats: {
                    increment: 1,
                },
            },
        });

        this.games.delete(gameId);

        //console.log('gameHistory', gameHistory);

        this.server.in(`game:${gameId}`).emit('game:finished', gameHistory);
    }

    async createPongGame(game: Game): Promise<PongGame | false> {
        const instance = new PongGame(
            {
                id: game.id,
                state: game.state,
                playersIds: game.players.map((p) => p.id),
                players: game.players.map((p) => this.getProfile(p)),
                db: this.dbService,
            },
            (type, data) => {
                this.server.in(`game:${game.id}`).emit(type, data);
            },
            (gameId) => this.endGame(gameId),
        );
        return instance;
    }

    @WebSocketServer()
    public server: Server;

    async handleConnection(client) {
        const cookies = client.handshake.headers.cookie
            ?.split(';')
            .map((c) => c.split('='));
        const access_token = cookies?.find((c) => c[0] === 'access_token');
        if (!access_token) {
            client.disconnect();
            return;
            // throw new Error('Access token not found');
        }
        const payload = await this.authService.validateToken(access_token[1]);
        if (!payload) {
            client.disconnect();
            // throw new Error('Invalid access token');
        }
        client.user = {
            id: payload.id,
            email: payload.email,
            username: payload.username,
        };
        this.clients[payload.id] = this.clients[payload.id] || [];
        this.clients[payload.id].push(client.id);
        this.subscribeUserToRoom(client.user.id, `everyone`);
        if (this.clients[payload.id].length === 1) {
            this.status[client.user.id] = 'online';
            this.server.in('everyone').emit('status', this.status);
        }
        this.subscribeToGame(client.user.id);
    }

    async subscribeToGame(userId: number) {
        Array.from(this.games.values()).forEach((game) => {
            if (game.playersIds.includes(userId)) {
                this.subscribeUserToRoom(String(userId), `game:${game.id}`);
            }
        });
    }

    async handleDisconnect(client) {
        this.clients[client.user.id] = this.clients[client.user.id].filter(
            (id) => id !== client.id,
        );

        if (this.clients[client.user.id].length === 0) {
            this.status[client.user.id] = 'offline';
            this.server.in('everyone').emit('status', this.status);

            Array.from(this.games.values()).forEach((game) => {
                if (game.playersIds.includes(client.user.id)) {
                    game.onDisconnect(client.user.id);
                }
            });
        }
    }

    async sendToUser(userId: string | number, event: string, data: any) {
        this.clients[userId]?.forEach((id) => {
            this.server.to(id).emit(event, data);
        });
    }
    async subscribeUserToRoom(userId: string, room: string) {
        this.clients[userId]?.forEach((id) => {
            this.server.sockets.sockets.get(id).join(room);
        });
    }

    async notification(userId: string, message: any, type = 'info') {
        if (typeof message === 'object') {
            type = message.type
                ? message.type
                : message.success === false
                  ? 'error'
                  : 'success';
            message = message.message;
        }

        this.sendToUser(userId, 'notification', { message, type });
    }

    @SubscribeMessage('conversations:list')
    async syncUserConversations(client: Socket & { user: any }) {
        const conversations = await this.channelService.getUserConversations(
            client.user.id,
        );

        const answer = {
            conversations: await Promise.all(
                conversations.map(async (c: any) => {
                    const users = c.channel.users.map((u) =>
                        this.getChannelProfile(u),
                    );

                    c.channel.users = users;
                    const conv: Conversation = {
                        channelId: c.channel.id,
                        userId: c.userId,
                        role: c.role,
                        mutedUntil: c.mutedUntil,
                        bannedUntil: c.bannedUntil,
                        message: c.message,
                        channel: c.channel,
                        user: this.getProfile(c.user),
                    };
                    this.subscribeUserToRoom(
                        client.user.id,
                        `conversation:${conv.channelId}`,
                    );
                    return conv;
                }),
            ),
        };
        this.sendToUser(client.user.id, 'conversations:list', answer);

        return answer;
    }

    @SubscribeMessage('conversations:sync')
    async syncUserConversation(client: Socket & { user: any }, dto: any) {
        const conversation = await this.channelService.getUserConversation(
            client.user.id,
            dto.channelId,
        );
        if (!conversation) {
            return {
                success: false,
                message: 'Conversation not found',
            };
        }
        conversation.channel.users.forEach((u) => {
            //@ts-ignore
            u.online = this.clients[u.user.id]?.length > 0;
        });
        this.subscribeUserToRoom(
            client.user.id,
            `conversation:${conversation.channelId}`,
        );
        const answer = {
            conversation: conversation,
            show: dto.show || false,
        };
        this.sendToUser(client.user.id, 'conversations:sync', answer);

        return answer;
    }

    @SubscribeMessage('conversations:create')
    async createConversation(client: Socket & { user: any }, payload: any) {
        const { success, message, type, channel } =
            await this.channelService.createConversation(
                client.user.id,
                payload,
            );
        this.notification(client.user.id, { message, success, type });
        if (!success) return { success, message };
        this.syncUserConversation(client, {
            channelId: channel.id,
            show: true,
        });

        this.sendToUser(client.user.id, 'conversations:created', {
            channelId: channel.id,
        });

        return {
            channelId: channel.id,
        };
    }

    @SubscribeMessage('conversations:friend-request')
    async toggleFriend(client: Socket & { user: any }, payload: any) {
        const status = await this.channelService.toggleFriend(
            client.user.id,
            payload.userId,
        );
        this.notification(client.user.id, status);
        this.getUserFriends(client);
        this.syncUserConversations(client);
        if (status.added === true) {
            this.sendToUser(payload.userId, 'conversations:friend-request', {});
        }
        if (status.removed === true) {
            this.sendToUser(payload.userId, 'conversations:friend-decline', {});
        }

        return status;
    }

    @SubscribeMessage('conversations:friend-accept')
    async acceptFriend(client: Socket & { user: any }, payload: any) {
        const status = await this.channelService.acceptFriend(
            client.user.id,
            payload.userId,
        );
        this.notification(client.user.id, status);
        this.notification(payload.userId, status);
        this.sendToUser(payload.userId, 'conversations:friend-accept', {});
        this.sendToUser(client.user.id, 'conversations:friend-accept', {});
        //this.getUserFriends(client, {});
        //this.syncUserConversations(client, {});
        //if (status.added === true) {
        //}

        return status;
    }
    @SubscribeMessage('conversations:friend-decline')
    async declineFriend(client: Socket & { user: any }, payload: any) {
        const status = await this.channelService.declineFriend(
            client.user.id,
            payload.userId,
        );
        this.notification(client.user.id, status);
        this.notification(payload.userId, status);
        this.sendToUser(payload.userId, 'conversations:friend-decline', {});
        this.sendToUser(client.user.id, 'conversations:friend-decline', {});
        //this.getUserFriends(client, {});
        //this.syncUserConversations(client, {});
        //if (status.added === true) {
        //}

        return status;
    }
    @SubscribeMessage('conversations:friends')
    async getUserFriends(client: Socket & { user: any }) {
        const friends = await this.friendService.getUserFriends(client.user.id);

        this.sendToUser(client.user.id, 'conversations:friends', friends);
        return friends;
    }
    @SubscribeMessage('conversations:blocked')
    async getBlockedUsers(client: Socket & { user: any }) {
        const users = await this.channelService.getBlockedUsers(client.user.id);
        this.sendToUser(client.user.id, 'conversations:blocked', users);
        return users;
    }
    @SubscribeMessage('conversations:block')
    async blockUser(client: Socket & { user: any }, payload: any) {
        const status = await this.channelService.blockUser(
            client.user.id,
            payload.userId,
            payload.status,
        );
        this.sendToUser(client.user.id, 'conversations:block', status);

        this.notification(client.user.id, status);
        return status;
    }

    @SubscribeMessage('conversations:update')
    async updateConversation(client: Socket & { user: any }, payload: any) {
        const { success, message, type, channel } =
            await this.channelService.updateConversation(
                client.user.id,
                payload,
            );
        this.notification(client.user.id, { message, success, type });
        if (!success) return { success, message };
        this.syncUserConversation(client, {
            channelId: payload.channelId,
            show: true,
        });

        this.sendChannelEvent(payload.channelId, 'conversations:syncing', {
            channelId: payload.channelId,
        });
    }

    @SubscribeMessage('conversations:leave')
    async leaveConversation(client: any, payload: any) {
        const { success, message, channelId, last } =
            await this.channelService.leaveConversation(
                client.user.id,
                payload.channelId,
            );
        this.notification(client.user.id, { message, success });
        if (!success) return { success, message };
        this.clients[client.user.id]?.forEach((id) => {
            this.server.sockets.sockets
                .get(id)
                ?.leave(`conversation:${payload.channelId}`);
        });
        this.sendToUser(client.user.id, 'conversations:leave', {
            channelId: payload.channelId,
        });
        if (last !== true) {
            this.sendMessage({
                channelId: payload.channelId,
                from: 0,
                content: `@${client.user.username} has left the channel`,
                timestamp: new Date(),
            });
            this.sendChannelEvent(channelId, 'conversations:left', {
                channelId: channelId,
                userId: client.user.id,
            });
        }

        return {
            success: true,
            channelId: channelId,
            message: 'You left the conversation',
        };
    }

    @SubscribeMessage('conversations:join')
    async joinConversation(client: any, payload: any) {
        const notification = await this.channelService.joinChannel(
            client.user.id,
            payload,
        );
        this.notification(client.user.id, notification);
        if (!notification.success) return notification;
        this.syncUserConversation(client, {
            channelId: payload.channelId,
            show: true,
        });

        this.sendMessage({
            channelId: payload.channelId,
            from: 0,
            content: `@${client.user.username} has joined the channel`,
            timestamp: new Date(),
        });
        this.sendToUser(client.user.id, 'conversations:join', {
            channelId: payload.channelId,
        });
        this.sendChannelEvent(payload.channelId, 'conversations:joined', {
            channelId: payload.channelId,
            userId: client.user.id,
        });
        //    this.sendChannelEvent(payload.channelId, 'conversations:syncing', {
        //        channelId: payload.channelId,
        //    });
    }

    @SubscribeMessage('conversations:messages')
    async getMessages(client: Socket & { user: any }, payload: any) {
        const messages = await this.channelService.getConversationMessages(
            client.user.id,
            payload.channelId,
        );

        if (messages.success === false) {
            this.notification(client.user.id, messages);
            return messages.messages;
        }

        return {
            messages: messages.messages,
        };
    }

    @SubscribeMessage('conversations:message')
    async onMessage(client: Socket & { user: any }, payload: any) {
        const userChannel = await this.channelService.getUserChannel(
            client.user.id,
            payload.channelId,
        );

        if (userChannel) {
            if (
                userChannel.mutedUntil &&
                new Date(userChannel.mutedUntil) > new Date()
            ) {
                this.notification(client.user.id, {
                    message:
                        'You are muted until ' +
                        userChannel.mutedUntil.toLocaleString('fr-FR', {
                            timeZone: 'Europe/Paris',
                        }),
                    type: 'error',
                });
                return;
            }
            if (
                userChannel.bannedUntil &&
                new Date(userChannel.bannedUntil) > new Date()
            ) {
                this.notification(client.user.id, {
                    message:
                        'You are banned until ' +
                        userChannel.bannedUntil.toLocaleString('fr-FR', {
                            timeZone: 'Europe/Paris',
                        }),
                    type: 'error',
                });
                return;
            }
            this.sendMessage({
                channelId: payload.channelId,
                from: client.user.id,
                content: payload.message,
                timestamp: new Date(),
            });
        }
    }

    async sendMessage(messageData: any) {
        const message = await this.channelService.sendMessage(messageData);
        this.server
            .in(`conversation:${message.channelId}`)
            .emit('conversations:message', message);
    }
    async sendChannelEvent(channelID: number, type: string, data: any) {
        this.server.in(`conversation:${channelID}`).emit(type, data);
    }

    @SubscribeMessage('conversations:search')
    async searchConversation(client: Socket & { user: any }, payload: any) {
        const channels = await this.channelService.searchChannel(
            client.user.id,
            payload,
        );
        this.sendToUser(client.user.id, 'conversations:search', channels);
        return channels;
    }
    @SubscribeMessage('conversations:kick')
    async kickUser(client: Socket & { user: any }, payload: any) {
        const status = await this.channelService.kickUser(
            client.user.id,
            payload,
        );

        this.notification(client.user.id, status);
        if (status.success === true) {
            this.notification(payload.userId, {
                message: `You have been kicked from channel #${payload.channelId}`,
                type: 'error',
            });
            this.sendChannelEvent(
                payload.channelId,
                'conversations:sync-reload',
                {
                    channelId: payload.channelId,
                },
            );
            this.sendToUser(payload.userId, 'conversations:leave', {
                channelId: payload.channelId,
            });
            // unsubscribe user from channel
            this.clients[payload.userId]?.forEach((id) => {
                this.server.sockets.sockets
                    .get(id)
                    ?.leave(`conversation:${payload.channelId}`);
            });

            this.sendMessage({
                channelId: payload.channelId,
                from: 0,
                content: `@${status.user.username} was kicked by @${client.user.username}`,
                timestamp: new Date(),
            });
        }
    }

    @SubscribeMessage('conversations:mute')
    async muteUser(client: Socket & { user: any }, payload: any) {
        const status = await this.channelService.muteUser(
            client.user.id,
            payload,
        );

        this.notification(client.user.id, status);
        if (status.success === true) {
            this.notification(payload.userId, {
                message: `You have been ${
                    payload.duration === 0 ? 'un' : ''
                }muted from channel #${payload.channelId}${
                    payload.duration === 0
                        ? ''
                        : ' until ' +
                          status.mutedUntil.toLocaleString('fr-FR', {
                              timeZone: 'Europe/Paris',
                          })
                }`,
                type: 'error',
            });
            this.sendChannelEvent(
                payload.channelId,
                'conversations:sync-reload',
                {
                    channelId: payload.channelId,
                },
            );

            this.sendMessage({
                channelId: payload.channelId,
                from: 0,
                content: `@${status.user.username} was ${
                    payload.duration === 0 ? 'un' : ''
                }muted by @${client.user.username}${
                    payload.duration === 0
                        ? ''
                        : ' until ' +
                          status.mutedUntil.toLocaleString('fr-FR', {
                              timeZone: 'Europe/Paris',
                          })
                }`,
                timestamp: new Date(),
            });
        }
    }
    @SubscribeMessage('conversations:ban')
    async banUser(client: Socket & { user: any }, payload: any) {
        const status = await this.channelService.banUser(
            client.user.id,
            payload,
        );

        this.notification(client.user.id, status);
        if (status.success === true) {
            this.notification(payload.userId, {
                message: `You have been ${
                    payload.duration === 0 ? 'un' : ''
                }banned from channel #${payload.channelId}${
                    payload.duration === 0
                        ? ''
                        : ' until ' +
                          status.bannedUntil.toLocaleString('fr-FR', {
                              timeZone: 'Europe/Paris',
                          })
                }`,
                type: 'error',
            });
            this.sendChannelEvent(
                payload.channelId,
                'conversations:sync-reload',
                {
                    channelId: payload.channelId,
                },
            );

            this.sendMessage({
                channelId: payload.channelId,
                from: 0,
                content: `@${status.user.username} was ${
                    payload.duration === 0 ? 'un' : ''
                }banned by @${client.user.username}${
                    payload.duration === 0
                        ? ''
                        : ' until ' +
                          status.bannedUntil.toLocaleString('fr-FR', {
                              timeZone: 'Europe/Paris',
                          })
                }`,
                timestamp: new Date(),
            });
        }
    }
    @SubscribeMessage('conversations:admin')
    async setAdmin(client: Socket & { user: any }, payload: any) {
        const status = await this.channelService.setAdmin(
            client.user.id,
            payload,
        );

        this.notification(client.user.id, status);
        if (status.success === true) {
            this.notification(payload.userId, {
                message: `You have been ${
                    payload.state === true ? 'promoted to' : 'demoted from'
                } admin in channel #${payload.channelId}`,
                type: payload.state === true ? 'success' : 'error',
            });
            this.sendChannelEvent(
                payload.channelId,
                'conversations:sync-reload',
                {
                    channelId: payload.channelId,
                },
            );

            this.sendMessage({
                channelId: payload.channelId,
                from: 0,
                content: `@${status.user.username} was ${
                    payload.admin === true ? 'promoted to' : 'demoted from'
                } admin by @${client.user.username}`,
                timestamp: new Date(),
            });
        }
    }

    getProfile(user) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            status: this.status[user.id] || 'offline',
            online: this.clients[user.id]?.length > 500,
            points: user.points,
            victories: user.victories,
            defeats: user.defeats,
        };
    }
    getChannelProfile(user) {
        return {
            userId: user.user.id,
            channelId: user.channelId,
            role: user.role,
            mutedUntil: user.mutedUntil,
            bannedUntil: user.bannedUntil,
            online: this.clients[user.user.id]?.length > 0,
            user: this.getProfile(user.user),
        };
    }

    @SubscribeMessage('conversations:search-friend')
    async searchFriend(client: Socket & { user: any }, payload: any) {
        if (!payload.query.length) return [];
        const users = await this.friendService.searchFriend(payload.query);

        return await Promise.all(users.map((user) => this.getProfile(user)));
    }

    @SubscribeMessage('game:challenge')
    async onChallenge(client: Socket & { user: any }, destUserId: number) {
        const destUser = await this.userService.findOne(destUserId);
        if (destUser.id === client.user.id) {
            this.notification(client.user.id, {
                message: 'You cannot challenge yourself',
                type: 'error',
            });
            return;
        }
        if (!destUser) {
            this.notification(client.user.id, {
                message: 'User not found',
                type: 'error',
            });
            return;
        }
        // Check if user is online
        if (!this.clients[destUserId]?.length) {
            this.notification(client.user.id, {
                message: 'User is offline',
                type: 'error',
            });
            return;
        }

        // Check if user is already in queue
        if (this.queue.find((u) => u.id === destUserId)) {
            this.notification(client.user.id, {
                message: 'User is already in queue, auto matching in progress',
                type: 'warning',
            });
            // TODO: auto match
            return;
        }

        // Check if user is already in game
        //Array.from(...this.games).find((u) =>
        //    u.players.includes(destUserId),
        //)
        if (
            Array.from(this.games.values()).find((u) =>
                u.playersIds.includes(destUserId),
            )
        ) {
            this.notification(client.user.id, {
                message: 'User is already in game',
                type: 'error',
            });
            return;
        }
        if (this.tmpGames.find((u) => u.players.includes(destUserId))) {
            this.notification(client.user.id, {
                message: 'User is already in tmp game',
                type: 'error',
            });
            return;
        }
        if (this.tmpGames.find((u) => u.players.includes(client.user.id))) {
            this.notification(client.user.id, {
                message: 'You are already in game',
                type: 'error',
            });
            return;
        }
        // Create temporary game
        const gameId = crypto.randomUUID();
        const tmpGame = {
            gameId,
            originUsername: client.user.username,
            destUsername: destUser.username,
            origin: client.user.id,
            expiration: new Date(Date.now() + 1000 * 15), // 15sec
            players: [client.user.id, destUserId],
        };
        this.sendToUser(String(destUserId), 'game:challenged', tmpGame);
        this.sendToUser(String(client.user.id), 'game:challenged', tmpGame);
        this.tmpGames.push(tmpGame);
    }

    @SubscribeMessage('game:challenge-accept')
    async onChallengeAccepted(client: Socket & { user: any }, { gameId }) {
        const tmpGame = this.tmpGames.find(
            (g) => g.gameId === gameId && g.players.includes(client.user.id),
        );
        if (!tmpGame) {
            this.notification(client.user.id, {
                message: 'Game not found',
                type: 'error',
            });
            return;
        }
        tmpGame.players.forEach((player) => {
            this.subscribeUserToRoom(String(player), `game:${gameId}`);
            this.sendToUser(String(player), 'game:challenge-accepted', tmpGame);
        });

        const playersData = await Promise.all(
            tmpGame.players.map((id) => this.userService.findOne(id)),
        );

        tmpGame.db = this.dbService;
        tmpGame.playersData = playersData.map((user) => this.getProfile(user));
        const game = await this.dbService.game.create({
            data: {
                id: gameId,
                players: {
                    connect: tmpGame.players.map((id) => ({ id })),
                },
                state: {},
            },
            select: {
                id: true,
                players: true,
                state: true,
                date: true,
            },
        });
        const gameInstance = await this.createPongGame(game);
        if (gameInstance == false) {
            this.notification(client.user.id, {
                message: 'Cannot create game',
                type: 'error',
            });
            return;
        }
        this.games.set(gameId, gameInstance);
        this.tmpGames = this.tmpGames.filter((g) => g.gameId !== gameId);
    }

    @SubscribeMessage('game:connect')
    async onGameConnect(client: Socket & { user: any }, { gameId }) {
        const game = this.games.get(gameId);
        if (!game) {
            const gameHistory = await this.dbService.gameHistory.findFirst({
                where: {
                    id: gameId,
                },
                select: {
                    id: true,
                    winnerId: true,
                    winner: {
                        select: {
                            username: true,
                            avatar: true,
                        },
                    },
                    winnerScore: true,
                    loserId: true,
                    loser: {
                        select: {
                            username: true,
                            avatar: true,
                        },
                    },
                    loserScore: true,
                },
            });
            if (gameHistory) {
                this.sendToUser(client.user.id, 'game:finished', gameHistory);
            } else
                this.notification(client.user.id, {
                    message: 'Game not found',
                    type: 'error',
                });
            return;
        }
        game.connect(client.user.id);
    }

    @SubscribeMessage('game:challenge-decline')
    async onChallengeDecline(client: Socket & { user: any }, { gameId }) {
        const tmpGame = this.tmpGames.find(
            (g) => g.gameId === gameId && g.players.includes(client.user.id),
        );
        if (!tmpGame) {
            this.notification(client.user.id, {
                message: 'Game not found',
                type: 'error',
            });
            return;
        }

        tmpGame.players.forEach((player) => {
            this.sendToUser(String(player), 'game:challenge-declined', tmpGame);
        });

        this.tmpGames = this.tmpGames.filter((g) => g.gameId !== gameId);
    }

    @SubscribeMessage('game:ready')
    async onGameReady(client: Socket & { user: any }, { gameId }) {
        const game = this.games.get(gameId);
        if (!game) {
            this.notification(client.user.id, {
                message: 'Game not found',
                type: 'error',
            });
            return;
        }
        game.setReady(client.user.id);
    }
    @SubscribeMessage('game:moveup')
    async onMoveUp(client: Socket & { user: any }, { gameId }) {
        //console.log('game:connect', client.user, gameId);
        const game = this.games.get(gameId);
        if (!game) {
            this.notification(client.user.id, {
                message: 'Game not found',
                type: 'error',
            });
            return;
        }
        game.onMoveUp(client.user.id);
    }
    @SubscribeMessage('game:movedown')
    async onMoveDown(client: Socket & { user: any }, { gameId }) {
        //console.log('game:connect', client.user, gameId);
        const game = this.games.get(gameId);
        if (!game) {
            this.notification(client.user.id, {
                message: 'Game not found',
                type: 'error',
            });
            return;
        }
        game.onMoveDown(client.user.id);
    }

    @SubscribeMessage('game:quit')
    async onGameQuit(client: Socket & { user: any }, { gameId }) {
        const game = this.games.get(gameId);
        if (!game) {
            this.notification(client.user.id, {
                message: 'Game not found',
                type: 'error',
            });
            return;
        }
        game.onQuit(client.user.id);
    }

    @SubscribeMessage('game:afk')
    async onGameAFK(client: Socket & { user: any }, { gameId }) {
        const game = this.games.get(gameId);
        if (!game) {
            this.notification(client.user.id, {
                message: 'Game not found',
                type: 'error',
            });
            return;
        }
        game.onAFK(client.user.id);
    }
    @SubscribeMessage('game:queue')
    async onGameQueue(client: Socket & { user: any }) {
        if (this.queue.length) {
            const destUserId = this.queue.shift();
            this.onChallenge(client, destUserId);
        } else {
            this.queue.push(client.user.id);
            this.notification(client.user.id, {
                message: 'You are now in queue',
                type: 'success',
            });
        }
    }

    @SubscribeMessage('profile')
    async onProfile(client: Socket & { user: any }, username: string) {
        const user = await this.userService.findByUsername(username);
        if (!user) {
            this.notification(client.user.id, {
                message: 'User not found',
                type: 'error',
            });
            return false;
        }
        let profile = this.getProfile(user);
        const currentGame = Array.from(this.games.values()).find((g) =>
            g.playersIds.includes(user.id),
        );
        if (currentGame) {
            profile = {
                ...profile,
                currentGame: {
                    id: currentGame.id,
                    state: currentGame.state,
                    players: currentGame.players.map((p) => this.getProfile(p)),
                },
            } as typeof profile & {
                currentGame: {
                    id: string;
                    state: any;
                    players: any[];
                };
            };
        }

        const gameHistory = await this.dbService.gameHistory.findMany({
            where: {
                OR: [
                    {
                        winnerId: user.id,
                    },
                    {
                        loserId: user.id,
                    },
                ],
            },
            select: {
                id: true,
                winnerId: true,
                winner: {
                    select: {
                        username: true,
                        avatar: true,
                    },
                },
                winnerScore: true,
                loserId: true,
                loser: {
                    select: {
                        username: true,
                        avatar: true,
                    },
                },
                loserScore: true,
            },
        });

        // @ts-expect-error
        profile.gameHistory = gameHistory;

        //this.sendToUser(client.user.id, 'profile', user);
        return profile;
    }

    @SubscribeMessage('leaderboard')
    async onLeaderboard() {
        return await this.userService.getAllUsersSortedByPoints();
    }
}
