import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from trading_bots.core.config_loader import load_config
from trading_bots.core.logger import setup_logger
from trading_bots.exchange.bitunix_client import BitunixClient
from trading_bots.bots.long_dip_bot import LongDipBot

def main():
    if len(sys.argv) < 2:
        print("Usage: python run_long_bot.py <config_path>")
        sys.exit(1)
    
    config_path = sys.argv[1]
    
    config = load_config(config_path)
    
    logger = setup_logger(config.bot_id)
    
    logger.info(f"Initializing Long Dip Bot: {config.bot_id}")
    logger.info(f"Process ID: {os.getpid()}")
    
    exchange_client = BitunixClient(
        api_key=config.api_key,
        api_secret=config.api_secret,
        logger=logger
    )
    
    bot = LongDipBot(
        config=config,
        exchange_client=exchange_client,
        config_path=config_path,
        logger=logger
    )
    
    try:
        bot.run()
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        bot.stop_bot()

if __name__ == "__main__":
    main()
