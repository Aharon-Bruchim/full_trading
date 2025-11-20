import { Router } from 'express';
import { signalsController } from './controller';

export const signalsRouter = Router();

signalsRouter.get('/', signalsController.getSignals);
