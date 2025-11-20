import { motion } from "framer-motion";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

interface SignalCardProps {
  signal: any;
  onClick?: () => void;
}

export const SignalCard = ({ signal, onClick }: SignalCardProps) => {
  const getSignalColor = (signalType: string) => {
    switch (signalType.toUpperCase()) {
      case "BUY":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "SELL":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getSignalIcon = (signalType: string) => {
    switch (signalType.toUpperCase()) {
      case "BUY":
        return <ArrowTrendingUpIcon className="w-6 h-6" />;
      case "SELL":
        return <ArrowTrendingDownIcon className="w-6 h-6" />;
      default:
        return <MinusIcon className="w-6 h-6" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 0.3) return "text-green-400";
    if (score < -0.3) return "text-red-400";
    return "text-gray-400";
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-[#131824] border border-[#1e2538] rounded-xl p-5 cursor-pointer hover:border-blue-500/30 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">
            {signal.symbol}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="uppercase">{signal.exchange}</span>
            <span>•</span>
            <span className="uppercase">{signal.timeframe}</span>
          </div>
        </div>
        <div
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${getSignalColor(
            signal.signal
          )}`}
        >
          {getSignalIcon(signal.signal)}
          <span className="font-bold text-sm">{signal.signal}</span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Score</span>
          <span className={`text-lg font-bold ${getScoreColor(signal.score)}`}>
            {signal.score.toFixed(3)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Strength</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  signal.strength_percent > 70
                    ? "bg-green-500"
                    : signal.strength_percent > 40
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${signal.strength_percent}%` }}
              />
            </div>
            <span className="text-sm font-bold text-white">
              {signal.strength_percent}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-2">
          <span className="text-xs text-gray-400">Trend</span>
          <p className="text-sm font-semibold text-blue-400">{signal.trend}</p>
        </div>
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-2">
          <span className="text-xs text-gray-400">Momentum</span>
          <p className="text-sm font-semibold text-purple-400">
            {signal.momentum}
          </p>
        </div>
        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-2">
          <span className="text-xs text-gray-400">Strength</span>
          <p className="text-sm font-semibold text-green-400">
            {signal.strength}
          </p>
        </div>
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-2">
          <span className="text-xs text-gray-400">Structure</span>
          <p className="text-sm font-semibold text-orange-400">
            {signal.structure}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-[#1e2538]">
        <ClockIcon className="w-4 h-4" />
        <span>{format(new Date(signal.timestamp), "MMM dd, yyyy HH:mm")}</span>
      </div>
    </motion.div>
  );
};
