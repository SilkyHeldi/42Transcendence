import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    const data = request?.cookies['access_token'];
                    if (!data) {
                        return null;
                    }
                    return data;
                },
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    // Use token data to form req.user
    // We might add more fields to req.user later or fetch user model from db
    async validate(payload: any) {
        return {
            id: payload.id,
            provider: payload.provider,
            username: payload.username,
            email: payload.email,
            avatar: payload.avatar,
            mfaEnabled: payload.mfaEnabled,
            mfaLevel: payload.mfaLevel,
        };
    }
}
