import threading
import uuid
from typing import Dict, Optional, List
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

class BotManager:
    def __init__(self):
        self.active_bots: Dict[str, dict] = {}
        self.enable_real_trading = os.getenv('ENABLE_REAL_TRADING', 'false').lower() == 'true'
        
    def start_bot(self, bot_type: str, symbol: str, config: dict) -> str:
        bot_id = str(uuid.uuid4())
        
        if not self.enable_real_trading:
            bot_info = {
                "id": bot_id,
                "type": bot_type,
                "symbol": symbol,
                "config": config,
                "status": "running (DEMO)",
                "started_at": datetime.utcnow().isoformat(),
                "thread": None,
                "bot_instance": None
            }
            self.active_bots[bot_id] = bot_info
            return bot_id
        
        try:
            from trading_bots.bots.long_dip_bot import LongDipBot
            from trading_bots.bots.short_rip_bot import ShortRipBot
            from trading_bots.exchange.bitunix_client import BitunixClient
            from trading_bots.core.config_loader import BotConfig
            from trading_bots.core.logger import setup_logger
            
            api_key = os.getenv('BITUNIX_API_KEY')
            api_secret = os.getenv('BITUNIX_API_SECRET')
            
            if not api_key or not api_secret:
                raise ValueError("BITUNIX_API_KEY and BITUNIX_API_SECRET must be set in .env file")
            
            max_position = int(os.getenv('MAX_POSITION_SIZE', 100))
            if config.get('position_size', 0) > max_position:
                raise ValueError(f"Position size exceeds maximum: {max_position}")
            
            config_dict = {
                'botId': bot_id,
                'userId': 'api_user',
                'clientName': 'API',
                'credentials': {
                    'apiKey': api_key,
                    'apiSecret': api_secret
                },
                'tradingParams': {
                    'symbol': symbol,
                    'quantity': config.get('position_size', 100),
                    'tradingMode': 'linear',
                    'desiredPositionSize': config.get('position_size', 100)
                },
                'thresholds': {
                    'buyThreshold': config.get('dip_threshold', -2.0) / 100,
                    'sellThreshold': config.get('take_profit_pct', 2.0) / 100,
                    'maxTradesPerMinute': 5,
                    'positionSizeLimit': config.get('position_size', 100) * 10,
                    'buyPercentage': 1.0,
                    'sellPercentage': 1.0,
                    'useATR': config.get('use_atr', False),
                    'atrPeriod': 14,
                    'atrMultiplier': 1.5
                },
                'takeProfit': {
                    'enabled': False,
                    'priceLevel': None
                },
                'stopLoss': {
                    'enabled': False,
                    'priceLevel': None,
                    'botStopLoss': config.get('bot_stop_loss', None)
                },
                'fees': {
                    'buy': 0.0006,
                    'sell': 0.0006
                }
            }
            
            bot_config = BotConfig(config_dict)
            
            exchange_client = BitunixClient(
                api_key=api_key,
                api_secret=api_secret
            )
            
            logger = setup_logger(bot_id)
            
            os.makedirs('temp', exist_ok=True)
            config_path = f"temp/bot_{bot_id}.json"
            
            if bot_type == "long_dip":
                bot_instance = LongDipBot(bot_config, exchange_client, config_path, logger)
            elif bot_type == "short_rip":
                bot_instance = ShortRipBot(bot_config, exchange_client, config_path, logger)
            else:
                raise ValueError(f"Unknown bot type: {bot_type}")
            
            thread = threading.Thread(
                target=bot_instance.run,
                daemon=True,
                name=f"bot_{bot_id}"
            )
            thread.start()
            
            bot_info = {
                "id": bot_id,
                "type": bot_type,
                "symbol": symbol,
                "config": config,
                "status": "running (LIVE)",
                "started_at": datetime.utcnow().isoformat(),
                "thread": thread,
                "bot_instance": bot_instance
            }
            
            self.active_bots[bot_id] = bot_info
            return bot_id
            
        except Exception as e:
            raise Exception(f"Failed to start bot: {str(e)}")
    
    def stop_bot(self, bot_id: str) -> bool:
        if bot_id not in self.active_bots:
            return False
        
        bot_info = self.active_bots[bot_id]
        
        if bot_info.get("bot_instance"):
            try:
                bot_info["bot_instance"].stop()
            except Exception as e:
                print(f"Error stopping bot: {e}")
        
        bot_info["status"] = "stopped"
        bot_info["stopped_at"] = datetime.utcnow().isoformat()
        
        return True
    
    def get_bot_status(self, bot_id: str) -> Optional[dict]:
        if bot_id not in self.active_bots:
            return None
        
        bot_info = self.active_bots[bot_id]
        
        is_alive = False
        if bot_info.get("thread"):
            is_alive = bot_info["thread"].is_alive()
        
        return {
            "bot_id": bot_info["id"],
            "type": bot_info["type"],
            "symbol": bot_info["symbol"],
            "status": bot_info["status"],
            "thread_alive": is_alive,
            "started_at": bot_info.get("started_at", ""),
            "stopped_at": bot_info.get("stopped_at", "")
        }
    
    def get_all_bots(self) -> List[dict]:
        return [
            self.get_bot_status(bot_id)
            for bot_id in self.active_bots.keys()
        ]
    
    def delete_bot(self, bot_id: str) -> bool:
        if bot_id not in self.active_bots:
            return False
        
        self.stop_bot(bot_id)
        del self.active_bots[bot_id]
        return True