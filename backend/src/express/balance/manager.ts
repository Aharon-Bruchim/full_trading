import axios from 'axios';
import { config } from '../../config';
import { Request } from 'express';

const PYTHON_SERVICE_URL = config.python.url;

export class BalanceManager {
    static async getBalance(req: Request) {
        try {
            const token = req.headers.authorization;

            const response = await axios.get(`${PYTHON_SERVICE_URL}/api/balances/bitunix`, {
                headers: {
                    Authorization: token,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching balances from Python server:', error);
            throw new Error('Failed to fetch balances');
        }
    }
}
