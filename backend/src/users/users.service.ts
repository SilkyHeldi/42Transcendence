import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DBService } from 'src/db/db.service';
import { User, Prisma, Role } from '@prisma/client';

import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(private db: DBService) {}
    async create(data: CreateUserDto) {
        const hash = bcrypt.hashSync(data.password, 10);
        data.password = hash;
        return this.db.user.create({
            data,
        });
    }

    findAll() {
        return this.db.user.findMany({
            //skip,
            //take,
            //cursor,
            //where,
            //orderBy,
        });
    }
    findOne(id: number) {
        return this.db.user.findUnique({
            where: {
                id,
            },
        });
    }
    findByEmail(email: string) {
        return this.db.user.findFirst({
            where: {
                email,
            },
        });
    }
    findByUsername(username: string) {
        return this.db.user.findFirst({
            where: {
                username,
            },
        });
    }
    findByEmailOrUsername(email: string, username: string) {
        return this.db.user.findFirst({
            where: {
                OR: [
                    {
                        email,
                    },
                    {
                        username,
                    },
                ],
            },
        });
    }
    search(query: string) {
        return this.db.user.findMany({
            where: {
                OR: [
                    {
                        email: {
                            contains: query,
                        },
                    },
                    {
                        username: {
                            contains: query,
                        },
                    },
                ],
            },
        });
    }
    
    async update(id: number, data: Prisma.UserUpdateInput) {
        return await this.db.user.update({
            data,
            where: {
                id,
            },
        });
    }
    remove(id: number) {
        return this.db.user.delete({
            where: {
                id,
            },
        });
    }
    formatUser(user: User) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            status: user.status,
        };
    }

    generateRandomString(length: number): string {
        const characters =
            '0123456789ABCDEFGHIJKLMNOPQRSTUVWYZ-_.abcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    }

    async getAllUsersSortedByPoints(){
        return this.db.user.findMany({
            orderBy: {
                points: 'desc',
            },
        });
    }
}
