from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class Side(str, Enum):
    LONG = "LONG"
    SHORT = "SHORT"
    BUY = "BUY"
    SELL = "SELL"


class PositionStatus(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"


class BotStatus(str, Enum):
    CREATED = "CREATED"
    RUNNING = "RUNNING"
    STOPPED = "STOPPED"
    PAUSED = "PAUSED"
    ERROR = "ERROR"


class TradeExitReason(str, Enum):
    TARGET = "TARGET"
    STOP_LOSS = "STOP_LOSS"
    TRAILING_STOP = "TRAILING_STOP"
    MANUAL = "MANUAL"
    BOT_STOPPED = "BOT_STOPPED"


class Candle(BaseModel):
    open: float
    high: float
    low: float
    close: float
    timestamp: datetime
    volume: Optional[float] = 0.0


class ATRConfig(BaseModel):
    enabled: bool = True
    period: int = 10
    entry_multiplier: float = 0.8
    target_multiplier: float = 1.0
    stop_loss_multiplier: float = 1.5
    dynamic_adjustment: Optional[Dict[str, Any]] = None


class PositionSizingLevel(BaseModel):
    atr_multiplier: float
    budget_percentage: float


class PositionSizingConfig(BaseModel):
    mode: str = "dip_size_based"
    levels: List[PositionSizingLevel]


class BudgetConfig(BaseModel):
    allocated_amount: float
    max_position_percentage: float = 0.50
    position_sizing: PositionSizingConfig


class RiskManagement(BaseModel):
    max_trades_per_minute: int = 1
    max_trades_per_hour: int = 3
    max_trades_per_day: int = 12
    max_daily_loss: Optional[float] = None
    max_concurrent_positions: int = 5
    bot_stop_loss: Optional[float] = None


class TrailingStopConfig(BaseModel):
    enabled: bool = False
    activation_atr_multiplier: float = 0.5
    trail_distance_atr_multiplier: float = 0.4


class ExitConfig(BaseModel):
    trailing_stop: TrailingStopConfig


class TimeframeConfig(BaseModel):
    candle_size: str = "15m"
    update_interval: int = 5


class TradingConfig(BaseModel):
    symbol: str
    mode: str = "ISOLATED"
    leverage: int = 10


class StrategyConfig(BaseModel):
    type: str
    direction: str


class BotConfig(BaseModel):
    bot_id: str
    exchange: str
    trading: TradingConfig
    timeframe: TimeframeConfig
    strategy: StrategyConfig
    atr: ATRConfig
    budget: BudgetConfig
    risk_management: RiskManagement
    exit: ExitConfig
    fees: Dict[str, float] = {"maker": 0.0002, "taker": 0.0006}


class Position(BaseModel):
    id: Optional[str] = None
    bot_id: str
    user_id: str
    symbol: str
    side: Side
    entry_price: float
    quantity: float
    target_price: float
    stop_loss: float
    trailing_stop: Optional[float] = None
    status: PositionStatus = PositionStatus.OPEN
    opened_at: datetime
    closed_at: Optional[datetime] = None
    atr_at_entry: float
    entry_fee: float


class Trade(BaseModel):
    bot_id: str
    user_id: str
    position_id: str
    symbol: str
    side: Side
    entry_price: float
    exit_price: float
    quantity: float
    pnl: float
    pnl_percentage: float
    entry_fee: float
    exit_fee: float
    net_pnl: float
    opened_at: datetime
    closed_at: datetime
    duration_minutes: int
    exit_reason: TradeExitReason


class Signal(BaseModel):
    type: Side
    price: float
    quantity: float
    target: float
    stop_loss: float
    atr: float
    atr_drop_size: float
    confidence: float = 1.0
