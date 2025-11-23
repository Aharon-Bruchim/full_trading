import { Modal } from "@/components/ui/Modal";
import {
  ArrowTrendingUpIcon,
  BoltIcon,
  ShieldCheckIcon,
  CubeTransparentIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

interface SignalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: any;
}

export const SignalDetailsModal = ({
  isOpen,
  onClose,
  signal,
}: SignalDetailsModalProps) => {
  if (!signal) return null;

  const getSignalColor = (signalType: string) => {
    switch (signalType.toUpperCase()) {
      case "BUY":
        return "text-green-400";
      case "SELL":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getSignalBgColor = (signalType: string) => {
    switch (signalType.toUpperCase()) {
      case "BUY":
        return "bg-green-500/10 border-green-500/30";
      case "SELL":
        return "bg-red-500/10 border-red-500/30";
      default:
        return "bg-gray-500/10 border-gray-500/30";
    }
  };

  const getCategoryColor = (category: string, value: string) => {
    if (category === "trend") {
      switch (value?.toUpperCase()) {
        case "UPTREND":
          return "text-green-400 bg-green-500/10";
        case "DOWNTREND":
          return "text-red-400 bg-red-500/10";
        case "SIDEWAYS":
          return "text-yellow-400 bg-yellow-500/10";
        default:
          return "text-blue-400 bg-blue-500/10";
      }
    }
    if (category === "momentum") {
      switch (value?.toUpperCase()) {
        case "BULLISH":
          return "text-green-400 bg-green-500/10";
        case "BEARISH":
          return "text-red-400 bg-red-500/10";
        case "NEUTRAL":
          return "text-gray-400 bg-gray-500/10";
        default:
          return "text-purple-400 bg-purple-500/10";
      }
    }
    if (category === "strength") {
      switch (value?.toUpperCase()) {
        case "STRONG":
          return "text-green-400 bg-green-500/10";
        case "WEAK":
          return "text-orange-400 bg-orange-500/10";
        case "MODERATE":
          return "text-yellow-400 bg-yellow-500/10";
        default:
          return "text-green-400 bg-green-500/10";
      }
    }
    if (category === "structure") {
      switch (value?.toUpperCase()) {
        case "TRENDING":
          return "text-blue-400 bg-blue-500/10";
        case "CHOPPY":
          return "text-orange-400 bg-orange-500/10";
        case "RANGING":
          return "text-purple-400 bg-purple-500/10";
        default:
          return "text-orange-400 bg-orange-500/10";
      }
    }
    return "text-gray-400 bg-gray-500/10";
  };

  const indicators = signal.details?.indicators || signal.indicators || {};
  const trendDetails = indicators.trend_details || {};
  const momentumDetails = indicators.momentum_details || {};
  const strengthDetails = indicators.strength_details || {};
  const structureDetails = indicators.structure_details || {};
  const scoreBreakdown = indicators.score_breakdown || {};

  const trend = signal.details?.trend || signal.trend || "N/A";
  const momentum = signal.details?.momentum || signal.momentum || "N/A";
  const strength = signal.details?.strength || signal.strength || "N/A";
  const structure = signal.details?.structure || signal.structure || "N/A";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${signal.symbol} Signal Analysis`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        <div className="bg-[#1a1f2e] rounded-lg p-6 border border-[#2a3441]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">
                {signal.symbol}
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <ChartBarIcon className="w-4 h-4" />
                  {signal.exchange?.toUpperCase() || "N/A"}
                </span>
                <span>•</span>
                <span>{signal.timeframe || "N/A"}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {signal.timestamp
                    ? format(
                        new Date(signal.timestamp),
                        "MMM dd, yyyy HH:mm:ss"
                      )
                    : "N/A"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`inline-block px-6 py-3 rounded-lg border ${getSignalBgColor(
                  signal.signal
                )}`}
              >
                <p
                  className={`text-3xl font-bold ${getSignalColor(
                    signal.signal
                  )}`}
                >
                  {signal.signal}
                </p>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Score:{" "}
                <span className="font-bold">{signal.score?.toFixed(3)}</span>
              </p>
              <p className="text-gray-400 text-sm">
                Strength:{" "}
                <span className="font-bold">{signal.strength_percent}%</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-gray-400">Trend</p>
              </div>
              <p
                className={`text-sm font-bold px-2 py-1 rounded ${getCategoryColor(
                  "trend",
                  trend
                )}`}
              >
                {trend}
              </p>
            </div>
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BoltIcon className="w-4 h-4 text-purple-400" />
                <p className="text-xs text-gray-400">Momentum</p>
              </div>
              <p
                className={`text-sm font-bold px-2 py-1 rounded ${getCategoryColor(
                  "momentum",
                  momentum
                )}`}
              >
                {momentum}
              </p>
            </div>
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                <p className="text-xs text-gray-400">Strength</p>
              </div>
              <p
                className={`text-sm font-bold px-2 py-1 rounded ${getCategoryColor(
                  "strength",
                  strength
                )}`}
              >
                {strength}
              </p>
            </div>
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CubeTransparentIcon className="w-4 h-4 text-orange-400" />
                <p className="text-xs text-gray-400">Structure</p>
              </div>
              <p
                className={`text-sm font-bold px-2 py-1 rounded ${getCategoryColor(
                  "structure",
                  structure
                )}`}
              >
                {structure}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1f2e] rounded-lg p-6 border border-[#2a3441]">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-blue-400" />
            Score Breakdown
          </h4>
          <div className="space-y-3">
            {Object.entries(scoreBreakdown).map(
              ([key, value]: [string, any]) => {
                const label = key
                  .replace("_contribution", "")
                  .replace("_", " ");
                const percentage = Math.abs(value * 100);
                const isPositive = value >= 0;

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400 capitalize">
                        {label}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          isPositive ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {value.toFixed(3)} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isPositive ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1a1f2e] rounded-lg p-5 border border-[#2a3441]">
            <div className="flex items-center gap-2 mb-4">
              <ArrowTrendingUpIcon className="w-5 h-5 text-blue-400" />
              <h4 className="text-lg font-bold text-white">Trend Analysis</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Price</span>
                <span className="text-white font-semibold">
                  ${trendDetails.current_price?.toFixed(2) || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">MA50</span>
                <span className="text-white font-semibold">
                  ${trendDetails.ma50?.toFixed(2) || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">MA200</span>
                <span className="text-white font-semibold">
                  ${trendDetails.ma200?.toFixed(2) || "N/A"}
                </span>
              </div>
              <div className="h-px bg-gray-700 my-2" />
              <div className="flex justify-between">
                <span className="text-gray-400">Price vs MA50</span>
                <span
                  className={`font-semibold ${
                    trendDetails.price_vs_ma50 >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {trendDetails.price_vs_ma50 >= 0 ? "+" : ""}
                  {trendDetails.price_vs_ma50?.toFixed(2) || "N/A"}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price vs MA200</span>
                <span
                  className={`font-semibold ${
                    trendDetails.price_vs_ma200 >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {trendDetails.price_vs_ma200 >= 0 ? "+" : ""}
                  {trendDetails.price_vs_ma200?.toFixed(2) || "N/A"}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1f2e] rounded-lg p-5 border border-[#2a3441]">
            <div className="flex items-center gap-2 mb-4">
              <BoltIcon className="w-5 h-5 text-purple-400" />
              <h4 className="text-lg font-bold text-white">
                Momentum Indicators
              </h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">RSI</span>
                <span
                  className={`font-semibold ${
                    momentumDetails.rsi > 70
                      ? "text-red-400"
                      : momentumDetails.rsi < 30
                      ? "text-green-400"
                      : "text-white"
                  }`}
                >
                  {momentumDetails.rsi?.toFixed(2) || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">MACD</span>
                <span className="text-white font-semibold">
                  {momentumDetails.macd?.toFixed(2) || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">MACD Signal</span>
                <span className="text-white font-semibold">
                  {momentumDetails.macd_signal?.toFixed(2) || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">MACD Histogram</span>
                <span
                  className={`font-semibold ${
                    momentumDetails.macd_histogram >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {momentumDetails.macd_histogram?.toFixed(2) || "N/A"}
                </span>
              </div>
              <div className="h-px bg-gray-700 my-2" />
              <div className="flex justify-between">
                <span className="text-gray-400">Stochastic %K</span>
                <span
                  className={`font-semibold ${
                    momentumDetails.stoch_k > 80
                      ? "text-red-400"
                      : momentumDetails.stoch_k < 20
                      ? "text-green-400"
                      : "text-white"
                  }`}
                >
                  {momentumDetails.stoch_k?.toFixed(2) || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stochastic %D</span>
                <span
                  className={`font-semibold ${
                    momentumDetails.stoch_d > 80
                      ? "text-red-400"
                      : momentumDetails.stoch_d < 20
                      ? "text-green-400"
                      : "text-white"
                  }`}
                >
                  {momentumDetails.stoch_d?.toFixed(2) || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1f2e] rounded-lg p-5 border border-[#2a3441]">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheckIcon className="w-5 h-5 text-green-400" />
              <h4 className="text-lg font-bold text-white">Strength Metrics</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">ADX</span>
                <span
                  className={`font-semibold ${
                    strengthDetails.adx > 25
                      ? "text-green-400"
                      : "text-orange-400"
                  }`}
                >
                  {strengthDetails.adx?.toFixed(2) || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">+DI</span>
                <span className="text-green-400 font-semibold">
                  {strengthDetails.plus_di?.toFixed(2) || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">-DI</span>
                <span className="text-red-400 font-semibold">
                  {strengthDetails.minus_di?.toFixed(2) || "N/A"}
                </span>
              </div>
              <div className="h-px bg-gray-700 my-2" />
              <div className="flex justify-between">
                <span className="text-gray-400">DI Difference</span>
                <span
                  className={`font-semibold ${
                    strengthDetails.di_diff >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {strengthDetails.di_diff >= 0 ? "+" : ""}
                  {strengthDetails.di_diff?.toFixed(2) || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1f2e] rounded-lg p-5 border border-[#2a3441]">
            <div className="flex items-center gap-2 mb-4">
              <CubeTransparentIcon className="w-5 h-5 text-orange-400" />
              <h4 className="text-lg font-bold text-white">Market Structure</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Swing Highs</span>
                <span className="text-white font-semibold">
                  {structureDetails.swing_high_count || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Swing Lows</span>
                <span className="text-white font-semibold">
                  {structureDetails.swing_low_count || 0}
                </span>
              </div>
              {structureDetails.last_swing_high && (
                <>
                  <div className="h-px bg-gray-700 my-2" />
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Last High</span>
                    <span className="text-green-400 font-semibold text-xs">
                      $
                      {structureDetails.last_swing_high.value?.toLocaleString() ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Candles Ago</span>
                    <span className="text-gray-400 font-semibold text-xs">
                      {300 - (structureDetails.last_swing_high.index || 0)}
                    </span>
                  </div>
                </>
              )}
              {structureDetails.last_swing_low && (
                <>
                  <div className="h-px bg-gray-700 my-2" />
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Last Low</span>
                    <span className="text-red-400 font-semibold text-xs">
                      $
                      {structureDetails.last_swing_low.value?.toLocaleString() ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Candles Ago</span>
                    <span className="text-gray-400 font-semibold text-xs">
                      {300 - (structureDetails.last_swing_low.index || 0)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {(momentumDetails.rsi > 70 ||
          momentumDetails.rsi < 30 ||
          strengthDetails.adx < 20) && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="font-semibold text-blue-400">⚠️ Note:</span> This
              analysis is based on technical indicators and should not be used
              as the sole basis for trading decisions.
              {momentumDetails.rsi > 70 && (
                <span className="text-orange-400">
                  {" "}
                  RSI is in overbought territory ({">"}70) - consider waiting
                  for a pullback.
                </span>
              )}
              {momentumDetails.rsi < 30 && (
                <span className="text-orange-400">
                  {" "}
                  RSI is in oversold territory ({"<"}30) - potential bounce
                  opportunity.
                </span>
              )}
              {strengthDetails.adx < 20 && (
                <span className="text-orange-400">
                  {" "}
                  ADX is weak ({"<"}20) - trend strength is low, avoid
                  trend-following strategies.
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
