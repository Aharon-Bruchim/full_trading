import { Request, Response } from 'express';
import { AuthManager } from './manager';

export class authController {
    static login = async (req: Request, res: Response): Promise<void | Response> => {
        try {
            const { password } = req.body;

            if (!password) {
                return res.status(400).json({ error: 'Password is required' });
            }

            const result = await AuthManager.login(password);
            res.json(result);
        } catch (error: any) {
            console.error('Login error:', error);
            res.status(401).json({ error: error.message ?? 'Invalid password' });
        }
    };

    static logout = (_req: Request, res: Response) => {
        res.json({ message: 'Logged out successfully' });
    };
}
