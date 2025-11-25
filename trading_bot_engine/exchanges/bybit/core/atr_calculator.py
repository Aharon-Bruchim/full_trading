from typing import List, Optional
from models import Candle
from shared.indicators import calculate_atr


class ATRCalculator:
    def __init__(self, period: int, multiplier: float):
        self.period = period
        self.multiplier = multiplier
        self.atr: Optional[float] = None
        self.atr_percentage: Optional[float] = None
    
    def update(self, candles: List[Candle], current_price: float):
        if len(candles) < self.period + 1:
            self.atr = None
            self.atr_percentage = None
            return
        
        self.atr = calculate_atr(candles, self.period)
        
        if self.atr and current_price > 0:
            self.atr_percentage = (self.atr / current_price) * 100
    
    def get_atr(self) -> Optional[float]:
        return self.atr
    
    def get_atr_percentage(self) -> Optional[float]:
        return self.atr_percentage
    
    def calculate_trigger(self, current_multiplier: float = None) -> Optional[float]:
        if self.atr is None:
            return None
        
        mult = current_multiplier if current_multiplier is not None else self.multiplier
        return self.atr * mult
    
    def is_ready(self) -> bool:
        return self.atr is not None
    
    def adjust_multiplier_by_volatility(self, base_multiplier: float) -> float:
        if not self.atr_percentage:
            return base_multiplier
        
        if self.atr_percentage > 3.0:
            return base_multiplier * 1.8
        elif self.atr_percentage > 2.0:
            return base_multiplier * 1.3
        elif self.atr_percentage < 1.0:
            return base_multiplier * 0.75
        
        return base_multiplier
