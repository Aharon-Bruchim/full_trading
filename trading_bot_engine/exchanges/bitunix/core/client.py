import requests
import hmac
import hashlib
import time
from typing import Dict, List, Optional, Any
import logging


class BitunixClient:
    def __init__(self, api_key: str, api_secret: str):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = "https://api.bitunix.com"
        self.logger = logging.getLogger(__name__)
    
    def _sign_request(self, params: Dict[str, Any]) -> str:
        query_string = '&'.join([f"{k}={v}" for k, v in sorted(params.items())])
        signature = hmac.new(
            self.api_secret.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    def _request(self, method: str, endpoint: str, params: Dict = None, sign: bool = True) -> Dict:
        url = f"{self.base_url}{endpoint}"
        
        if params is None:
            params = {}
        
        if sign:
            params['timestamp'] = int(time.time() * 1000)
            params['signature'] = self._sign_request(params)
        
        headers = {
            'X-API-KEY': self.api_key,
            'Content-Type': 'application/json'
        }
        
        try:
            if method == 'GET':
                response = requests.get(url, params=params, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=params, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.RequestException as e:
            self.logger.error(f"API request failed: {e}")
            return None
    
    def get_ticker(self, symbol: str) -> Optional[float]:
        response = self._request('GET', '/api/v1/ticker', {'symbol': symbol}, sign=False)
        
        if response and 'price' in response:
            return float(response['price'])
        
        return None
    
    def get_candles(self, symbol: str, interval: str, limit: int = 100) -> List[Dict]:
        params = {
            'symbol': symbol,
            'interval': interval,
            'limit': limit
        }
        
        response = self._request('GET', '/api/v1/klines', params, sign=False)
        
        if not response:
            return []
        
        candles = []
        for candle_data in response:
            candles.append({
                'timestamp': candle_data[0],
                'open': float(candle_data[1]),
                'high': float(candle_data[2]),
                'low': float(candle_data[3]),
                'close': float(candle_data[4]),
                'volume': float(candle_data[5])
            })
        
        return candles
    
    def place_order(
        self,
        symbol: str,
        side: str,
        qty: float,
        order_type: str = 'MARKET',
        trade_side: str = None,
        position_id: str = None,
        reduce_only: bool = False
    ) -> Optional[Dict]:
        params = {
            'symbol': symbol,
            'side': side,
            'quantity': qty,
            'type': order_type
        }
        
        if trade_side:
            params['trade_side'] = trade_side
        
        if position_id:
            params['position_id'] = position_id
        
        if reduce_only:
            params['reduce_only'] = True
        
        response = self._request('POST', '/api/v1/order', params)
        
        if response and 'id' in response:
            return response
        
        return None
    
    def get_open_positions(self, symbol: str, mode: str = 'ISOLATED') -> List[Dict]:
        params = {
            'symbol': symbol,
            'mode': mode
        }
        
        response = self._request('GET', '/api/v1/positions', params)
        
        if not response:
            return []
        
        return response.get('positions', [])
    
    def get_lot_size_filter(self, symbol: str) -> Dict[str, float]:
        response = self._request('GET', '/api/v1/exchangeInfo', {'symbol': symbol}, sign=False)
        
        if response and 'filters' in response:
            for filter_item in response['filters']:
                if filter_item['filterType'] == 'LOT_SIZE':
                    return {
                        'min_qty': float(filter_item['minQty']),
                        'max_qty': float(filter_item['maxQty']),
                        'step_size': float(filter_item['stepSize'])
                    }
        
        return {'min_qty': 0.0001, 'max_qty': 1000.0, 'step_size': 0.0001}
    
    def round_quantity(self, qty: float, lot_size: Dict[str, float]) -> float:
        step_size = lot_size['step_size']
        
        rounded = round(qty / step_size) * step_size
        
        rounded = max(rounded, lot_size['min_qty'])
        rounded = min(rounded, lot_size['max_qty'])
        
        precision = len(str(step_size).split('.')[-1]) if '.' in str(step_size) else 0
        rounded = round(rounded, precision)
        
        return rounded
    
    def get_account_balance(self) -> Optional[float]:
        response = self._request('GET', '/api/v1/account')
        
        if response and 'balance' in response:
            return float(response['balance'])
        
        return None
