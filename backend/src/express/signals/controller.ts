import { Request, Response } from 'express';
import { SignalsManager } from './manager';

export class signalsController {
    static getSignals = async (req: Request, res: Response): Promise<void | Response> => {
        try {
            const { symbol, timeframe = '1h', exchange = 'binance' } = req.query;

            if (!symbol || typeof symbol !== 'string') {
                return res.status(400).json({ error: 'Symbol is required' });
            }

            const result = await SignalsManager.getSignals(symbol, (timeframe as string) || '1h', (exchange as string) || 'binance');

            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message ?? 'Failed to analyze signal' });
        }
    };
}
