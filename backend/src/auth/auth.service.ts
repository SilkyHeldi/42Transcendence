import {
    Injectable,
    UnauthorizedException,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { DBService } from 'src/db/db.service';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { SetupDto } from './dto/setup.dto';
import * as fs from 'fs';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async signup(credentials: SignUpDto) {
        if (!credentials.email) {
            throw new HttpException(
                'Email is required.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        if (!credentials.password) {
            throw new HttpException(
                'Password is required.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        credentials.username =
            credentials.email.split('@')[0] +
            '_' +
            Math.floor(Math.random() * 10000);

        const exists = await this.usersService.findByEmailOrUsername(
            credentials.email,
            credentials.username,
        );
        if (exists && exists.email === credentials.email) {
            throw new HttpException(
                'Email is already taken.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        if (exists && exists.username === credentials.username) {
            throw new HttpException(
                'Username is already taken.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        const user = await this.usersService.create(credentials);

        return user;
    }
    async setup(user: any, username: string, avatar?: Express.Multer.File) {
        if (!username) {
            throw new HttpException(
                'Username is required.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        const payload = {
            username,
            isSetup: true,
        };
        if (avatar) {
            payload['avatar'] = this.saveAvatar(user, avatar);
        }

        await this.usersService.update(user.id, payload);
        return true;
    }

    saveAvatar(user: any, avatar?: Express.Multer.File) {
        if (avatar) {
            if (avatar.size > 1000000) {
                throw new HttpException(
                    'Avatar is too large.',
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            }
            if (
                avatar.mimetype !== 'image/png' &&
                avatar.mimetype !== 'image/jpeg'
            ) {
                throw new HttpException(
                    'Avatar must be a PNG or JPEG.',
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            }
            const avatarPath =
                '/backend/avatars/' +
                user.id +
                (avatar.mimetype == 'image/png' ? '.png' : '.jpg');
            fs.writeFileSync(avatarPath, avatar.buffer);
            return avatarPath.replace('/backend', '');
        }
    }

    getUserPayload(user, provider) {
        return {
            id: user.id,
            provider,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            mfaEnabled: user.mfaEnabled,
            isSetup: user.isSetup,
            mfaLevel: 1,
        };
    }

    async validateUser(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return null;
        }
        if (!bcrypt.compareSync(password, user.password)) {
            return null;
        }
        return user;
    }

    async validateToken(token: string) {
        return this.jwtService.verify(token);
    }

    async login(user: any) {
        const payload = this.getUserPayload(user, 'credentials');
        const access_token = await this.jwtService.signAsync(payload);
        return {
            access_token: access_token,
        };
    }

    async login42(user: any) {
        if (!user) {
            return false;
        }

        let account = await this.usersService.findByEmail(user.email);

        if (!account) {
            account = await this.signup({
                email: user.email,
                username: user.username,
                password: this.usersService.generateRandomString(24),
            });

            await this.usersService.update(account.id, {
                avatar: user.picture,
            });
        }

        const payload = await this.getUserPayload(account, '42');

        const access_token = await this.jwtService.signAsync(payload);

        return {
            access_token: access_token,
        };
    }

    async getUser2FASeed(user: any) {
        const account = await this.usersService.findOne(user.id);
        if (!account.mfaSecret) {
            account.mfaSecret = speakeasy.generateSecret({ length: 24 }).base32;
            await this.usersService.update(user.id, {
                mfaSecret: account.mfaSecret,
            });
        }
        return account.mfaSecret;
    }
    async update(user, data) {
        const account = await this.usersService.findOne(user.id);
        if (!account) {
            throw new HttpException(
                'User not found.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        if (data.email != account.email) {
            const exists = await this.usersService.findByEmail(data.email);
            if (exists) {
                throw new HttpException(
                    'Email is already taken.',
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            }
        }

        if (data.username != account.username) {
            const exists = await this.usersService.findByUsername(
                data.username,
            );
            if (exists) {
                throw new HttpException(
                    'Username is already taken.',
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            }
        }

        // check password
        //if (!bcrypt.compareSync(data.password, account.password)) {
        //    throw new HttpException(
        //        'Password is incorrect.',
        //        HttpStatus.UNPROCESSABLE_ENTITY,
        //    );
        //}
        //let newPassword = undefined;

        //if (data.changePassword == 'true') {
        //    if (data.newPassword !== data.newPasswordConfirmation) {
        //        throw new HttpException(
        //            'Passwords do not match.',
        //            HttpStatus.UNPROCESSABLE_ENTITY,
        //        );
        //    }
        //    newPassword = bcrypt.hashSync(data.newPassword, 10);
        //}

        let mfaSecret = undefined;
        let mfaEnabled = undefined;

        if (data.mfaEnabled == 'true') {
            if (!data.mfaCode) {
                throw new HttpException(
                    '2FA code is required.',
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            }
            const verified = speakeasy.totp.verify({
                secret: account.mfaSecret,
                encoding: 'base32',
                token: data.mfaCode,
                window: 5,
            });

            if (!verified) {
                throw new HttpException(
                    'Invalid two-factor code.',
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            }

            mfaEnabled = true;
        } else if (data.mfaEnabled == 'false') {
            mfaEnabled = false;
            mfaSecret = null;
        }

        let newAvatar = undefined;
        if (typeof data.avatar != 'string') {
            newAvatar = this.saveAvatar(user, data.avatar);
        } else {
            newAvatar = data.avatar;
        }

        const updatedUser = await this.usersService.update(user.id, {
            email: data.email,
            username: data.username,
            //password: newPassword,
            avatar: newAvatar,
            mfaSecret,
            mfaEnabled,
        });
    }

    async verify2FA(user, twoFactorCode: string): Promise<any> {
        const account = await this.usersService.findOne(user.id);
        if (!account.mfaSecret) {
            throw new HttpException(
                'User does not have 2FA secret.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        const verified = speakeasy.totp.verify({
            secret: account.mfaSecret,
            encoding: 'base32',
            token: twoFactorCode,
            window: 5,
        });

        if (!verified) {
            throw new HttpException(
                'Invalid two-factor code.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        const payload = await this.getUserPayload(account, user.provider);
        payload.mfaLevel = 2;

        const access_token = await this.jwtService.signAsync(payload);

        return {
            access_token: access_token,
        };
    }
}
