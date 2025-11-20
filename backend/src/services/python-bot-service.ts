import axios from 'axios';
import { config } from '../config';
import { Request } from 'express';

const PYTHON_SERVICE_URL = config.python.url;

export class PythonBotService {
    static async startBot(botId: string, req?: Request): Promise<any> {
        try {
            const token = req?.headers.authorization;

            const response = await axios.post(
                `${PYTHON_SERVICE_URL}/api/bots/start`,
                { bot_id: botId },
                {
                    timeout: 5000,
                    headers: token ? { Authorization: token } : {},
                },
            );

            console.log(`✅ Bot ${botId} started successfully`);
            return response.data;
        } catch (error: any) {
            console.error(`❌ Failed to start bot ${botId}:`, error.message);
            throw new Error(`Failed to start bot in Python service: ${error.message}`);
        }
    }

    static async stopBot(botId: string, req?: Request): Promise<any> {
        try {
            const token = req?.headers.authorization;

            const response = await axios.post(
                `${PYTHON_SERVICE_URL}/api/bots/${botId}/stop`,
                {},
                {
                    timeout: 5000,
                    headers: token ? { Authorization: token } : {},
                },
            );

            console.log(`✅ Bot ${botId} stopped successfully`);
            return response.data;
        } catch (error: any) {
            console.error(`❌ Failed to stop bot ${botId}:`, error.message);
            throw new Error(`Failed to stop bot in Python service: ${error.message}`);
        }
    }

    static async getBotStatus(botId: string, req?: Request): Promise<any> {
        try {
            const token = req?.headers.authorization;

            const response = await axios.get(`${PYTHON_SERVICE_URL}/api/bots/${botId}/status`, {
                timeout: 5000,
                headers: token ? { Authorization: token } : {},
            });
            return response.data;
        } catch (error: any) {
            console.error(`❌ Failed to get bot status ${botId}:`, error.message);
            throw new Error(`Failed to get bot status from Python service: ${error.message}`);
        }
    }

    static async getAllBots(req?: Request): Promise<any> {
        try {
            const token = req?.headers.authorization;

            const response = await axios.get(`${PYTHON_SERVICE_URL}/api/bots/`, {
                timeout: 5000,
                headers: token ? { Authorization: token } : {},
            });
            return response.data;
        } catch (error: any) {
            console.error('❌ Failed to get all bots:', error.message);
            throw new Error(`Failed to get all bots from Python service: ${error.message}`);
        }
    }
}
