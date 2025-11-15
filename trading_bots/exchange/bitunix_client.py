import time
import logging
from bitunix import BitunixClient as BitunixAPI

class BitunixClient:
    def __init__(self, api_key: str, api_secret: str, logger: logging.Logger = None):
        self.api = BitunixAPI(api_key, api_secret)
        self.logger = logger or logging.getLogger(__name__)
    
    def get_ticker(self, symbol: str):
        try:
            result = self.api.get_latest_price(symbol)
            
            if not result:
                return None
            
            if str(result.get('code')) != '0':
                self.logger.error(f"API error: {result.get('msg')}")
                return None
            
            data = result.get('data')
            
            if not data:
                return None
            
            price = float(data)
            
            if price == 0:
                return None
            
            return price
            
        except Exception as e:
            self.logger.error(f"Error getting ticker: {e}")
            return None
    
    def get_lot_size_filter(self, symbol: str):
        self.logger.info(f"Getting lot size filter for {symbol}")
        
        try:
            result = self.api.get_trading_pairs()
            
            if not result or str(result.get('code')) != '0':
                return {'minOrderQty': 0.01, 'qtyStep': 0.01}
            
            instruments = result.get('data', [])
            
            for instrument in instruments:
                if instrument.get('symbol') == symbol:
                    min_qty = float(instrument.get('minTradeVolume', 0.01))
                    base_precision = int(instrument.get('basePrecision', 4))
                    qty_step = 10 ** (-base_precision)
                    
                    return {'minOrderQty': min_qty, 'qtyStep': qty_step}
            
            return {'minOrderQty': 0.01, 'qtyStep': 0.01}
        
        except Exception as e:
            self.logger.error(f"Error getting lot size: {e}")
            return {'minOrderQty': 0.01, 'qtyStep': 0.01}
    
    def round_quantity(self, qty: float, lot_size: dict) -> float:
        qty_step = lot_size['qtyStep']
        min_qty = lot_size['minOrderQty']
        
        rounded = round(qty / qty_step) * qty_step
        rounded = max(rounded, min_qty)
        
        if qty_step >= 1:
            return int(rounded)
        elif qty_step >= 0.1:
            return round(rounded, 1)
        elif qty_step >= 0.01:
            return round(rounded, 2)
        else:
            return round(rounded, 3)
    
    def get_open_positions(self, symbol: str, trading_mode: str = 'LONG'):
        return []
    
    def place_order(
        self,
        symbol: str,
        side: str,
        qty: float,
        order_type: str = 'MARKET',
        trade_side: str = None,
        position_id: str = None,
        reduce_only: bool = False
    ):
        self.logger.info(f"{side} ORDER: {qty} {symbol}")
        
        try:
            result = self.api.place_order(
                symbol=symbol,
                side=side.lower(),
                order_type=order_type.lower(),
                quantity=str(qty)
            )
            
            if result and str(result.get('code')) == '0':
                order_data = result.get('data', {})
                order_id = order_data.get('orderId')
                return {'id': order_id, 'qty': qty}
            else:
                error_msg = result.get('msg') if result else 'No response'
                self.logger.error(f"Order failed: {error_msg}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error placing order: {e}")
            return None