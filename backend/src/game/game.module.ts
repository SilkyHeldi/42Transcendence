import { Module } from '@nestjs/common';
import { GameService } from './game.service';

import { DBModule } from 'src/db/db.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [UsersModule, DBModule],
    providers: [GameService],
})
export class GameModule {}
