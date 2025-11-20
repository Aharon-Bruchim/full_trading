import { Request, Response } from 'express';
import { BalanceManager } from './manager';

export class balanceController {
    static getBalance = async (req: Request, res: Response) => {
        try {
            const result = await BalanceManager.getBalance(req);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message ?? 'Failed to fetch balance' });
        }
    };
}
