import { Router } from 'express';
import { botsRouter } from './bots/router';
import { positionsRouter } from './positions/router';
import { tradesRouter } from './trades/router';
import { statsRouter } from './stats/router';
import { balanceRouter } from './balance/router';
import { signalsRouter } from './signals/router';

export const appRouter = Router();

appRouter.use('/api/bots', botsRouter);
appRouter.use('/api/positions', positionsRouter);
appRouter.use('/api/trades', tradesRouter);
appRouter.use('/api/stats', statsRouter);
appRouter.use('/api/balances', balanceRouter);
appRouter.use('/api/signals', signalsRouter);

appRouter.use(['/isAlive', '/isalive', '/health'], (_req, res) => {
    res.status(200).send('alive');
});

appRouter.use((_req, res) => {
    res.status(404).send('Invalid Route');
});
