import { motion } from "framer-motion";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ClockIcon,
  TrashIcon,
  BoltIcon,
  ShieldCheckIcon,
  CubeTransparentIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

interface SignalCardProps {
  signal: any;
  onClick?: () => void;
  onDelete?: () => void;
}

export const SignalCard = ({ signal, onClick, onDelete }: SignalCardProps) => {
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

  const getTrendColor = (trend: string) => {
    switch (trend?.toUpperCase()) {
      case "UPTREND":
        return "text-green-400 bg-green-500/10";
      case "DOWNTREND":
        return "text-red-400 bg-red-500/10";
      case "SIDEWAYS":
        return "text-yellow-400 bg-yellow-500/10";
      default:
        return "text-blue-400 bg-blue-500/10";
    }
  };

  const getMomentumColor = (momentum: string) => {
    switch (momentum?.toUpperCase()) {
      case "BULLISH":
        return "text-green-400 bg-green-500/10";
      case "BEARISH":
        return "text-red-400 bg-red-500/10";
      case "NEUTRAL":
        return "text-gray-400 bg-gray-500/10";
      default:
        return "text-purple-400 bg-purple-500/10";
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength?.toUpperCase()) {
      case "STRONG":
        return "text-green-400 bg-green-500/10";
      case "WEAK":
        return "text-orange-400 bg-orange-500/10";
      case "MODERATE":
        return "text-yellow-400 bg-yellow-500/10";
      default:
        return "text-green-400 bg-green-500/10";
    }
  };

  const getStructureColor = (structure: string) => {
    switch (structure?.toUpperCase()) {
      case "TRENDING":
        return "text-blue-400 bg-blue-500/10";
      case "CHOPPY":
        return "text-orange-400 bg-orange-500/10";
      case "RANGING":
        return "text-purple-400 bg-purple-500/10";
      default:
        return "text-orange-400 bg-orange-500/10";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend?.toUpperCase()) {
      case "UPTREND":
        return "↑";
      case "DOWNTREND":
        return "↓";
      case "SIDEWAYS":
        return "→";
      default:
        return "•";
    }
  };

  const getMomentumEmoji = (momentum: string) => {
    switch (momentum?.toUpperCase()) {
      case "BULLISH":
        return "🚀";
      case "BEARISH":
        return "🐻";
      case "NEUTRAL":
        return "⚖️";
      default:
        return "";
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  const trend = signal.details?.trend || signal.trend || "N/A";
  const momentum = signal.details?.momentum || signal.momentum || "N/A";
  const strength = signal.details?.strength || signal.strength || "N/A";
  const structure = signal.details?.structure || signal.structure || "N/A";

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-[#131824] border border-[#1e2538] rounded-xl p-5 cursor-pointer hover:border-blue-500/30 transition-all relative group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">{signal.symbol}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="uppercase">{signal.exchange}</span>
            <span>•</span>
            <span className="uppercase">{signal.timeframe}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${getSignalColor(
              signal.signal
            )}`}
          >
            {getSignalIcon(signal.signal)}
            <span className="font-bold text-sm">{signal.signal}</span>
          </div>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete analysis"
            >
              <TrashIcon className="w-4 h-4 text-red-400" />
            </button>
          )}
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
                className={`h-full transition-all ${
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
        <div
          className={`border border-blue-500/20 rounded-lg p-2 ${getTrendColor(
            trend
          )}`}
        >
          <div className="flex items-center gap-1 mb-1">
            <ArrowTrendingUpIcon className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-gray-400">Trend</span>
          </div>
          <p className="text-xs font-bold">
            {getTrendIcon(trend)} {trend}
          </p>
        </div>
        <div
          className={`border border-purple-500/20 rounded-lg p-2 ${getMomentumColor(
            momentum
          )}`}
        >
          <div className="flex items-center gap-1 mb-1">
            <BoltIcon className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-gray-400">Momentum</span>
          </div>
          <p className="text-xs font-bold">
            {getMomentumEmoji(momentum)} {momentum}
          </p>
        </div>
        <div
          className={`border border-green-500/20 rounded-lg p-2 ${getStrengthColor(
            strength
          )}`}
        >
          <div className="flex items-center gap-1 mb-1">
            <ShieldCheckIcon className="w-3 h-3 text-green-400" />
            <span className="text-xs text-gray-400">Strength</span>
          </div>
          <p className="text-xs font-bold">{strength}</p>
        </div>
        <div
          className={`border border-orange-500/20 rounded-lg p-2 ${getStructureColor(
            structure
          )}`}
        >
          <div className="flex items-center gap-1 mb-1">
            <CubeTransparentIcon className="w-3 h-3 text-orange-400" />
            <span className="text-xs text-gray-400">Structure</span>
          </div>
          <p className="text-xs font-bold">{structure}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-[#1e2538]">
        <ClockIcon className="w-4 h-4" />
        <span>{format(new Date(signal.timestamp), "MMM dd, yyyy HH:mm")}</span>
      </div>
    </motion.div>
  );
};
