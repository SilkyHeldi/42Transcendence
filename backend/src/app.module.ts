import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DBModule } from './db/db.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SocketsModule } from './sockets/sockets.module';
import { FriendModule } from './friend/friend.module';
//import { MatchmakingController } from './matchmaking/matchmaking.controller';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { GameService } from './game/game.service';
import { GameModule } from './game/game.module';

@Module({
    controllers: [AppController],
    providers: [AppService, GameService],
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DBModule,
        UsersModule,
        AuthModule,
        SocketsModule,
        FriendModule,
        MatchmakingModule,
        GameModule,
    ],
})
export class AppModule {}
