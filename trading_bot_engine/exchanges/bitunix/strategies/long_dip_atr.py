from datetime import datetime
from typing import Optional, Tuple
import logging

from models import BotConfig, Signal, Side, Position, Trade, TradeExitReason
from .core.client import BitunixClient
from .core.candle_manager import CandleManager
from .core.atr_calculator import ATRCalculator
from .core.position_manager import PositionManager
from .core.budget_manager import BudgetManager


class LongDipATRStrategy:
    def __init__(self, config: BotConfig, client: BitunixClient, logger: logging.Logger):
        self.config = config
        self.client = client
        self.log = logger
        
        self.candle_manager = CandleManager(config.timeframe.candle_size)
        self.atr_calculator = ATRCalculator(
            period=config.atr.period,
            multiplier=config.atr.entry_multiplier
        )
        self.position_manager = PositionManager(
            bot_id=config.bot_id,
            user_id="",
            fee_rate=config.fees['taker']
        )
        self.budget_manager = BudgetManager(
            config=config.budget,
            leverage=config.trading.leverage
        )
        
        self.lot_size = self.client.get_lot_size_filter(config.trading.symbol)
        
        self.recent_high = None
        self.last_entry_check_time = datetime.utcnow()
    
    def update(self, current_price: float):
        self.candle_manager.update(current_price)
        
        if self.candle_manager.is_candle_ready():
            candles = self.candle_manager.get_completed_candles(self.config.atr.period + 1)
            self.atr_calculator.update(candles, current_price)
        
        if self.recent_high is None or current_price > self.recent_high:
            self.recent_high = current_price
    
    def check_entry_signal(self, current_price: float) -> Optional[Signal]:
        if not self.atr_calculator.is_ready():
            return None
        
        if self.recent_high is None:
            return None
        
        atr = self.atr_calculator.get_atr()
        atr_pct = self.atr_calculator.get_atr_percentage()
        
        adjusted_multiplier = self.atr_calculator.adjust_multiplier_by_volatility(
            self.config.atr.entry_multiplier
        )
        
        trigger = self.atr_calculator.calculate_trigger(adjusted_multiplier)
        
        price_drop = self.recent_high - current_price
        
        if price_drop >= trigger:
            atr_drop_size = price_drop / atr
            
            quantity, sizing_info = self.budget_manager.allocate_for_trade(
                current_price=current_price,
                atr_drop_size=atr_drop_size,
                atr_percentage=atr_pct
            )
            
            rounded_qty = self.client.round_quantity(quantity, self.lot_size)
            
            can_trade, msg = self.budget_manager.can_open_trade(sizing_info['actual_cost'])
            if not can_trade:
                self.log.warning(f"Cannot open trade: {msg}")
                return None
            
            target_price = current_price + (atr * self.config.atr.target_multiplier)
            stop_loss = current_price - (atr * self.config.atr.stop_loss_multiplier)
            
            return Signal(
                type=Side.BUY,
                price=current_price,
                quantity=rounded_qty,
                target=target_price,
                stop_loss=stop_loss,
                atr=atr,
                atr_drop_size=atr_drop_size
            )
        
        return None
    
    def execute_entry(self, signal: Signal) -> Optional[Position]:
        order = self.client.place_order(
            symbol=self.config.trading.symbol,
            side='BUY',
            qty=signal.quantity,
            order_type='MARKET',
            trade_side='OPEN'
        )
        
        if not order:
            self.log.error("Failed to place BUY order")
            return None
        
        fill_price = signal.price
        notional = signal.quantity * fill_price
        entry_fee = notional * self.config.fees['taker']
        
        position = self.position_manager.add_position(
            symbol=self.config.trading.symbol,
            side=Side.LONG,
            entry_price=fill_price,
            quantity=signal.quantity,
            target_price=signal.target,
            stop_loss=signal.stop_loss,
            atr_at_entry=signal.atr,
            entry_fee=entry_fee
        )
        
        actual_cost = (signal.quantity * fill_price) / self.config.trading.leverage
        self.budget_manager.reserve_budget(actual_cost)
        
        self.log.info(
            f"ENTRY: BUY {signal.quantity} @ ${fill_price:.2f} | "
            f"Target: ${signal.target:.2f} | Stop: ${signal.stop_loss:.2f} | "
            f"ATR Drop: {signal.atr_drop_size:.2f}x"
        )
        
        self.recent_high = fill_price
        
        return position
    
    def check_exit_signals(self, current_price: float) -> list:
        exits = []
        
        for position in self.position_manager.get_open_positions():
            should_exit, reason = self._should_exit_position(position, current_price)
            
            if should_exit:
                exits.append((position, reason))
        
        return exits
    
    def _should_exit_position(self, position: Position, current_price: float) -> Tuple[bool, TradeExitReason]:
        if current_price >= position.target_price:
            return True, TradeExitReason.TARGET
        
        if current_price <= position.stop_loss:
            return True, TradeExitReason.STOP_LOSS
        
        if self.config.exit.trailing_stop.enabled and position.trailing_stop:
            if current_price <= position.trailing_stop:
                return True, TradeExitReason.TRAILING_STOP
        
        return False, None
    
    def execute_exit(self, position: Position, current_price: float, reason: TradeExitReason) -> Optional[Trade]:
        order = self.client.place_order(
            symbol=self.config.trading.symbol,
            side='SELL',
            qty=position.quantity,
            order_type='MARKET',
            trade_side='CLOSE'
        )
        
        if not order:
            self.log.error("Failed to place SELL order")
            return None
        
        exit_price = current_price
        
        trade = self.position_manager.close_position(
            position=position,
            exit_price=exit_price,
            exit_reason=reason
        )
        
        actual_cost = (position.quantity * position.entry_price) / self.config.trading.leverage
        self.budget_manager.release_budget(actual_cost)
        
        self.log.info(
            f"EXIT ({reason.value}): SELL {position.quantity} @ ${exit_price:.2f} | "
            f"Entry: ${position.entry_price:.2f} | PnL: ${trade.net_pnl:.2f}"
        )
        
        return trade
    
    def update_trailing_stops(self, current_price: float):
        if not self.config.exit.trailing_stop.enabled:
            return
        
        if not self.atr_calculator.is_ready():
            return
        
        atr = self.atr_calculator.get_atr()
        ts_config = self.config.exit.trailing_stop
        
        for position in self.position_manager.get_open_positions():
            self.position_manager.update_trailing_stop(
                position=position,
                current_price=current_price,
                atr=atr,
                activation_mult=ts_config.activation_atr_multiplier,
                trail_mult=ts_config.trail_distance_atr_multiplier
            )
