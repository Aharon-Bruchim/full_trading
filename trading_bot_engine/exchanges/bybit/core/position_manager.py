from typing import List, Dict, Optional
from datetime import datetime
from models import Position, Trade, Side, PositionStatus, TradeExitReason
from shared.indicators import calculate_profit


class PositionManager:
    def __init__(self, bot_id: str, user_id: str, fee_rate: float):
        self.bot_id = bot_id
        self.user_id = user_id
        self.fee_rate = fee_rate
        self.open_positions: List[Position] = []
    
    def add_position(
        self,
        symbol: str,
        side: Side,
        entry_price: float,
        quantity: float,
        target_price: float,
        stop_loss: float,
        atr_at_entry: float,
        entry_fee: float
    ) -> Position:
        position = Position(
            bot_id=self.bot_id,
            user_id=self.user_id,
            symbol=symbol,
            side=side,
            entry_price=entry_price,
            quantity=quantity,
            target_price=target_price,
            stop_loss=stop_loss,
            atr_at_entry=atr_at_entry,
            entry_fee=entry_fee,
            status=PositionStatus.OPEN,
            opened_at=datetime.utcnow()
        )
        
        self.open_positions.append(position)
        return position
    
    def close_position(
        self,
        position: Position,
        exit_price: float,
        exit_reason: TradeExitReason
    ) -> Trade:
        is_long = position.side in [Side.LONG, Side.BUY]
        
        pnl = calculate_profit(
            entry_price=position.entry_price,
            exit_price=exit_price,
            qty=position.quantity,
            entry_fee=position.entry_fee,
            exit_fee_rate=self.fee_rate,
            is_long=is_long
        )
        
        exit_fee = (exit_price * position.quantity) * self.fee_rate
        
        pnl_percentage = (pnl / (position.entry_price * position.quantity)) * 100
        
        closed_at = datetime.utcnow()
        duration = (closed_at - position.opened_at).total_seconds() / 60
        
        trade = Trade(
            bot_id=self.bot_id,
            user_id=self.user_id,
            position_id=position.id or "temp",
            symbol=position.symbol,
            side=position.side,
            entry_price=position.entry_price,
            exit_price=exit_price,
            quantity=position.quantity,
            pnl=pnl + position.entry_fee + exit_fee,
            pnl_percentage=pnl_percentage,
            entry_fee=position.entry_fee,
            exit_fee=exit_fee,
            net_pnl=pnl,
            opened_at=position.opened_at,
            closed_at=closed_at,
            duration_minutes=int(duration),
            exit_reason=exit_reason
        )
        
        position.status = PositionStatus.CLOSED
        position.closed_at = closed_at
        
        if position in self.open_positions:
            self.open_positions.remove(position)
        
        return trade
    
    def update_trailing_stop(self, position: Position, current_price: float, atr: float, activation_mult: float, trail_mult: float):
        is_long = position.side in [Side.LONG, Side.BUY]
        
        if is_long:
            profit = current_price - position.entry_price
            activation_threshold = atr * activation_mult
            
            if profit >= activation_threshold:
                new_trailing_stop = current_price - (atr * trail_mult)
                
                if position.trailing_stop is None or new_trailing_stop > position.trailing_stop:
                    position.trailing_stop = new_trailing_stop
        
        else:
            profit = position.entry_price - current_price
            activation_threshold = atr * activation_mult
            
            if profit >= activation_threshold:
                new_trailing_stop = current_price + (atr * trail_mult)
                
                if position.trailing_stop is None or new_trailing_stop < position.trailing_stop:
                    position.trailing_stop = new_trailing_stop
    
    def get_open_positions(self) -> List[Position]:
        return self.open_positions
    
    def get_total_position_size(self, current_price: float) -> float:
        total = 0.0
        for position in self.open_positions:
            total += position.quantity * current_price
        return total
    
    def calculate_unrealized_pnl(self, current_price: float) -> float:
        total_pnl = 0.0
        
        for position in self.open_positions:
            is_long = position.side in [Side.LONG, Side.BUY]
            
            pnl = calculate_profit(
                entry_price=position.entry_price,
                exit_price=current_price,
                qty=position.quantity,
                entry_fee=position.entry_fee,
                exit_fee_rate=self.fee_rate,
                is_long=is_long
            )
            
            total_pnl += pnl
        
        return total_pnl
