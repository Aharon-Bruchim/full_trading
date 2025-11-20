import dotenv from 'dotenv';
import env from 'env-var';

dotenv.config();

export const config = {
    service: {
        port: env.get('PORT').required().asPortNumber(),
    },
    mongo: {
        uri: env.get('MONGO_URI').required().asString(),
    },
    bots: {
        botsCollectionName: env.get('BOTS_COLLECTION').required().asString(),
        botsStatsCollectionName: env.get('BOTS_STATS_COLLECTION').required().asString(),
    },
    trades: {
        tradesCollectionName: env.get('TRADES_COLLECTION').required().asString(),
    },
    positions: {
        positionsCollectionName: env.get('POSITIONS_COLLECTION').required().asString(),
    },
    cors: {
        origin: env.get('CORS_ORIGIN').required().asString(),
    },
    python: {
        url: env.get('PYTHON_SERVICE_URL').required().asString(),
    },
    jwt: {
        secret: env.get('JWT_SECRET').required().asString(),
    },
};
