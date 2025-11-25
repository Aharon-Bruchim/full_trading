from pymongo import MongoClient
from datetime import datetime
from typing import Optional, List, Dict, Any
import os
from models import BotConfig, Position, Trade, BotStatus


class MongoDBClient:
    def __init__(self, uri: str = None):
        self.uri = uri or os.getenv("MONGODB_URI", "mongodb://localhost:27017/trading-platform")
        self.client = MongoClient(self.uri)
        self.db = self.client.get_default_database()
        
        self.bots = self.db.bots
        self.positions = self.db.positions
        self.trades = self.db.trades
        self.exchange_connections = self.db.exchange_connections
    
    def get_bot_config(self, bot_id: str) -> Optional[Dict[str, Any]]:
        bot_doc = self.bots.find_one({"_id": bot_id})
        return bot_doc
    
    def update_bot_status(self, bot_id: str, status: BotStatus, error_message: str = None):
        update_data = {
            "status": status.value,
            "last_heartbeat": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        if error_message:
            update_data["error_message"] = error_message
        
        self.bots.update_one(
            {"_id": bot_id},
            {"$set": update_data}
        )
    
    def send_heartbeat(self, bot_id: str):
        self.bots.update_one(
            {"_id": bot_id},
            {"$set": {"last_heartbeat": datetime.utcnow()}}
        )
    
    def update_bot_performance(self, bot_id: str, performance: Dict[str, Any]):
        self.bots.update_one(
            {"_id": bot_id},
            {"$set": {"performance": performance}}
        )
    
    def get_exchange_connection(self, user_id: str, exchange: str) -> Optional[Dict[str, Any]]:
        return self.exchange_connections.find_one({
            "user_id": user_id,
            "exchange": exchange,
            "status": "ACTIVE"
        })
    
    def save_position(self, position: Position) -> str:
        position_dict = position.model_dump(exclude={"id"})
        position_dict["opened_at"] = position.opened_at
        
        result = self.positions.insert_one(position_dict)
        return str(result.inserted_id)
    
    def update_position(self, position_id: str, updates: Dict[str, Any]):
        self.positions.update_one(
            {"_id": position_id},
            {"$set": updates}
        )
    
    def close_position(self, position_id: str, exit_price: float, exit_reason: str):
        self.positions.update_one(
            {"_id": position_id},
            {"$set": {
                "status": "CLOSED",
                "closed_at": datetime.utcnow(),
                "exit_price": exit_price,
                "exit_reason": exit_reason
            }}
        )
    
    def get_open_positions(self, bot_id: str) -> List[Dict[str, Any]]:
        return list(self.positions.find({
            "bot_id": bot_id,
            "status": "OPEN"
        }))
    
    def save_trade(self, trade: Trade) -> str:
        trade_dict = trade.model_dump()
        trade_dict["opened_at"] = trade.opened_at
        trade_dict["closed_at"] = trade.closed_at
        
        result = self.trades.insert_one(trade_dict)
        return str(result.inserted_id)
    
    def get_bot_trades(self, bot_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        return list(self.trades.find(
            {"bot_id": bot_id}
        ).sort("closed_at", -1).limit(limit))
    
    def get_daily_stats(self, bot_id: str) -> Dict[str, Any]:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        trades_today = list(self.trades.find({
            "bot_id": bot_id,
            "closed_at": {"$gte": today_start}
        }))
        
        if not trades_today:
            return {
                "trades_count": 0,
                "total_pnl": 0.0,
                "win_rate": 0.0
            }
        
        total_pnl = sum(t["net_pnl"] for t in trades_today)
        wins = sum(1 for t in trades_today if t["net_pnl"] > 0)
        win_rate = wins / len(trades_today) if trades_today else 0
        
        return {
            "trades_count": len(trades_today),
            "total_pnl": total_pnl,
            "win_rate": win_rate
        }
    
    def close(self):
        self.client.close()
