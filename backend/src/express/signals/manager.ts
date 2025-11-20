import axios from 'axios';
import { config } from '../../config';
import { Request } from 'express';

const PYTHON_SERVICE_URL = config.python.url;

export class SignalsManager {
    static async getSignals(symbol: string, timeframe: string, exchange: string, req: Request) {
        try {
            const token = req.headers.authorization;

            const response = await axios.get(`${PYTHON_SERVICE_URL}/api/signals`, {
                params: {
                    symbol,
                    timeframe,
                    exchange,
                },
                headers: {
                    Authorization: token,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching signal from Python server:', error);
            throw new Error('Failed to fetch signal');
        }
    }
}
