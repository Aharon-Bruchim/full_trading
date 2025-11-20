import { Router } from 'express';
import { authController } from './controller';

export const authRouter = Router();

authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);
