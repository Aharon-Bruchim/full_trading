import { Router } from 'express';
import { botsRouter } from './bots/router';
import { positionsRouter } from './positions/router';
import { tradesRouter } from './trades/router';
import { statsRouter } from './stats/router';
import { balanceRouter } from './balance/router';
import { signalsRouter } from './signals/router';
import { authRouter } from './auth/router';
import { authMiddleware } from 'src/middleware/authMiddleware';

export const appRouter = Router();

appRouter.use('/api/auth', authRouter);

appRouter.use('/api/bots', authMiddleware, botsRouter);
appRouter.use('/api/positions', authMiddleware, positionsRouter);
appRouter.use('/api/trades', authMiddleware, tradesRouter);
appRouter.use('/api/stats', authMiddleware, statsRouter);
appRouter.use('/api/balances', authMiddleware, balanceRouter);
appRouter.use('/api/signals', authMiddleware, signalsRouter);

appRouter.use(['/isAlive', '/isalive', '/health'], (_req, res) => {
    res.status(200).send('alive');
});

appRouter.use((_req, res) => {
    res.status(404).send('Invalid Route');
});
