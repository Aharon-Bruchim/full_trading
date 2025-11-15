from datetime import datetime
from trading_bots.bots.base_bot import BaseBot
from trading_bots.core import indicators, position_tracker

class ShortRipBot(BaseBot):
    
    def __init__(self, config, exchange_client, config_path, logger):
        super().__init__(config, exchange_client, config_path, logger)
        self.price_history = []
        self.current_atr = None
    
    def check_entry_signal(self, current_price: float, prev_price: float):
        self.price_history.append(current_price)
        if len(self.price_history) > self.config.atr_period + 1:
            self.price_history.pop(0)
        
        if self.config.use_atr and len(self.price_history) >= self.config.atr_period + 1:
            self.current_atr = indicators.calculate_atr(
                self.price_history, 
                self.config.atr_period
            )
            
            is_rip, price_rise = indicators.detect_rip_with_atr(
                current_price=current_price,
                prev_price=prev_price,
                atr=self.current_atr,
                k_factor=self.config.atr_multiplier
            )
            
            if is_rip:
                self.log.warning(
                    f"SELL SIGNAL (ATR): Rise ${price_rise:.2f} | "
                    f"ATR: ${self.current_atr:.2f} | "
                    f"Threshold: ${self.config.atr_multiplier * self.current_atr:.2f} | "
                    f"From ${prev_price:.4f} to ${current_price:.4f}"
                )
                self.execute_entry(current_price)
        else:
            is_rip, rise = indicators.detect_rip(current_price, prev_price, self.config.sell_threshold)
            
            if is_rip:
                self.log.warning(
                    f"SELL SIGNAL (Percentage): Rise {rise*100:.4f}% | "
                    f"From ${prev_price:.4f} to ${current_price:.4f}"
                )
                self.execute_entry(current_price)
    
    def execute_entry(self, current_price: float):
        current_position_size = self.calculate_current_position_size()
        
        can_trade, msg = self.risk_manager.can_open_new_trade(
            current_position_size,
            self.trades_executed_this_minute
        )
        
        if not can_trade:
            self.log.warning(msg)
            return False
        
        order = self.exchange.place_order(
            symbol=self.config.symbol,
            side='SELL',
            qty=self.config.quantity,
            order_type='MARKET',
            trade_side='OPEN'
        )
        
        if not order:
            self.log.warning("SELL order failed")
            return False
        
        fill_price = self.get_current_price() or current_price
        notional = self.config.quantity * fill_price
        sell_fee = notional * self.config.fee_rate_sell
        
        self.register_trade(order, fill_price, self.config.quantity, sell_fee)
        
        self.trades_executed_this_minute += 1
        return True
    
    def register_trade(self, order, fill_price, qty, sell_fee):
        target = fill_price * (1 - self.config.buy_threshold)
        
        trade = {
            'qty': float(qty),
            'target_price': float(target),
            'sell_order_id': order.get('id') if order else None,
            'sell_fill_price': float(fill_price),
            'sell_fee_usdt': float(sell_fee),
            'created_at': datetime.now()
        }
        
        self.open_trades.append(trade)
        self.log.info(f"Trade registered - Sell: ${fill_price:.4f}, Target: ${target:.4f}")
        self.save_state()
    
    def should_exit_trade(self, trade: dict, current_price: float) -> bool:
        return current_price <= trade['target_price']
    
    def execute_exit(self, trade: dict, current_price: float) -> bool:
        qty = trade.get('qty', self.config.quantity)
        
        positions = self.exchange.get_open_positions(self.config.symbol, self.config.trading_mode)
        
        if not positions:
            self.log.warning("No open positions to close")
            return False
        
        position = positions[0]
        position_qty = abs(float(position.get('qty', 0)))
        
        if position_qty <= 0:
            return False
        
        actual_qty = min(qty, position_qty)
        rounded_qty = self.exchange.round_quantity(actual_qty, self.lot_size)
        
        body_params = {
            'symbol': self.config.symbol,
            'side': 'BUY',
            'qty': rounded_qty,
            'order_type': 'MARKET'
        }
        
        if 'positionId' in position and position['positionId']:
            order = self.exchange.place_order(
                **body_params,
                trade_side='CLOSE',
                position_id=position['positionId']
            )
        else:
            order = self.exchange.place_order(
                **body_params,
                reduce_only=True
            )
        
        if not order:
            return False
        
        qty_bought = order.get('qty', rounded_qty * self.config.buy_percentage)
        
        pnl = position_tracker.calculate_profit(
            entry_price=trade['sell_fill_price'],
            exit_price=current_price,
            qty=qty_bought,
            entry_fee=trade.get('sell_fee_usdt', 0.0),
            exit_fee_rate=self.config.fee_rate_buy,
            is_long=False
        )
        
        self.total_realized_pnl += pnl
        
        self.log.info(
            f"TARGET HIT - Sell ${trade['sell_fill_price']:.4f} -> "
            f"Buy ${current_price:.4f} = PnL ${pnl:.7f}"
        )
        
        return True
    
    def close_position(self, qty: float) -> bool:
        positions = self.exchange.get_open_positions(self.config.symbol, self.config.trading_mode)
        
        if not positions:
            return False
        
        position = positions[0]
        rounded_qty = self.exchange.round_quantity(qty, self.lot_size)
        
        if 'positionId' in position and position['positionId']:
            order = self.exchange.place_order(
                symbol=self.config.symbol,
                side='BUY',
                qty=rounded_qty,
                trade_side='CLOSE',
                position_id=position['positionId']
            )
        else:
            order = self.exchange.place_order(
                symbol=self.config.symbol,
                side='BUY',
                qty=rounded_qty,
                reduce_only=True
            )
        
        return order is not None
    
    def calculate_trade_pnl(self, trade: dict, exit_price: float, qty: float) -> float:
        return position_tracker.calculate_profit(
            entry_price=trade['sell_fill_price'],
            exit_price=exit_price,
            qty=qty,
            entry_fee=trade.get('sell_fee_usdt', 0.0),
            exit_fee_rate=self.config.fee_rate_buy,
            is_long=False
        )
    
    def should_trigger_tp(self, current_price: float) -> bool:
        return current_price <= self.config.tp_price
    
    def should_trigger_sl(self, current_price: float) -> bool:
        return current_price >= self.config.sl_price
    
    def is_long_bot(self) -> bool:
        return False
    
    def get_exit_fee_rate(self) -> float:
        return self.config.fee_rate_buy