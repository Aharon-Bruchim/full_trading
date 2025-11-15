import logging
from trading_bots.exchange.bitunix_client import BitunixClient

def create_exchange_client(exchange_name: str, api_key: str, api_secret: str, logger: logging.Logger = None):
    exchange_name = exchange_name.lower()
    
    if exchange_name == 'bitunix':
        return BitunixClient(api_key, api_secret, logger)
    else:
        raise ValueError(f"Unsupported exchange: {exchange_name}")
