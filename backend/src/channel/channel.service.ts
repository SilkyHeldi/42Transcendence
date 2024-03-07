import { Injectable } from '@nestjs/common';
import { DBService } from 'src/db/db.service';
import { User, Prisma, Role } from '@prisma/client';
import slugify from 'slugify';

import * as bcrypt from 'bcryptjs';

@Injectable()
export class ChannelService {
    constructor(private db: DBService) {}

    async getUserConversations(userId: number) {
        const conversations = await this.db.channelUser.findMany({
            where: {
                userId,
            },
            select: {
                role: true,
                userId: true,
                channelId: true,
                bannedUntil: true,
                mutedUntil: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        points: true,
                        victories: true,
                        defeats: true,
                        username: true,
                        avatar: true,
                    },
                },
                channel: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        type: true,
                        users: {
                            select: {
                                role: true,
                                userId: true,
                                bannedUntil: true,
                                mutedUntil: true,
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        points: true,
                                        victories: true,
                                        defeats: true,
                                        username: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                channelId: 'desc',
            },
        });

        return conversations;
    }
    async getUserConversation(userId: number, channelId: number) {
        const conversation = await this.db.channelUser.findFirst({
            where: {
                userId,
                channelId,
            },
            select: {
                role: true,
                userId: true,
                channelId: true,
                bannedUntil: true,
                mutedUntil: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        points: true,
                        victories: true,
                        defeats: true,
                        username: true,
                        avatar: true,
                    },
                },
                channel: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        type: true,
                        users: {
                            select: {
                                role: true,
                                userId: true,
                                bannedUntil: true,
                                mutedUntil: true,
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        points: true,
                                        victories: true,
                                        defeats: true,
                                        username: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        return conversation;
    }

    async getConversationMessages(userId: number, channelId: number) {
        const conversation = await this.db.channelUser.findFirst({
            where: {
                userId,
                channelId,
            },
            select: {
                role: true,
                userId: true,
                channelId: true,
                bannedUntil: true,
                mutedUntil: true,
            },
        });
        if (!conversation) {
            return {
                success: false,
                messages: [],
                message: 'You are not in this channel',
            };
        }

        if (conversation.bannedUntil && conversation.bannedUntil > new Date()) {
            return {
                success: false,
                messages: [],
                message: 'You are banned from this channel',
            };
        }

        const messages = await this.db.message.findMany({
            where: {
                channelId: channelId,
            },
            select: {
                id: true,
                channelId: true,
                content: true,
                from: true,
                timestamp: true,
            },
            orderBy: {
                id: 'desc',
            },
            take: 100,
            skip: 0,
        });

        return {
            success: true,
            messages: messages.sort((a, b) => a.id - b.id),
        };
    }

    private sanitizeChannelName(name: string) {
        return slugify(name, {
            strict: true,
            lower: true,
        })
            .trim()
            .slice(0, 20);
    }

    async createConversation(userId: number, payload) {
        const channelName = this.sanitizeChannelName(payload.name);
        const exists = await this.db.channel.findFirst({
            where: {
                name: channelName,
            },
        });
        if (exists)
            return { success: false, message: 'Channel already exists' };
        const data = await this.prepareChannelData(payload, {});
        if (data.success === false) return data;
        const { name, description, type } = data;
        const createdChannel = await this.db.channel.create({
            data: {
                name,
                description,
                type,
                password: data.password,
                users: {
                    create: {
                        role: 'OWNER',
                        user: {
                            connect: {
                                id: userId,
                            },
                        },
                    },
                },
            },
        });
        const { password, ...channel } = createdChannel;

        return {
            success: true,
            message: `Channel #${name} created`,
            channel: channel,
        };
    }

    async updateConversation(userId: number, payload) {
        const channel = await this.db.channel.findFirst({
            where: {
                id: payload.channelId,
            },
            select: {
                type: true,
                name: true,
                users: true,
            },
        });
        if (!channel) return { success: false, message: 'Channel not found' };
        if (this.getChannelOwner(channel).userId != userId) {
            return {
                success: false,
                message: 'You are not the owner of this channel',
            };
        }
        const data = await this.prepareChannelData(payload, channel);
        if (data.success === false) return data;
        const { name, description, type, password } = data;
        const updatedChannel = await this.db.channel.update({
            where: {
                id: payload.channelId,
            },
            data: { name, description, type, password },
        });
        return {
            success: true,
            message: 'Channel updated',
        };
    }

    private getChannelOwner(channel) {
        return channel.users.find((u) => u.role == 'OWNER');
    }

    private async prepareChannelData(channel, previous = {} as any) {
        const channelName = this.sanitizeChannelName(channel.name);
        channel.type = channel.type.toUpperCase();
        if (!previous?.name || previous.name != channelName) {
            const exists = await this.db.channel.findFirst({
                where: {
                    name: channelName,
                },
            });
            if (exists) {
                return {
                    success: false,
                    message: 'Channel already exists with that name',
                };
            }
            channel.name = channelName;
        }
        if (['PUBLIC', 'PRIVATE'].includes(channel.type)) {
            channel.password = null;
        }
        if (channel.type == 'PROTECTED' && channel.password?.length) {
            channel.password = bcrypt.hashSync(channel.password, 10);
        }
        if (channel.type == 'PROTECTED' && !channel.password?.length) {
            return {
                success: false,
                message: 'Password is required for protected channels',
            };
        }
        channel.description = channel.description.trim().slice(0, 160);
        return channel;
    }

    async leaveConversation(userId: number, channelId: number) {
        const channel = await this.db.channel.findFirst({
            where: {
                id: channelId,
            },
            select: {
                type: true,
                name: true,
                users: true,
            },
        });
        if (!channel) return { success: false, message: 'Channel not found' };

        const user = channel.users.find((u) => u.userId == userId);
        if (!user) return { success: true, message: 'Already left' };
        await this.db.channelUser.delete({
            where: {
                userId_channelId: {
                    userId: userId,
                    channelId: channelId,
                },
            },
        });
        if (user.role == 'OWNER') {
            let nextOwner = channel.users.find((u) => u.role == 'ADMIN');
            if (!nextOwner) {
                nextOwner = channel.users.find((u) => u.role == 'USER');
            }
            if (!nextOwner) {
                await this.db.channel.delete({
                    where: {
                        id: channelId,
                    },
                });
                return {
                    success: true,
                    last: true,
                    message:
                        'Channel left, no remaining members... so channel deleted!',
                };
            }
            if (nextOwner) {
                // Transfer ownership to first admin
                await this.db.channelUser.update({
                    where: {
                        userId_channelId: {
                            userId: nextOwner.userId,
                            channelId: channelId,
                        },
                    },
                    data: {
                        role: 'OWNER',
                        mutedUntil: null,
                        bannedUntil: null,
                    },
                });
            }
        }
        return {
            success: true,
            message: 'Channel left',
            channelId: channelId,
        };
    }

    async getBlockedUsers(userId) {
        const blockedUsers = await this.db.blockedUser.findMany({
            where: {
                userId: userId,
            },
            select: {
                blockedId: true,
            },
        });
        return blockedUsers.map((u) => u.blockedId);
    }

    async acceptFriend(userId, friendId) {
        const exists = await this.db.friendship.findFirst({
            where: {
                fromId: friendId,
                toId: userId,
            },
        });

        if (!exists) {
            return {
                success: false,
                message: 'Friend request not found',
            };
        }

        await this.db.friendship.update({
            where: {
                fromId_toId: {
                    fromId: friendId,
                    toId: userId,
                },
            },
            data: {
                accepted: true,
            },
        });

        return {
            success: true,
            message: 'Friend request accepted',
        };
    }

    async declineFriend(userId, friendId) {
        const exists = await this.db.friendship.findFirst({
            where: {
                fromId: friendId,
                toId: userId,
            },
        });

        if (!exists) {
            return {
                success: false,
                message: 'Friend request not found',
            };
        }

        await this.db.friendship.delete({
            where: {
                fromId_toId: {
                    fromId: exists.fromId,
                    toId: exists.toId,
                },
            },
        });
        // delete channel users
        await this.db.channelUser.deleteMany({
            where: {
                channelId: exists.channelId,
            },
        });

        await this.db.channel.delete({
            where: {
                id: exists.channelId,
            },
        });

        return {
            success: true,
            message: 'Friend request declined',
        };
    }

    async toggleFriend(userId, friendId) {
        const exists = await this.db.friendship.findFirst({
            where: {
                OR: [
                    {
                        fromId: userId,
                        toId: friendId,
                    },
                    {
                        fromId: friendId,
                        toId: userId,
                    },
                ],
            },
        });

        if (exists) {
            await this.db.friendship.delete({
                where: {
                    fromId_toId: {
                        fromId: exists.fromId,
                        toId: exists.toId,
                    },
                },
            });
            // delete channel users
            await this.db.channelUser.deleteMany({
                where: {
                    channelId: exists.channelId,
                },
            });
            await this.db.channel.delete({
                where: {
                    id: exists.channelId,
                },
            });

            return {
                success: true,
                removed: true,
                channelId: exists.channelId,
                message: 'Removed friend',
            };
        }

        const channel = await this.db.channel.create({
            data: {
                name: `DM_${userId}_${friendId}`,
                description: ``,
                type: 'DM',
                users: {
                    create: [
                        {
                            role: 'USER',
                            user: {
                                connect: {
                                    id: userId,
                                },
                            },
                        },
                        {
                            role: 'USER',
                            user: {
                                connect: {
                                    id: friendId,
                                },
                            },
                        },
                    ],
                },
            },
        });

        await this.db.friendship.create({
            data: {
                fromId: userId,
                toId: friendId,
                channelId: channel.id,
                accepted: false,
            },
        });

        return {
            success: true,
            added: true,
            channelId: channel.id,
            message: 'Friend added, waiting for his confirmation',
        };
    }
    async blockUser(userId, blockedId, blocked) {
        if (!blocked) {
            await this.db.blockedUser.delete({
                where: {
                    userId_blockedId: {
                        userId: userId,
                        blockedId: blockedId,
                    },
                },
            });

            return {
                success: true,
                message: 'User unblocked',
            };
        } else {
            const exists = await this.db.blockedUser.findFirst({
                where: {
                    userId: userId,
                    blockedId: blockedId,
                },
            });
            if (exists) {
                return {
                    success: false,
                    message: 'User already blocked',
                };
            }
            await this.db.blockedUser.create({
                data: {
                    userId: userId,
                    blockedId: blockedId,
                },
            });

            return {
                success: true,
                message: 'User blocked',
            };
        }
    }

    async kickUser(adminId, { channelId, userId }) {
        const admin = await this.db.channelUser.findFirst({
            where: {
                userId: adminId,
                channelId: channelId,
            },
        });
        if (!admin) {
            return {
                success: false,
                message: 'You are not in this channel',
            };
        }
        if (admin.role != 'OWNER' && admin.role != 'ADMIN') {
            return {
                success: false,
                message: 'You are not allowed to kick users',
            };
        }
        const user = await this.db.channelUser.findFirst({
            where: {
                userId: userId,
                channelId: channelId,
            },
            include: {
                user: true,
            },
        });
        if (!user) {
            return {
                success: false,
                message: 'User not found in this channel',
            };
        }
        if (user.role == 'OWNER') {
            return {
                success: false,
                message: 'You cannot kick the owner',
            };
        }
        await this.db.channelUser.delete({
            where: {
                userId_channelId: {
                    userId: userId,
                    channelId: channelId,
                },
            },
        });
        return {
            success: true,
            user: user.user,
            message: 'User kicked',
        };
    }
    async muteUser(adminId, { channelId, userId, duration }) {
        const admin = await this.db.channelUser.findFirst({
            where: {
                userId: adminId,
                channelId: channelId,
            },
        });
        if (!admin) {
            return {
                success: false,
                message: 'You are not in this channel',
            };
        }
        if (admin.role != 'OWNER' && admin.role != 'ADMIN') {
            return {
                success: false,
                message: 'You are not allowed to mute users',
            };
        }
        const user = await this.db.channelUser.findFirst({
            where: {
                userId: userId,
                channelId: channelId,
            },
            include: {
                user: true,
            },
        });
        if (!user) {
            return {
                success: false,
                message: 'User not found in this channel',
            };
        }
        if (user.role == 'OWNER') {
            return {
                success: false,
                message: 'You cannot mute the owner',
            };
        }
        duration = Math.min(60 * 60 * 24 * 30, duration);
        const mutedUntil = new Date(Date.now() + duration * 1000);
        await this.db.channelUser.update({
            where: {
                userId_channelId: {
                    userId: userId,
                    channelId: channelId,
                },
            },
            data: {
                mutedUntil,
            },
        });
        return {
            success: true,
            user: user.user,
            mutedUntil,
            message: 'User muted',
        };
    }
    async banUser(adminId, { channelId, userId, duration }) {
        const admin = await this.db.channelUser.findFirst({
            where: {
                userId: adminId,
                channelId: channelId,
            },
        });
        if (!admin) {
            return {
                success: false,
                message: 'You are not in this channel',
            };
        }
        if (admin.role != 'OWNER' && admin.role != 'ADMIN') {
            return {
                success: false,
                message: 'You are not allowed to ban users',
            };
        }
        const user = await this.db.channelUser.findFirst({
            where: {
                userId: userId,
                channelId: channelId,
            },
            include: {
                user: true,
            },
        });
        if (!user) {
            return {
                success: false,
                message: 'User not found in this channel',
            };
        }
        if (user.role == 'OWNER') {
            return {
                success: false,
                message: 'You cannot ban the owner',
            };
        }
        duration = Math.min(60 * 60 * 24 * 30, duration);
        const bannedUntil = new Date(Date.now() + duration * 1000);
        await this.db.channelUser.update({
            where: {
                userId_channelId: {
                    userId: userId,
                    channelId: channelId,
                },
            },
            data: {
                bannedUntil,
            },
        });
        return {
            success: true,
            user: user.user,
            bannedUntil,
            message: duration == 0 ? 'User unbanned' : 'User banned',
        };
    }
    async setAdmin(adminId, { channelId, userId, state }) {
        const admin = await this.db.channelUser.findFirst({
            where: {
                userId: adminId,
                channelId: channelId,
            },
        });
        if (!admin) {
            return {
                success: false,
                message: 'You are not in this channel',
            };
        }
        if (admin.role != 'OWNER') {
            return {
                success: false,
                message: 'You are not allowed to manage admins',
            };
        }
        const user = await this.db.channelUser.findFirst({
            where: {
                userId: userId,
                channelId: channelId,
            },
            include: {
                user: true,
            },
        });
        if (!user) {
            return {
                success: false,
                message: 'User not found in this channel',
            };
        }
        if (user.role == 'OWNER') {
            return {
                success: false,
                message: 'Owner cannot be changed',
            };
        }

        await this.db.channelUser.update({
            where: {
                userId_channelId: {
                    userId: userId,
                    channelId: channelId,
                },
            },
            data: {
                role: state ? 'ADMIN' : 'USER',
            },
        });
        return {
            success: true,
            user: user.user,
            message: state ? 'User promoted to admin' : 'User demoted',
        };
    }

    async sendMessage(messageData) {
        return await this.db.message.create({
            data: messageData,
        });
    }

    async getUserChannel(userId: number, channelId: number) {
        return await this.db.channelUser.findFirst({
            where: {
                userId,
                channelId,
            },
        });
    }

    async getUserChannels(userId: number) {
        return await this.db.channelUser.findMany({
            where: {
                userId,
            },
            select: {
                role: true,
                channelId: true,
                bannedUntil: true,
                mutedUntil: true,
                channel: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        type: true,
                        users: {
                            select: {
                                role: true,
                                user: {
                                    select: {
                                        id: true,
                                        username: true,
                                    },
                                },
                            },
                        },
                        messages: {
                            select: {
                                id: true,
                                content: true,
                                from: true,
                                timestamp: true,
                            },
                            take: 50,
                            orderBy: {
                                timestamp: 'desc',
                            },
                        },
                    },
                },
            },
            orderBy: {
                channelId: 'desc',
            },
        });
    }

    async searchChannel(userId, payload) {
        const channels = await this.db.channel.findMany({
            where: {
                type: {
                    not: 'DM',
                },
                OR: [
                    {
                        name: {
                            contains: payload.query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        description: {
                            contains: payload.query,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                type: true,
                description: true,
                users: {
                    select: {
                        role: true,
                        userId: true,
                    },
                },
            },
        });

        return channels;
    }
    async updateChannel(userId, payload) {
        const channel = await this.db.channel.findFirst({
            where: {
                id: payload.channelId,
            },
            select: {
                type: true,
                name: true,
                users: true,
            },
        });
        if (!channel) return { success: false, message: 'Channel not found' };
        if (this.getChannelOwner(channel).userId != userId) {
            return {
                success: false,
                message: 'You are not the owner of this channel',
            };
        }
        const data = await this.prepareChannelData(payload.channel, channel);
        if (data.success === false) return data;
        const { name, description, type, password } = data;
        const updatedChannel = await this.db.channel.update({
            where: {
                id: payload.channelId,
            },
            data: { name, description, type, password },
        });
        return {
            success: true,
            message: 'Channel updated',
        };
    }

    async joinChannel(userId, payload) {
        const channel = await this.db.channel.findFirst({
            where: {
                id: payload.channelId,
            },
            select: {
                type: true,
                password: true,
                name: true,
                users: true,
            },
        });
        if (!channel) return { success: false, message: 'Channel not found' };
        const user = channel.users.find((u) => u.userId == userId);
        if (user) return { success: true, message: 'Already joined' };
        if (channel.type == 'PUBLIC') {
            await this.db.channelUser.create({
                data: {
                    role: 'USER',
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                    channel: {
                        connect: {
                            id: payload.channelId,
                        },
                    },
                },
            });
        }
        if (channel.type == 'PRIVATE') {
            return {
                success: false,
                message: 'This channel is private',
            };
        }

        if (channel.type == 'PROTECTED') {
            if (!payload.password) {
                return {
                    success: false,
                    message: 'Password is required for protected channels',
                };
            }
            const passwordMatch = bcrypt.compareSync(
                payload.password,
                channel.password,
            );
            if (!passwordMatch) {
                return {
                    success: false,
                    message: 'Incorrect password',
                };
            }
            await this.db.channelUser.create({
                data: {
                    role: 'USER',
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                    channel: {
                        connect: {
                            id: payload.channelId,
                        },
                    },
                },
            });
        }

        return {
            success: true,
            message: 'Channel joined',
        };
    }
}
