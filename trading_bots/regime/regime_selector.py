from trading_bots.regime.regime_types import MarketRegime

class RegimeSelector:
    def __init__(self, config: dict = None):
        self.config = config or {}
    
    def get_current_regime(self) -> MarketRegime:
        manual_regime = self.config.get('manual_regime')
        
        if manual_regime:
            try:
                return MarketRegime(manual_regime.upper())
            except ValueError:
                pass
        
        return MarketRegime.UNKNOWN
    
    def should_run_long_bot(self, regime: MarketRegime = None) -> bool:
        if regime is None:
            regime = self.get_current_regime()
        
        return regime in [MarketRegime.UPTREND, MarketRegime.RANGE]
    
    def should_run_short_bot(self, regime: MarketRegime = None) -> bool:
        if regime is None:
            regime = self.get_current_regime()
        
        return regime in [MarketRegime.DOWNTREND, MarketRegime.RANGE]
