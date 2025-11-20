import { Modal } from "@/components/ui/Modal";
import {
  ArrowTrendingUpIcon,
  BoltIcon,
  ShieldCheckIcon,
  CubeTransparentIcon,
} from "@heroicons/react/24/outline";

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

  const indicators = signal.indicators || {};
  const trendDetails = indicators.trend_details || {};
  const momentumDetails = indicators.momentum_details || {};
  const strengthDetails = indicators.strength_details || {};
  const structureDetails = indicators.structure_details || {};
  const scoreBreakdown = indicators.score_breakdown || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${signal.symbol} Signal Analysis`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        <div className="bg-[#1a1f2e] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {signal.symbol}
              </h3>
              <p className="text-gray-400 text-sm">
                {signal.exchange.toUpperCase()} • {signal.timeframe}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`text-3xl font-bold ${getSignalColor(
                  signal.signal
                )}`}
              >
                {signal.signal}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Score: {signal.score.toFixed(3)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Trend</p>
              <p className="text-sm font-bold text-blue-400">{signal.trend}</p>
            </div>
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Momentum</p>
              <p className="text-sm font-bold text-purple-400">
                {signal.momentum}
              </p>
            </div>
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Strength</p>
              <p className="text-sm font-bold text-green-400">
                {signal.strength}
              </p>
            </div>
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Structure</p>
              <p className="text-sm font-bold text-orange-400">
                {signal.structure}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1f2e] rounded-lg p-6">
          <h4 className="text-lg font-bold text-white mb-4">
            Score Breakdown
          </h4>
          <div className="space-y-3">
            {Object.entries(scoreBreakdown).map(([key, value]: [string, any]) => {
              const label = key.replace("_contribution", "").replace("_", " ");
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
                      {value.toFixed(3)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        isPositive ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1a1f2e] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <ArrowTrendingUpIcon className="w-5 h-5 text-blue-400" />
              <h4 className="text-lg font-bold text-white">Trend Analysis</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Price</span>
                <span className="text-white font-semibold">
                  ${trendDetails.current_price?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">MA50</span>
                <span className="text-white font-semibold">
                  ${trendDetails.ma50?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">MA200</span>
                <span className="text-white font-semibold">
                  ${trendDetails.ma200?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price vs MA50</span>
                <span
                  className={`font-semibold ${
                    trendDetails.price_vs_ma50 >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {trendDetails.price_vs_ma50?.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1f2e] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <BoltIcon className="w-5 h-5 text-purple-400" />
              <h4 className="text-lg font-bold text-white">
                Momentum Indicators
              </h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">RSI</span>
                <span className="text-white font-semibold">
                  {momentumDetails.rsi?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">MACD</span>
                <span className="text-white font-semibold">
                  {momentumDetails.macd?.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">MACD Signal</span>
                <span className="text-white font-semibold">
                  {momentumDetails.macd_signal?.toFixed(4)}
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
                  {momentumDetails.macd_histogram?.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1f2e] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheckIcon className="w-5 h-5 text-green-400" />
              <h4 className="text-lg font-bold text-white">
                Strength Metrics
              </h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">ADX</span>
                <span className="text-white font-semibold">
                  {strengthDetails.adx?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">+DI</span>
                <span className="text-green-400 font-semibold">
                  {strengthDetails.plus_di?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">-DI</span>
                <span className="text-red-400 font-semibold">
                  {strengthDetails.minus_di?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1f2e] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <CubeTransparentIcon className="w-5 h-5 text-orange-400" />
              <h4 className="text-lg font-bold text-white">
                Market Structure
              </h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Pattern</span>
                <span className="text-white font-semibold">
                  {structureDetails.pattern || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Higher Highs</span>
                <span className="text-white font-semibold">
                  {structureDetails.higher_highs || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Lower Lows</span>
                <span className="text-white font-semibold">
                  {structureDetails.lower_lows || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
