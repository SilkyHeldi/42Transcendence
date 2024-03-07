import { tSThisType } from '@babel/types';

export class PongGame {
    id: string;
    playersIds: number[] = [];
    players: any[] = [];
    connected: number[] = [];
    db: any;
    state: any;
    isPaused: boolean;
    send: (type: string, data: any) => void;
    endGame: (gameId: string) => void;
    constructor(config, send, endGame) {
        this.db = config.db;
        this.id = config.id;
        this.playersIds = config.playersIds;
        this.players = config.players;
        this.connected = [];
        this.state = config.state;
        this.isPaused = true;
        this.send = send;
        this.endGame = endGame;
        if (this.state.status == 'finished') {
            this.endGame(this.id);
        }
        this.init();
    }

    async save() {
        const exists = await this.db.game.findUnique({
            where: {
                id: this.id,
            },
        });
        if (!exists) return;
        await this.db.game.update({
            where: {
                id: this.id,
            },
            data: {
                state: this.state,
            },
        });
    }

    async init() {
        if (!this.state.left || !Object.keys(this.state.left).length) {
            const [left, right] =
                Math.random() > 0.5
                    ? [this.playersIds[0], this.playersIds[1]]
                    : [this.playersIds[1], this.playersIds[0]];

            this.state = {
                status: 'waiting',
                ball: {
                    x: 400,
                    y: 250,
                    h: 15,
                    w: 15,
                    vx: Math.random() > 0.5 ? 3 : -3,
                    vy: Math.random() > 0.5 ? 3 : -3,
                    color: 'white',
                },
                left: {
                    userId: left,
                    ready: false,
                    user: this.players.find((p) => p.id === left),
                    x: 800,
                    y: 250,
                    w: 15,
                    h: 100,
                    color: 'white',
                    score: 0,
                },
                right: {
                    userId: right,
                    ready: false,
                    user: this.players.find((p) => p.id === right),
                    x: 0,
                    y: 250,
                    w: 15,
                    h: 100,
                    color: 'white',
                    score: 0,
                },
            };
            await this.save();
        }

        if (this.connected.length === this.playersIds.length) {
            this.getReady();
        }

        // Start the game by sending all players to the game page
        this.send('game:start', this.id);
    }
    async onDisconnect(userId) {
        if (this.connected.includes(userId)) {
            this.connected = this.connected.filter((id) => id !== userId);
        }

        this.isPaused = true;
        const side = this.state.left.userId === userId ? 'left' : 'right';
        this.state[side].user.status = 'offline';
        this.state[side].user.online = false;
        this.state[side].ready = false;
        this.state.left.ready = false;
        this.state.right.ready = false;
        this.state.status = 'waiting';

        await this.save();
        //this.state.status = 'idle';

        this.send('game:state', this.state);
    }

    async connect(userId) {
        if (this.state.status == 'finished') {
            this.endGame(this.id);
        }
        if (
            !this.connected.includes(userId) &&
            this.playersIds.includes(userId)
        ) {
            this.connected.push(userId);
            const side = this.state.left.userId === userId ? 'left' : 'right';
            this.state[side].user.status = 'online';
            this.state[side].user.online = true;
            await this.save();
        }

        if (this.connected.length === this.playersIds.length) {
            this.getReady();
        }

        this.send('game:state', this.state);
    }

    async getReady() {
        // Send all players to the game page
        if (this.state.status == 'finished') return;
        this.state.status = 'ready';
        await this.save();
        this.send('game:ready', {});
        //const interval = setInterval(() => {

        //}, 1000);
        if (
            this.state.left.ready &&
            this.state.right.ready &&
            this.state.status === 'ready'
        ) {
            //clearInterval(interval);
            if (this.isPaused) this.start();
        }
        // Check if all users are ready
    }

    setReady(userId) {
        if (this.playersIds.includes(userId)) {
            const side = this.state.left.userId === userId ? 'left' : 'right';
            this.state[side].ready = true;
            this.send('game:state', this.state);
        }

        if (
            this.state.left.ready &&
            this.state.right.ready &&
            this.state.status === 'ready'
        ) {
            if (this.isPaused) this.start();
        }
    }

    async endRound(winner, side) {
        winner.score += 1;
        this.isPaused = true;
        this.state.ball = {
            x: 400,
            y: 250,
            h: 15,
            w: 15,
            vx: side == 'left' ? 3 : -3,
            vy: Math.random() > 0.5 ? 3 : -3,
            color: 'white',
        };
        this.isPaused = false;
        const leftScore = this.state.left.score;
        const rightScore = this.state.right.score;
        if (leftScore >= 5 || rightScore >= 5) {
            this.state.status = 'finished';
            await this.finish();
            return;
        }
    }

    async start() {
        // Send all players to the game page
        if (this.state.status == 'started') return;
        if (!this.isPaused) return;
        this.state.status = 'started';
        this.isPaused = false;

        await this.save();
        this.send('game:state', this.state);
        //return this.getReady();
        while (!this.isPaused) {
            this.state.ball.x += this.state.ball.vx;
            this.state.ball.y += this.state.ball.vy;

            if (this.state.ball.x > 772.5) {
                if (this.state.ball.x > 800) {
                    await this.endRound(this.state.right, 'right');
                    continue;
                } else {
                    // check collision for left paddle

                    // balle.y is reverse to 500 is top and 0 is bottom
                    // this.state.left.y is top of paddle
                    // bottom paddle is this.state.left.y + 100
                    // Check if ball is within paddle
                    if (
                        Math.abs(500 - this.state.ball.y) + 55 >
                        this.state.left.y
                    ) {
                        if (
                            Math.abs(500 - this.state.ball.y) + 55 <
                            this.state.left.y + 100
                        ) {
                            this.state.ball.vx = -Math.abs(this.state.ball.vx);
                        }
                    }
                }
            }
            if (this.state.ball.x < 27.5) {
                if (this.state.ball.x < 0) {
                    await this.endRound(this.state.left, 'left');
                    continue;
                } else {
                    // check collision for left paddle

                    // balle.y is reverse to 500 is top and 0 is bottom
                    // this.state.right.y is top of paddle
                    // bottom paddle is this.state.right.y + 100
                    // Check if ball is within paddle
                    if (
                        Math.abs(500 - this.state.ball.y) + 55 >
                        this.state.right.y
                    ) {
                        if (
                            //        vx: 6,
                            //        vy: 6,
                            Math.abs(500 - this.state.ball.y) + 55 <
                            this.state.right.y + 100
                        ) {
                            this.state.ball.vx = Math.abs(this.state.ball.vx);
                        }
                    }
                }
            }
            if (this.state.ball.x > 800) {
                await this.endRound(this.state.right, 'right');
                continue;
            }
            if (this.state.ball.x < 0) {
                await this.endRound(this.state.left, 'left');
                continue;
            }
            if (this.state.ball.y > 500) {
                this.state.ball.vy = -this.state.ball.vy;
            }

            if (this.state.ball.y < 15) {
                this.state.ball.vy = -this.state.ball.vy;
            }
            this.send('game:state', this.state);
            await new Promise((timeout) => setTimeout(timeout, 1000 / 60));
        }
    }

    isColliding(paddle) {
        // x1,
        const { x1, y1, w1, h1 } = {
            x1: Math.abs(500 - this.state.ball.x),
            y1: this.state.ball.y,
            w1: this.state.ball.w,
            h1: this.state.ball.h,
        };
        const { x2, y2, w2, h2 } = {
            x2: paddle.x,
            y2: paddle.y,
            w2: paddle.w,
            h2: paddle.h,
        };

        if (x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2) {
            return true;
        }

        return false;
    }
    async onQuit(userId) {
        this.isPaused = true;
        await this.finish(userId);
    }

    async onAFK(userId) {
        this.isPaused = true;
        const side = this.state.left.userId === userId ? 'left' : 'right';

        this.state[side].user.online = false;
        this.state[side].ready = false;
        this.state.left.ready = false;
        this.state.right.ready = false;
        this.state.status = 'waiting';
        this.send('game:state', this.state);
        await this.save();
        this.state.status = 'ready';
        this.send('game:state', this.state);
        await this.save();
    }

    async finish(userId?) {
        await this.save();
        this.isPaused = true;
        this.endGame(this.id);
    }

    async onMoveUp(userId) {
        if (this.playersIds.includes(userId)) {
            const side = this.state.left.userId === userId ? 'left' : 'right';
            this.state[side].y -= 10;
            if (this.state[side].y < 45) {
                this.state[side].y = 45;
            }
            this.send('game:state', this.state);
            await this.save();
        }
    }

    async onMoveDown(userId) {
        if (this.playersIds.includes(userId)) {
            const side = this.state.left.userId === userId ? 'left' : 'right';
            this.state[side].y += 10;
            if (this.state[side].y + 45 > 500) {
                this.state[side].y = 500 - 45;
            }

            this.send('game:state', this.state);
            await this.save();
        }
    }
}
