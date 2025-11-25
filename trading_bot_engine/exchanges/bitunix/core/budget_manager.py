from typing import Tuple, Optional
from models import BudgetConfig


class BudgetManager:
    def __init__(self, config: BudgetConfig, leverage: int):
        self.total_budget = config.allocated_amount
        self.max_position_pct = config.max_position_percentage
        self.position_sizing_config = config.position_sizing
        self.leverage = leverage
        
        self.used_budget = 0.0
    
    def allocate_for_trade(
        self,
        current_price: float,
        atr_drop_size: float,
        atr_percentage: float
    ) -> Tuple[float, Dict[str, Any]]:
        budget_pct = self._get_budget_percentage(atr_drop_size)
        
        volatility_adj = self._get_volatility_adjustment(atr_percentage)
        adjusted_pct = budget_pct * volatility_adj
        
        remaining = self.get_remaining_budget()
        
        position_value = remaining * adjusted_pct * self.leverage
        quantity = position_value / current_price
        
        actual_cost = position_value / self.leverage
        
        return quantity, {
            'budget_percentage': budget_pct,
            'volatility_adjustment': volatility_adj,
            'adjusted_percentage': adjusted_pct,
            'position_value': position_value,
            'actual_cost': actual_cost
        }
    
    def _get_budget_percentage(self, atr_drop_size: float) -> float:
        for level in self.position_sizing_config.levels:
            if atr_drop_size >= level.atr_multiplier:
                return level.budget_percentage
        
        return 0.03
    
    def _get_volatility_adjustment(self, atr_percentage: float) -> float:
        if atr_percentage > 3.0:
            return 0.7
        elif atr_percentage > 2.0:
            return 0.85
        else:
            return 1.0
    
    def reserve_budget(self, amount: float):
        self.used_budget += amount
    
    def release_budget(self, amount: float):
        self.used_budget -= amount
        self.used_budget = max(0.0, self.used_budget)
    
    def get_remaining_budget(self) -> float:
        return self.total_budget - self.used_budget
    
    def get_used_budget(self) -> float:
        return self.used_budget
    
    def can_open_trade(self, required_amount: float) -> Tuple[bool, str]:
        remaining = self.get_remaining_budget()
        
        if required_amount > remaining:
            return False, f"Insufficient budget. Required: ${required_amount:.2f}, Available: ${remaining:.2f}"
        
        max_position_value = self.total_budget * self.max_position_pct
        
        if self.used_budget >= max_position_value:
            return False, f"Max position size reached (${max_position_value:.2f})"
        
        return True, "OK"
