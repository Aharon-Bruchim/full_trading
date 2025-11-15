import json
import os
from typing import Dict, Any

class BotConfig:
    def __init__(self, config_dict: Dict[str, Any]):
        self.bot_id = config_dict['botId']
        self.user_id = config_dict['userId']
        self.client_name = config_dict['clientName']
        
        creds = config_dict['credentials']
        self.api_key = creds['apiKey']
        self.api_secret = creds['apiSecret']
        
        trading = config_dict['tradingParams']
        self.symbol = trading['symbol']
        self.quantity = float(trading.get('quantity', 0.01))
        self.trading_mode = trading['tradingMode']
        self.desired_position_size = float(trading['desiredPositionSize'])
        
        thresh = config_dict['thresholds']
        self.buy_threshold = float(thresh['buyThreshold'])
        self.sell_threshold = float(thresh['sellThreshold'])
        self.max_trades_per_minute = int(thresh['maxTradesPerMinute'])
        self.position_size_limit = float(thresh['positionSizeLimit'])
        self.buy_percentage = float(thresh.get('buyPercentage', thresh.get('sellPercentage', 1.0)))
        self.sell_percentage = float(thresh.get('sellPercentage', 1.0))
        
        self.use_atr = thresh.get('useATR', True)
        self.atr_period = int(thresh.get('atrPeriod', 14))
        self.atr_multiplier = float(thresh.get('atrMultiplier', 0.7))
        
        tp = config_dict['takeProfit']
        self.tp_enabled = tp['enabled']
        self.tp_price = float(tp['priceLevel']) if tp.get('priceLevel') else None
        
        sl = config_dict['stopLoss']
        self.sl_enabled = sl['enabled']
        self.sl_price = float(sl['priceLevel']) if sl.get('priceLevel') else None
        self.bot_sl = float(sl['botStopLoss']) if sl.get('botStopLoss') else None
        
        fees = config_dict['fees']
        self.fee_rate_buy = float(fees['buy'])
        self.fee_rate_sell = float(fees['sell'])
        
        self.raw_config = config_dict

    def get_state_file_path(self) -> str:
        return f'bot_trades/{self.bot_id}_trades.json'

def load_config(config_path: str) -> BotConfig:
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Config file not found: {config_path}")
    
    with open(config_path, 'r') as f:
        config_dict = json.load(f)
    
    return BotConfig(config_dict)

def update_config_status(config_path: str, enabled: bool, stopped_at: str, total_pnl: float):
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    if 'status' not in config:
        config['status'] = {}
    
    config['status']['enabled'] = enabled
    config['status']['stoppedAt'] = stopped_at
    config['status']['totalRealizedPnl'] = total_pnl
    
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)