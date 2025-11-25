from datetime import datetime, timedelta
from typing import List, Optional
from models import Candle


class CandleManager:
    def __init__(self, timeframe: str):
        self.timeframe = timeframe
        self.candles: List[Candle] = []
        self.current_candle: Optional[Candle] = None
        self.last_candle_close_time: Optional[datetime] = None
        
        self.timeframe_seconds = self._parse_timeframe(timeframe)
    
    def _parse_timeframe(self, timeframe: str) -> int:
        timeframes = {
            '1m': 60,
            '5m': 300,
            '15m': 900,
            '30m': 1800,
            '1h': 3600,
            '4h': 14400,
            '1d': 86400
        }
        
        return timeframes.get(timeframe, 900)
    
    def update(self, current_price: float, timestamp: datetime = None):
        if timestamp is None:
            timestamp = datetime.utcnow()
        
        if self.last_candle_close_time is None:
            self.last_candle_close_time = timestamp
            self.current_candle = Candle(
                open=current_price,
                high=current_price,
                low=current_price,
                close=current_price,
                timestamp=timestamp
            )
            return
        
        seconds_since_last = (timestamp - self.last_candle_close_time).total_seconds()
        
        if seconds_since_last < self.timeframe_seconds:
            self.current_candle.high = max(self.current_candle.high, current_price)
            self.current_candle.low = min(self.current_candle.low, current_price)
            self.current_candle.close = current_price
        
        else:
            self.candles.append(self.current_candle)
            
            if len(self.candles) > 100:
                self.candles.pop(0)
            
            self.current_candle = Candle(
                open=current_price,
                high=current_price,
                low=current_price,
                close=current_price,
                timestamp=timestamp
            )
            self.last_candle_close_time = timestamp
    
    def get_completed_candles(self, n: int = 20) -> List[Candle]:
        return self.candles[-n:]
    
    def get_current_candle(self) -> Optional[Candle]:
        return self.current_candle
    
    def is_candle_ready(self) -> bool:
        return len(self.candles) > 0
