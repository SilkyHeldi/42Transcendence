import { Module } from '@nestjs/common';
import { SocketsGateway } from './sockets.gateway';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from 'src/users/users.module';
//import { SocketController } from './socket.controller';
import { ChannelModule } from 'src/channel/channel.module';
import { FriendModule } from 'src/friend/friend.module';
import { DBModule } from 'src/db/db.module';

@Module({
    imports: [AuthModule, UsersModule, ChannelModule, FriendModule, DBModule],
    providers: [SocketsGateway],
    controllers: [],
})
export class SocketsModule {}
