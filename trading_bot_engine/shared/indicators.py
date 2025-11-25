from typing import List, Tuple
from models import Candle


def calculate_atr(candles: List[Candle], period: int = 14) -> float:
    if len(candles) < period + 1:
        return None
    
    true_ranges = []
    
    for i in range(1, len(candles)):
        current = candles[i]
        previous = candles[i - 1]
        
        tr = max(
            current.high - current.low,
            abs(current.high - previous.close),
            abs(current.low - previous.close)
        )
        
        true_ranges.append(tr)
    
    recent_trs = true_ranges[-period:]
    atr = sum(recent_trs) / len(recent_trs)
    
    return atr


def calculate_atr_from_prices(prices: List[float], period: int = 14) -> float:
    if len(prices) < period + 1:
        return None
    
    true_ranges = []
    
    for i in range(1, len(prices)):
        tr = abs(prices[i] - prices[i - 1])
        true_ranges.append(tr)
    
    recent_trs = true_ranges[-period:]
    atr = sum(recent_trs) / len(recent_trs)
    
    return atr


def detect_dip(current_price: float, prev_price: float, threshold: float) -> Tuple[bool, float]:
    price_drop = prev_price - current_price
    
    if price_drop >= threshold:
        drop_percentage = price_drop / prev_price
        return True, drop_percentage
    
    return False, 0.0


def detect_rip(current_price: float, prev_price: float, threshold: float) -> Tuple[bool, float]:
    price_rise = current_price - prev_price
    
    if price_rise >= threshold:
        rise_percentage = price_rise / prev_price
        return True, rise_percentage
    
    return False, 0.0


def calculate_profit(
    entry_price: float,
    exit_price: float,
    qty: float,
    entry_fee: float,
    exit_fee_rate: float,
    is_long: bool
) -> float:
    if is_long:
        gross_profit = (exit_price - entry_price) * qty
    else:
        gross_profit = (entry_price - exit_price) * qty
    
    exit_fee = (exit_price * qty) * exit_fee_rate
    net_profit = gross_profit - entry_fee - exit_fee
    
    return net_profit
