#!/usr/bin/env python3

import sys
import time
import signal
import argparse
from datetime import datetime, timedelta
from typing import Optional
import logging

from models import BotConfig, BotStatus
from db.mongodb_client import MongoDBClient
from notifications.webhook import WebhookNotifier
from shared.logger import setup_logger


class BotRunner:
    def __init__(self, bot_id: str):
        self.bot_id = bot_id
        self.db = MongoDBClient()
        self.notifier = WebhookNotifier()
        
        self.log = setup_logger(bot_id, f"./logs/{bot_id}.log")
        
        self.should_stop = False
        self.config: Optional[BotConfig] = None
        self.strategy = None
        self.client = None
        
        self.last_heartbeat = datetime.utcnow()
        self.last_config_check = datetime.utcnow()
        self.config_check_interval = 60
        
        self.total_realized_pnl = 0.0
        self.trades_today = 0
        
        self._setup_signal_handlers()
    
    def _setup_signal_handlers(self):
        def signal_handler(signum, frame):
            self.log.critical(f"Received signal {signum}, shutting down...")
            self.should_stop = True
        
        signal.signal(signal.SIGTERM, signal_handler)
        signal.signal(signal.SIGINT, signal_handler)
    
    def load_config(self) -> bool:
        self.log.info(f"Loading config for bot {self.bot_id}")
        
        bot_doc = self.db.get_bot_config(self.bot_id)
        
        if not bot_doc:
            self.log.error(f"Bot {self.bot_id} not found in database")
            return False
        
        try:
            config_data = bot_doc.get('config', {})
            config_data['bot_id'] = self.bot_id
            
            self.config = BotConfig(**config_data)
            self.log.info(f"Config loaded successfully: {self.config.exchange} - {self.config.trading.symbol}")
            
            self.user_id = str(bot_doc.get('user_id', ''))
            
            return True
        
        except Exception as e:
            self.log.error(f"Failed to parse config: {e}")
            return False
    
    def initialize_exchange(self) -> bool:
        self.log.info(f"Initializing exchange: {self.config.exchange}")
        
        exchange_conn = self.db.get_exchange_connection(self.user_id, self.config.exchange)
        
        if not exchange_conn:
            self.log.error(f"No exchange connection found for {self.config.exchange}")
            return False
        
        api_key = exchange_conn.get('api_key')
        api_secret = exchange_conn.get('api_secret')
        
        try:
            if self.config.exchange == 'bitunix':
                from exchanges.bitunix.core.client import BitunixClient
                self.client = BitunixClient(api_key, api_secret)
            
            elif self.config.exchange == 'bybit':
                from exchanges.bybit.core.client import BybitClient
                self.client = BybitClient(api_key, api_secret)
            
            else:
                self.log.error(f"Unsupported exchange: {self.config.exchange}")
                return False
            
            price = self.client.get_ticker(self.config.trading.symbol)
            if price is None:
                self.log.error("Failed to fetch ticker - API connection issue")
                return False
            
            self.log.info(f"Exchange initialized. Current price: ${price:.2f}")
            return True
        
        except Exception as e:
            self.log.error(f"Failed to initialize exchange: {e}")
            return False
    
    def initialize_strategy(self) -> bool:
        self.log.info(f"Initializing strategy: {self.config.strategy.type}")
        
        try:
            if self.config.exchange == 'bitunix':
                from exchanges.bitunix.strategies.long_dip_atr import LongDipATRStrategy
                self.strategy = LongDipATRStrategy(self.config, self.client, self.log)
            
            elif self.config.exchange == 'bybit':
                from exchanges.bybit.strategies.long_dip_atr import LongDipATRStrategy
                self.strategy = LongDipATRStrategy(self.config, self.client, self.log)
            
            else:
                self.log.error(f"No strategy for exchange: {self.config.exchange}")
                return False
            
            if hasattr(self.strategy, 'position_manager'):
                self.strategy.position_manager.user_id = self.user_id
            
            self.log.info("Strategy initialized")
            return True
        
        except Exception as e:
            self.log.error(f"Failed to initialize strategy: {e}")
            return False
    
    def run(self):
        self.log.info("="*80)
        self.log.info(f"BOT STARTING: {self.bot_id}")
        self.log.info("="*80)
        
        if not self.load_config():
            self.db.update_bot_status(self.bot_id, BotStatus.ERROR, "Failed to load config")
            return
        
        if not self.initialize_exchange():
            self.db.update_bot_status(self.bot_id, BotStatus.ERROR, "Failed to initialize exchange")
            return
        
        if not self.initialize_strategy():
            self.db.update_bot_status(self.bot_id, BotStatus.ERROR, "Failed to initialize strategy")
            return
        
        self.db.update_bot_status(self.bot_id, BotStatus.RUNNING)
        self.notifier.notify_bot_started(self.bot_id)
        
        self.log.info("Entering main loop...")
        
        iteration = 0
        
        while not self.should_stop:
            try:
                iteration += 1
                
                current_price = self.client.get_ticker(self.config.trading.symbol)
                
                if current_price is None:
                    self.log.warning("Failed to get ticker, retrying...")
                    time.sleep(5)
                    continue
                
                self.strategy.update(current_price)
                
                signal = self.strategy.check_entry_signal(current_price)
                if signal:
                    position = self.strategy.execute_entry(signal)
                    
                    if position:
                        position_id = self.db.save_position(position)
                        position.id = position_id
                        
                        self.notifier.notify_position_opened(position.model_dump())
                
                exits = self.strategy.check_exit_signals(current_price)
                for position, reason in exits:
                    trade = self.strategy.execute_exit(position, current_price, reason)
                    
                    if trade:
                        self.db.close_position(position.id, current_price, reason.value)
                        self.db.save_trade(trade)
                        
                        self.total_realized_pnl += trade.net_pnl
                        self.trades_today += 1
                        
                        self.notifier.notify_position_closed(trade.model_dump())
                
                self.strategy.update_trailing_stops(current_price)
                
                if iteration % 6 == 0:
                    self.send_heartbeat()
                
                if iteration % 60 == 0:
                    self.update_performance()
                    self.log_status(current_price)
                
                if (datetime.utcnow() - self.last_config_check).total_seconds() >= self.config_check_interval:
                    self.check_config_updates()
                    self.last_config_check = datetime.utcnow()
                
                time.sleep(self.config.timeframe.update_interval)
            
            except KeyboardInterrupt:
                self.log.info("Keyboard interrupt received")
                self.should_stop = True
            
            except Exception as e:
                self.log.error(f"Error in main loop: {e}", exc_info=True)
                self.notifier.notify_error(self.bot_id, str(e))
                time.sleep(10)
        
        self.shutdown()
    
    def send_heartbeat(self):
        self.db.send_heartbeat(self.bot_id)
        self.last_heartbeat = datetime.utcnow()
    
    def update_performance(self):
        daily_stats = self.db.get_daily_stats(self.bot_id)
        
        current_price = self.client.get_ticker(self.config.trading.symbol)
        unrealized_pnl = self.strategy.position_manager.calculate_unrealized_pnl(current_price)
        
        performance = {
            'total_realized_pnl': self.total_realized_pnl,
            'total_unrealized_pnl': unrealized_pnl,
            'trades_today': daily_stats['trades_count'],
            'win_rate': daily_stats['win_rate']
        }
        
        self.db.update_bot_performance(self.bot_id, performance)
    
    def log_status(self, current_price: float):
        open_positions = len(self.strategy.position_manager.get_open_positions())
        unrealized_pnl = self.strategy.position_manager.calculate_unrealized_pnl(current_price)
        
        self.log.info(
            f"Status: Price ${current_price:.2f} | "
            f"Open: {open_positions} | "
            f"Realized PnL: ${self.total_realized_pnl:.2f} | "
            f"Unrealized: ${unrealized_pnl:.2f}"
        )
    
    def check_config_updates(self):
        bot_doc = self.db.get_bot_config(self.bot_id)
        
        if not bot_doc:
            return
        
        if bot_doc.get('status') == 'STOPPED':
            self.log.info("Bot stopped remotely")
            self.should_stop = True
    
    def shutdown(self):
        self.log.info("="*80)
        self.log.info("SHUTTING DOWN BOT")
        self.log.info("="*80)
        
        self.db.update_bot_status(self.bot_id, BotStatus.STOPPED)
        self.notifier.notify_bot_stopped(self.bot_id, "Normal shutdown")
        
        self.db.close()
        
        self.log.info(f"Final PnL: ${self.total_realized_pnl:.2f}")
        self.log.info("Bot stopped")


def main():
    parser = argparse.ArgumentParser(description='Trading Bot Runner')
    parser.add_argument('--bot-id', required=True, help='Bot ID from database')
    
    args = parser.parse_args()
    
    runner = BotRunner(args.bot_id)
    runner.run()


if __name__ == '__main__':
    main()
