import sys
import os
import time
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from trading_bots.regime.regime_selector import RegimeSelector
from trading_bots.regime.regime_types import MarketRegime

def main():
    if len(sys.argv) < 2:
        print("Usage: python run_with_regime.py <regime_config_path>")
        sys.exit(1)
    
    config_path = sys.argv[1]
    
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    regime_config = config.get('regime', {})
    long_bot_config = config.get('long_bot_config')
    short_bot_config = config.get('short_bot_config')
    
    selector = RegimeSelector(regime_config)
    
    print("="*80)
    print("Regime Manager Started")
    print("="*80)
    
    while True:
        regime = selector.get_current_regime()
        
        print(f"\nCurrent Market Regime: {regime.value}")
        
        should_run_long = selector.should_run_long_bot(regime)
        should_run_short = selector.should_run_short_bot(regime)
        
        print(f"  Long Bot: {'ENABLED' if should_run_long else 'DISABLED'}")
        print(f"  Short Bot: {'ENABLED' if should_run_short else 'DISABLED'}")
        
        time.sleep(300)

if __name__ == "__main__":
    main()
