import requests
import hmac
import hashlib
import time
from typing import Dict, List, Optional, Any
import logging


class BybitClient:
    def __init__(self, api_key: str, api_secret: str):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = "https://api.bybit.com"
        self.logger = logging.getLogger(__name__)
    
    def _sign_request(self, params: Dict[str, Any]) -> str:
        param_str = '&'.join([f"{k}={v}" for k, v in sorted(params.items())])
        signature = hmac.new(
            self.api_secret.encode('utf-8'),
            param_str.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    def _request(self, method: str, endpoint: str, params: Dict = None, sign: bool = True) -> Dict:
        url = f"{self.base_url}{endpoint}"
        
        if params is None:
            params = {}
        
        if sign:
            params['api_key'] = self.api_key
            params['timestamp'] = str(int(time.time() * 1000))
            params['sign'] = self._sign_request(params)
        
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, params=params, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=params, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            response.raise_for_status()
            data = response.json()
            
            if data.get('ret_code') == 0:
                return data.get('result', {})
            else:
                self.logger.error(f"API error: {data.get('ret_msg')}")
                return None
        
        except requests.exceptions.RequestException as e:
            self.logger.error(f"API request failed: {e}")
            return None
    
    def get_ticker(self, symbol: str) -> Optional[float]:
        response = self._request('GET', '/v2/public/tickers', {'symbol': symbol}, sign=False)
        
        if response and isinstance(response, list) and len(response) > 0:
            return float(response[0].get('last_price', 0))
        
        return None
    
    def get_candles(self, symbol: str, interval: str, limit: int = 200) -> List[Dict]:
        params = {
            'symbol': symbol,
            'interval': interval,
            'limit': limit
        }
        
        response = self._request('GET', '/v2/public/kline/list', params, sign=False)
        
        if not response:
            return []
        
        candles = []
        for candle_data in response:
            candles.append({
                'timestamp': candle_data['open_time'],
                'open': float(candle_data['open']),
                'high': float(candle_data['high']),
                'low': float(candle_data['low']),
                'close': float(candle_data['close']),
                'volume': float(candle_data['volume'])
            })
        
        return candles
    
    def place_order(
        self,
        symbol: str,
        side: str,
        qty: float,
        order_type: str = 'Market',
        reduce_only: bool = False,
        position_idx: int = 0
    ) -> Optional[Dict]:
        params = {
            'symbol': symbol,
            'side': side,
            'order_type': order_type,
            'qty': qty,
            'time_in_force': 'GoodTillCancel',
            'reduce_only': reduce_only,
            'close_on_trigger': False,
            'position_idx': position_idx
        }
        
        response = self._request('POST', '/private/linear/order/create', params)
        
        if response and 'order_id' in response:
            return response
        
        return None
    
    def get_open_positions(self, symbol: str) -> List[Dict]:
        params = {'symbol': symbol}
        
        response = self._request('GET', '/private/linear/position/list', params)
        
        if not response:
            return []
        
        if isinstance(response, list):
            return [p for p in response if float(p.get('size', 0)) > 0]
        elif isinstance(response, dict) and 'data' in response:
            positions = response['data']
            return [p for p in positions if float(p.get('size', 0)) > 0]
        
        return []
    
    def get_lot_size_filter(self, symbol: str) -> Dict[str, float]:
        response = self._request('GET', '/v2/public/symbols', sign=False)
        
        if response and isinstance(response, list):
            for symbol_info in response:
                if symbol_info.get('name') == symbol:
                    lot_size_filter = symbol_info.get('lot_size_filter', {})
                    return {
                        'min_qty': float(lot_size_filter.get('min_trading_qty', 0.001)),
                        'max_qty': float(lot_size_filter.get('max_trading_qty', 1000)),
                        'step_size': float(lot_size_filter.get('qty_step', 0.001))
                    }
        
        return {'min_qty': 0.001, 'max_qty': 1000.0, 'step_size': 0.001}
    
    def round_quantity(self, qty: float, lot_size: Dict[str, float]) -> float:
        step_size = lot_size['step_size']
        
        rounded = round(qty / step_size) * step_size
        
        rounded = max(rounded, lot_size['min_qty'])
        rounded = min(rounded, lot_size['max_qty'])
        
        precision = len(str(step_size).split('.')[-1]) if '.' in str(step_size) else 0
        rounded = round(rounded, precision)
        
        return rounded
    
    def get_account_balance(self) -> Optional[float]:
        response = self._request('GET', '/v2/private/wallet/balance', {'coin': 'USDT'})
        
        if response and 'USDT' in response:
            return float(response['USDT'].get('available_balance', 0))
        
        return None
