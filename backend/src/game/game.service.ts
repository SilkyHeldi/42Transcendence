import { Injectable } from '@nestjs/common';

import { DBService } from 'src/db/db.service';

@Injectable()
export class GameService {
    constructor(private db: DBService) {}

    async createChallenge(challengerId, challengedId) {
        //const challenge = await this.db.createChallenge(
        //    challengerId,
        //    challengedId,
        //);
        //return challenge;
    }
}
