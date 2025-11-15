import time
import sys
import signal
from datetime import datetime
from collections import deque
from abc import ABC, abstractmethod
import traceback

from trading_bots.core.config_loader import BotConfig, update_config_status
from trading_bots.core.persistence import save_state, load_state
from trading_bots.core.risk_manager import RiskManager
from trading_bots.core import position_tracker
from trading_bots.exchange.bitunix_client import BitunixClient

class BaseBot(ABC):
    def __init__(self, config: BotConfig, exchange_client: BitunixClient, config_path: str, logger):
        self.config = config
        self.exchange = exchange_client
        self.config_path = config_path
        self.log = logger
        
        self.lot_size = self.exchange.get_lot_size_filter(config.symbol)
        self.config.quantity = self.exchange.round_quantity(config.quantity, self.lot_size)
        
        self.risk_manager = RiskManager(
            max_trades_per_minute=config.max_trades_per_minute,
            position_size_limit=config.position_size_limit,
            bot_stop_loss=config.bot_sl
        )
        
        state = load_state(config.get_state_file_path())
        self.open_trades = state['open_trades']
        self.total_realized_pnl = state['total_realized_pnl']
        
        self.trades_executed_this_minute = 0
        self.last_status_report_time = datetime.now()
        self.bot_should_stop = False
        self.prev_price = None
        
        self._setup_signal_handlers()
        
        self.log.info("="*80)
        self.log.info(f"Bot Configuration:")
        self.log.info(f"  Bot ID: {config.bot_id}")
        self.log.info(f"  Client: {config.client_name}")
        self.log.info(f"  Symbol: {config.symbol}")
        self.log.info(f"  Mode: {config.trading_mode}")
        self.log.info(f"  Quantity: {config.quantity}")
        self.log.info("="*80)
        
        if config.tp_enabled and config.tp_price:
            self.log.info(f"Take Profit: ${config.tp_price:,.2f}")
        if config.sl_enabled and config.sl_price:
            self.log.info(f"Stop Loss: ${config.sl_price:,.2f}")
        if config.bot_sl:
            self.log.info(f"Bot Stop Loss: ${config.bot_sl:,.2f} PnL")
        
        self.log.info(f"Loaded {len(self.open_trades)} trades from file")
    
    def _setup_signal_handlers(self):
        def signal_handler(signum, frame):
            self.log.critical("="*80)
            self.log.critical(f" RECEIVED TERMINATION SIGNAL: {signum}")
            self.log.critical("="*80)
            sys.exit(1)
        
        signal.signal(signal.SIGTERM, signal_handler)
        signal.signal(signal.SIGINT, signal_handler)
        if hasattr(signal, 'SIGHUP'):
            signal.signal(signal.SIGHUP, signal_handler)
    
    def save_state(self):
        save_state(
            self.config.get_state_file_path(),
            self.open_trades,
            self.total_realized_pnl
        )
    
    def get_current_price(self):
        return self.exchange.get_ticker(self.config.symbol)
    
    def calculate_current_position_size(self):
        current_price = self.get_current_price()
        return position_tracker.get_current_position_size(self.open_trades, current_price)
    
    def calculate_total_pnl(self):
        current_price = self.get_current_price()
        return position_tracker.get_total_pnl(
            self.open_trades,
            self.total_realized_pnl,
            current_price,
            self.get_exit_fee_rate(),
            self.is_long_bot()
        )
    
    def check_tp_sl(self, current_price):
        if self.config.tp_enabled and self.config.tp_price:
            if self.should_trigger_tp(current_price):
                self.log.critical(f"TAKE PROFIT HIT: {current_price:.4f}")
                self.close_all_positions()
                self.stop_bot()
                return True
        
        if self.config.sl_enabled and self.config.sl_price:
            if self.should_trigger_sl(current_price):
                self.log.critical(f"STOP LOSS HIT: {current_price:.4f}")
                self.close_all_positions()
                self.stop_bot()
                return True
        
        if self.config.bot_sl:
            total_pnl = self.calculate_total_pnl()
            should_stop, msg = self.risk_manager.should_stop_bot(total_pnl)
            if should_stop:
                self.log.critical(f"BOT STOP LOSS: {msg}")
                self.close_all_positions()
                self.stop_bot()
                return True
        
        return False
    
    def process_exit_targets(self):
        if not self.open_trades:
            return
        
        current_price = self.get_current_price()
        if current_price is None:
            return
        
        kept = deque()
        trades_closed = False
        
        while self.open_trades:
            trade = self.open_trades.popleft()
            
            if self.should_exit_trade(trade, current_price):
                if self.execute_exit(trade, current_price):
                    trades_closed = True
                else:
                    kept.append(trade)
            else:
                kept.append(trade)
        
        self.open_trades.extend(kept)
        
        if trades_closed:
            self.save_state()
    
    def close_all_positions(self):
        self.log.warning("="*80)
        self.log.warning("CLOSING ALL POSITIONS")
        self.log.warning("="*80)
        
        positions = self.exchange.get_open_positions(self.config.symbol, self.config.trading_mode)
        
        if not positions:
            self.log.warning("No open positions found on exchange")
            if self.open_trades:
                self.log.warning(f"Clearing {len(self.open_trades)} trades from memory")
                self.open_trades.clear()
                self.save_state()
            return
        
        current_price = self.get_current_price()
        if not current_price:
            self.log.error("Cannot get current price - ABORTING!")
            return
        
        closed_count = 0
        
        for idx, position in enumerate(positions, 1):
            position_qty = float(position.get('qty', 0))
            
            if position_qty <= 0:
                continue
            
            if self.close_position(position_qty):
                if self.open_trades:
                    trade = self.open_trades.popleft()
                    pnl = self.calculate_trade_pnl(trade, current_price, position_qty)
                    self.total_realized_pnl += pnl
                    self.log.info(f"Position #{idx} PnL: ${pnl:.6f}")
                
                closed_count += 1
        
        if self.open_trades:
            self.log.warning(f"Clearing {len(self.open_trades)} remaining trades from memory")
            self.open_trades.clear()
        
        self.save_state()
        self.log.warning(f"Closed {closed_count} positions. Total PnL: ${self.total_realized_pnl:.6f}")
    
    def stop_bot(self):
        self.bot_should_stop = True
        self.log.warning("Bot stop requested")
        
        update_config_status(
            self.config_path,
            enabled=False,
            stopped_at=datetime.now().isoformat(),
            total_pnl=self.total_realized_pnl
        )
    
    def run(self):
        self.log.info("Starting bot main loop...")
        
        self.prev_price = self.get_current_price()
        while self.prev_price is None:
            self.log.warning(f"Waiting for initial {self.config.symbol} price...")
            time.sleep(3)
            self.prev_price = self.get_current_price()
        
        self.log.info(f"Start price: ${self.prev_price:.4f} | Open trades: {len(self.open_trades)}")
        self.log.info("="*80)
        
        start_window = datetime.now()
        
        while not self.bot_should_stop:
            try:
                now = datetime.now()
                
                if (now - start_window).total_seconds() >= 60:
                    self.trades_executed_this_minute = 0
                    start_window = now
                
                current_price = self.get_current_price()
                if current_price is None:
                    time.sleep(3)
                    continue
                
                if self.check_tp_sl(current_price):
                    break
                
                self.process_exit_targets()
                
                if (now - self.last_status_report_time).total_seconds() >= 300:
                    total_pnl = self.calculate_total_pnl()
                    position_size = self.calculate_current_position_size()
                    self.log.info(
                        f"Status: Price ${current_price:.4f} | "
                        f"Open: {len(self.open_trades)} | "
                        f"Position: ${position_size:,.2f} | "
                        f"Total PnL: ${total_pnl:.6f}"
                    )
                    self.last_status_report_time = now
                
                if self.trades_executed_this_minute < self.config.max_trades_per_minute:
                    self.check_entry_signal(current_price, self.prev_price)
                    self.prev_price = current_price
                
                time.sleep(5)
                
            except KeyboardInterrupt:
                self.log.warning("Stopped by user")
                break
            except Exception as e:
                self.log.error(f"Loop error: {e}\n{traceback.format_exc()}")
                time.sleep(8)
        
        self.log.info("Bot stopped")
        self.log.info(f"Final Total PnL: ${self.total_realized_pnl:.6f}")
    
    @abstractmethod
    def check_entry_signal(self, current_price: float, prev_price: float):
        pass
    
    @abstractmethod
    def should_exit_trade(self, trade: dict, current_price: float) -> bool:
        pass
    
    @abstractmethod
    def execute_exit(self, trade: dict, current_price: float) -> bool:
        pass
    
    @abstractmethod
    def close_position(self, qty: float) -> bool:
        pass
    
    @abstractmethod
    def calculate_trade_pnl(self, trade: dict, exit_price: float, qty: float) -> float:
        pass
    
    @abstractmethod
    def should_trigger_tp(self, current_price: float) -> bool:
        pass
    
    @abstractmethod
    def should_trigger_sl(self, current_price: float) -> bool:
        pass
    
    @abstractmethod
    def is_long_bot(self) -> bool:
        pass
    
    @abstractmethod
    def get_exit_fee_rate(self) -> float:
        pass
