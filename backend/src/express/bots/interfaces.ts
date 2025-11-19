export enum BotStatus {
    RUNNING = 'RUNNING',
    STOPPED = 'STOPPED',
    ERROR = 'ERROR',
    STARTING = 'STARTING',
    STOPPING = 'STOPPING',
}

export enum BotType {
    TREND_LONG = 'TREND_LONG',
    TREND_SHORT = 'TREND_SHORT',
}

export interface BotConfig {
    exchange: string;
    symbol: string;
    leverage: number;
    positionSize: number;
    strategy: Record<string, any>;
    riskManagement: {
        maxDailyLoss: number;
        maxOpenPositions: number;
        stopLossPercent: number;
        takeProfitPercent: number;
    };
}

export interface Bot {
    id: string;
    name: string;
    type: BotType;
    exchange: string;
    status: BotStatus;
    config: BotConfig;
    createdAt: Date;
    updatedAt: Date;
    lastStartedAt?: Date;
    lastStoppedAt?: Date;
}

export interface BotStats {
    botId: string;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    totalPnL: number;
    todayPnL: number;
    winRate: number;
    averageWin: number;
    averageLoss: number;
    maxDrawdown: number;
    sharpeRatio: number;
    updatedAt: Date;
}

export interface BotCreateInput {
    name: string;
    type: BotType;
    exchange: string;
    config: BotConfig;
}

export interface BotDTO extends BotCreateInput {
    id: string;
    status: BotStatus;
    createdAt: Date;
    updatedAt: Date;
    lastStartedAt?: Date;
    lastStoppedAt?: Date;
}

export interface BotWithStats extends Bot {
    stats: BotStats | null;
    openPositions: number;
}
