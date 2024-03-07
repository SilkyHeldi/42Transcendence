import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { UsersModule } from 'src/users/users.module';
import { DBModule } from 'src/db/db.module';

@Module({
    imports: [UsersModule, DBModule],
    controllers: [],
    providers: [ChannelService],
    exports: [ChannelService],
})
export class ChannelModule {}
