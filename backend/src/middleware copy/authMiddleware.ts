import { Request, Response, NextFunction } from 'express';
import { AuthManager } from '../express/auth/manager';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void | Response => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.replace('Bearer ', '');

        const decoded = AuthManager.verifyToken(token);

        (req as any).user = decoded;

        next();
    } catch (error: any) {
        return res.status(401).json({ error: 'Invalid or expired token', details: error.message });
    }
};
