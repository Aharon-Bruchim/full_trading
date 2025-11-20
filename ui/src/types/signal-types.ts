export interface SignalRequest {
  symbol: string;
  timeframe: string;
  exchange: string;
  limit?: number;
}

export interface SignalResult {
  id?: string;
  signal: "BUY" | "SELL" | "HOLD";
  score: number;
  strength_percent: number;
  trend: string;
  momentum: string;
  strength: string;
  structure: string;
  symbol: string;
  timeframe: string;
  exchange: string;
  timestamp: string;
  indicators: {
    trend_details: {
      trend: string;
      current_price: number;
      ma50: number;
      ma200: number;
      price_vs_ma50: number;
      price_vs_ma200: number;
    };
    momentum_details: {
      momentum: string;
      rsi: number;
      macd: number;
      macd_signal: number;
      macd_histogram: number;
      stoch_k: number;
      stoch_d: number;
    };
    strength_details: {
      strength: string;
      adx: number;
      plus_di: number;
      minus_di: number;
    };
    structure_details: {
      structure: string;
      pattern?: string;
      higher_highs?: number;
      lower_lows?: number;
    };
    score_breakdown: {
      trend_contribution: number;
      momentum_contribution: number;
      strength_contribution: number;
      structure_contribution: number;
    };
  };
}

export type SignalType = "BUY" | "SELL" | "HOLD";

export interface SignalFilters {
  symbol?: string;
  exchange?: string;
  timeframe?: string;
  signal?: SignalType;
  dateFrom?: string;
  dateTo?: string;
}
