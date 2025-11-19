import threading
import uuid
import os
from typing import Dict, Optional, List
from datetime import datetime
from dotenv import load_dotenv
from bson import ObjectId

from trading_bots.infrastructure.database import get_sync_db

load_dotenv()

class BotManager:
    def __init__(self):
        self.db = get_sync_db()
        self.bots_collection = self.db['bots']
        self.active_threads: Dict[str, threading.Thread] = {}
        self.enable_real_trading = os.getenv('ENABLE_REAL_TRADING', 'false').lower() == 'true'
    
    def start_bot(self, bot_id: str) -> dict:
        print(f"DEBUG: Searching for bot_id: {bot_id}")
        print(f"DEBUG: Database name: {self.db.name}")
        print(f"DEBUG: Collection name: {self.bots_collection.name}")
        
        bot = self.bots_collection.find_one({"_id": ObjectId(bot_id)})
        print(f"DEBUG: Found bot: {bot}")
        
        if not bot:
            raise ValueError(f"Bot {bot_id} not found in MongoDB")
        
        if bot_id in self.active_threads and self.active_threads[bot_id].is_alive():
            print(f"DEBUG: Bot {bot_id} thread already alive, skipping")
            return {
                "bot_id": bot_id,
                "status": "ALREADY_RUNNING",
                "message": "Bot is already running"
            }
        
        self.bots_collection.update_one(
            {"_id": ObjectId(bot_id)},
            {
                "$set": {
                    "status": "STARTING",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if not self.enable_real_trading:
            self.bots_collection.update_one(
                {"_id": ObjectId(bot_id)},
                {
                    "$set": {
                        "status": "RUNNING (DEMO)",
                        "started_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return {
                "bot_id": bot_id,
                "status": "RUNNING (DEMO)",
                "message": "Demo mode - no real trading"
            }
        
        try:
            from trading_bots.bots.long_dip_bot import LongDipBot
            from trading_bots.bots.short_rip_bot import ShortRipBot
            from trading_bots.exchange.bitunix_client import BitunixClient
            from trading_bots.core.config_loader import BotConfig
            from trading_bots.core.logger import setup_logger
            
            api_key = os.getenv('BITUNIX_API_KEY')
            api_secret = os.getenv('BITUNIX_API_SECRET')
            
            if not api_key or not api_secret:
                raise ValueError("BITUNIX_API_KEY and BITUNIX_API_SECRET required")
            
            config_dict = self._build_config_from_mongo_bot(bot, api_key, api_secret)
            bot_config = BotConfig(config_dict)
            
            exchange_client = BitunixClient(api_key=api_key, api_secret=api_secret)
            logger = setup_logger(bot_id)
            
            os.makedirs('temp', exist_ok=True)
            config_path = f"temp/bot_{bot_id}.json"
            
            bot_type = bot.get('type', 'TREND_LONG')
            if bot_type == "TREND_LONG" or bot_type == "LONG":
                bot_instance = LongDipBot(bot_config, exchange_client, config_path, logger)
            elif bot_type == "TREND_SHORT" or bot_type == "SHORT":
                bot_instance = ShortRipBot(bot_config, exchange_client, config_path, logger)
            elif bot_type == "RANGE":
                raise ValueError("RANGE bot type is not yet supported")
            else:
                raise ValueError(f"Unknown bot type: {bot_type}")   
            
            thread = threading.Thread(
                target=bot_instance.run,
                daemon=False,
                name=f"bot_{bot_id}"
            )
            thread.start()
            
            self.active_threads[bot_id] = thread
            
            self.bots_collection.update_one(
                {"_id": ObjectId(bot_id)},
                {
                    "$set": {
                        "status": "RUNNING",
                        "started_at": datetime.utcnow(),
                        "process_id": os.getpid(),
                        "last_heartbeat": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return {
                "bot_id": bot_id,
                "status": "RUNNING",
                "message": f"Bot started successfully"
            }
            
        except Exception as e:
            self.bots_collection.update_one(
                {"_id": ObjectId(bot_id)},
                {
                    "$set": {
                        "status": "ERROR",
                        "error": str(e),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            raise Exception(f"Failed to start bot: {str(e)}")
    
    def _build_config_from_mongo_bot(self, bot: dict, api_key: str, api_secret: str) -> dict:
        config = bot.get('config', {})
        
        return {
            'botId': str(bot['_id']),
            'userId': 'api_user',
            'clientName': 'API',
            'credentials': {
                'apiKey': api_key,
                'apiSecret': api_secret
            },
            'tradingParams': {
                'symbol': config.get('symbol', 'BTCUSDT'),
                'quantity': config.get('positionSize', 100),
                'tradingMode': 'linear',
                'desiredPositionSize': config.get('positionSize', 100)
            },
            'thresholds': {
                'buyThreshold': config.get('strategy', {}).get('buyThreshold', -0.02),
                'sellThreshold': config.get('strategy', {}).get('sellThreshold', 0.015),
                'maxTradesPerMinute': config.get('riskManagement', {}).get('maxTradesPerMinute', 5),
                'positionSizeLimit': config.get('riskManagement', {}).get('positionSizeLimit', 1000),
                'buyPercentage': 1.0,
                'sellPercentage': 1.0,
                'useATR': config.get('strategy', {}).get('useATR', False),
                'atrPeriod': 14,
                'atrMultiplier': 1.5
            },
            'takeProfit': {
                'enabled': False,
                'priceLevel': None
            },
            'stopLoss': {
                'enabled': config.get('riskManagement', {}).get('stopLoss', {}).get('enabled', False),
                'priceLevel': config.get('riskManagement', {}).get('stopLoss', {}).get('price', None),
                'botStopLoss': config.get('riskManagement', {}).get('botStopLoss', None)
            },
            'fees': {
                'buy': 0.0006,
                'sell': 0.0006
            }
        }
    
    def stop_bot(self, bot_id: str) -> bool:
        try:
            bot = self.bots_collection.find_one({"_id": ObjectId(bot_id)})
            
            if not bot:
                return False
            
            self.bots_collection.update_one(
                {"_id": ObjectId(bot_id)},
                {
                    "$set": {
                        "status": "STOPPED",
                        "stopped_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            if bot_id in self.active_threads:
                thread = self.active_threads[bot_id]
                del self.active_threads[bot_id]
            
            return True
            
        except Exception as e:
            print(f"Error stopping bot: {e}")
            return False
    
    def get_bot_status(self, bot_id: str) -> Optional[dict]:
        try:
            bot = self.bots_collection.find_one({"_id": ObjectId(bot_id)})
            
            if not bot:
                return None
            
            is_alive = False
            if bot_id in self.active_threads:
                is_alive = self.active_threads[bot_id].is_alive()
            
            return {
                "bot_id": str(bot['_id']),
                "name": bot.get('name', ''),
                "type": bot.get('type', ''),
                "symbol": bot.get('config', {}).get('symbol', ''),
                "status": bot.get('status', ''),
                "thread_alive": is_alive,
                "started_at": bot.get('started_at', '').isoformat() if bot.get('started_at') else '',
                "stopped_at": bot.get('stopped_at', '').isoformat() if bot.get('stopped_at') else ''
            }
            
        except Exception as e:
            print(f"Error getting bot status: {e}")
            return None
    
    def get_all_bots(self) -> List[dict]:
        try:
            bots = list(self.bots_collection.find())
            
            result = []
            for bot in bots:
                bot_id = str(bot['_id'])
                is_alive = False
                if bot_id in self.active_threads:
                    is_alive = self.active_threads[bot_id].is_alive()
                
                result.append({
                    "bot_id": bot_id,
                    "name": bot.get('name', ''),
                    "type": bot.get('type', ''),
                    "symbol": bot.get('config', {}).get('symbol', ''),
                    "status": bot.get('status', ''),
                    "thread_alive": is_alive,
                    "started_at": bot.get('started_at', '').isoformat() if bot.get('started_at') else '',
                    "stopped_at": bot.get('stopped_at', '').isoformat() if bot.get('stopped_at') else ''
                })
            
            return result
            
        except Exception as e:
            print(f"Error getting all bots: {e}")
            return []
    
    def delete_bot(self, bot_id: str) -> bool:
        try:
            bot = self.bots_collection.find_one({"_id": ObjectId(bot_id)})
            
            if not bot:
                return False
            
            if bot.get('status') == 'RUNNING':
                self.stop_bot(bot_id)
            
            self.bots_collection.delete_one({"_id": ObjectId(bot_id)})
            
            return True
            
        except Exception as e:
            print(f"Error deleting bot: {e}")
            return False