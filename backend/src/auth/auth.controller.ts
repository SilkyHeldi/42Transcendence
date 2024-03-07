import {
    Controller,
    Post,
    Request,
    Get,
    Body,
    Res,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    HttpException,
    ValidationPipe,
    UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { sessionDto } from './dto/session.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';

import { Express } from 'express';
import * as fs from 'fs';
import { GoogleStrategy } from './google.strategy';
import { FortyTwoStrategy } from './intra42.strategy';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { FortyTwoAuthGuard } from './42.guard';
import { FADTO, SetupDto } from './dto/setup.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Post('signup')
    @UsePipes()
    async signup(@Body(new ValidationPipe()) signupDto: SignUpDto) {
        const createdUser = await this.authService.signup(signupDto);

        if (!createdUser) {
            throw new HttpException('User not created', 401);
        }
        return {
            success: true,
            message: 'User created',
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('setup')
    @UseInterceptors(FileInterceptor('avatar'))
    async setup(
        @Request() req,
        @Body(new ValidationPipe()) setupDto: SetupDto,
        @UploadedFile() avatar: Express.Multer.File,
    ) {
        const setupUser = await this.authService.setup(
            req.user,
            setupDto?.username,
            avatar,
        );
        if (!setupUser) {
            throw new HttpException('User not setup', 401);
        }
    }

    @UseGuards(LocalAuthGuard) // Will use email/pass to retrieve user (look at LocalStrategy) or throw if not valid/found
    @Post('login')
    async login(@Request() req, @Res({ passthrough: true }) res: Response) {
        const data = await this.authService.login(req.user); // req.user is the user returned from LocalStrategy.validate()
        if (data?.access_token) {
            res.cookie('access_token', data.access_token, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 7,
            });
            res.send(data);
        }
    }

    //42 Login
    @Get('42/callback')
    @UseGuards(FortyTwoAuthGuard)
    async Auth42Redirect(
        @Request() req,
        @Res({ passthrough: true }) res: Response,
    ) {
        const userAccount = await this.authService.login42(req.user);

        if (userAccount == false) {
            throw new HttpException('Cannot get user info from 42 ?', 401);
        }

        res.cookie('access_token', userAccount.access_token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        res.redirect(`http://${process.env.BACKEND_IP}:3000/`);
    }

    @UseGuards(JwtAuthGuard)
    @Get('session')
    async session(@Request() req, @Res({ passthrough: true }) res: Response) {
        const user = await this.usersService.findOne(req.user.id);

        if (!user) return this.logout(req, res);
        return {
            id: user.id,
            provider: req.user.provider,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            isSetup: user.isSetup,
            mfaEnabled: user.mfaEnabled,
            mfaLevel: req.user.mfaLevel,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token');
    }

    @UseGuards(JwtAuthGuard)
    @Get('2FA-setup')
    async setup2FA(@Request() req) {
        const mfaSecret = await this.authService.getUser2FASeed(req.user);
        if (mfaSecret == null) {
        }

        return {
            mfaSeed: mfaSecret,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('2FA-verify')
    async verify2FA(
        @Request() req,
        @Body(new ValidationPipe()) requestBody: FADTO,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { code } = requestBody;

        const { access_token } = await this.authService.verify2FA(
            req.user,
            code,
        );
        if (access_token) {
            res.cookie('access_token', access_token, {
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 7,
            });
            res.send({ access_token });
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('update')
    @UseInterceptors(FileInterceptor('avatar'))
    async update(
        @Request() req,
        @Body(new ValidationPipe()) payload: UpdateUserDto,
        @UploadedFile() avatar: Express.Multer.File,
        @Res({ passthrough: true }) res: Response,
    ) {
        if (avatar) {
            payload.avatar = avatar as Express.Multer.File;
        }

        await this.authService.update(req.user, payload);

        return {
            success: true,
            message: 'User updated',
        };
    }
}
