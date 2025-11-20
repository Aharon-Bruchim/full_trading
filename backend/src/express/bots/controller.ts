import { Response } from 'express';
import { TypedRequest } from '../../utils/zod';
import {
    createOneRequestSchema,
    deleteOneRequestSchema,
    getByIdRequestSchema,
    getByQueryRequestSchema,
    getCountRequestSchema,
    updateOneRequestSchema,
    startBotRequestSchema,
    stopBotRequestSchema,
    getBotStatsRequestSchema,
} from './validations';
import { BotManager } from './manager';

export class BotsController {
    static getByQuery = async (req: TypedRequest<typeof getByQueryRequestSchema>, res: Response) => {
        const { step, limit, ...query } = req.query;

        res.json(await BotManager.getByQuery(query, step, limit));
    };

    static getCount = async (req: TypedRequest<typeof getCountRequestSchema>, res: Response) => {
        res.json(await BotManager.getCount(req.query));
    };

    static getById = async (req: TypedRequest<typeof getByIdRequestSchema>, res: Response) => {
        res.json(await BotManager.getById(req.params.id));
    };

    static createOne = async (req: TypedRequest<typeof createOneRequestSchema>, res: Response) => {
        res.json(await BotManager.createOne(req.body, req));
    };

    static updateOne = async (req: TypedRequest<typeof updateOneRequestSchema>, res: Response) => {
        res.json(await BotManager.updateOne(req.params.id, req.body));
    };

    static deleteOne = async (req: TypedRequest<typeof deleteOneRequestSchema>, res: Response) => {
        res.json(await BotManager.deleteOne(req.params.id));
    };

    static startBot = async (req: TypedRequest<typeof startBotRequestSchema>, res: Response) => {
        res.json(await BotManager.startBot(req.params.id, req));
    };

    static stopBot = async (req: TypedRequest<typeof stopBotRequestSchema>, res: Response) => {
        res.json(await BotManager.stopBot(req.params.id, req));
    };

    static getBotStats = async (req: TypedRequest<typeof getBotStatsRequestSchema>, res: Response) => {
        res.json(await BotManager.getBotStats(req.params.id));
    };
}
