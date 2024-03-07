// friend.service.ts

import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { DBService } from 'src/db/db.service';
import { Prisma } from '@prisma/client';
import { User } from '@prisma/client';

@Injectable()
export class FriendService {
    constructor(
        private prisma: DBService,
        private usersService: UsersService,
    ) {}

    async getUserFriends(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                friends: true,
                friendsOf: true,
            },
        });

        if (!user) {
            return [];
        }
        const friends = [
            ...user.friends.map((f) => ({
                id: f.toId,
                source: true,
                accepted: f.accepted,
            })),
            ...user.friendsOf.map((f) => ({
                id: f.fromId,
                source: false,
                accepted: f.accepted,
            })),
        ];
        return friends;
    }
    async searchFriend(query: string): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            where: {
                OR: [
                    {
                        username: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        email: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
        });

        return users;
    }
}
