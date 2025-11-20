import { motion } from "framer-motion";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface SignalStatsProps {
  signals: any[];
}

export const SignalStats = ({ signals }: SignalStatsProps) => {
  const stats = {
    total: signals.length,
    buy: signals.filter((s) => s.signal === "BUY").length,
    sell: signals.filter((s) => s.signal === "SELL").length,
    hold: signals.filter((s) => s.signal === "HOLD").length,
    avgScore: signals.length
      ? signals.reduce((acc, s) => acc + s.score, 0) / signals.length
      : 0,
    strongSignals: signals.filter(
      (s) => Math.abs(s.score) > 0.5 && s.strength === "STRONG"
    ).length,
    uptrends: signals.filter((s) => s.trend === "UPTREND").length,
    downtrends: signals.filter((s) => s.trend === "DOWNTREND").length,
  };

  const cards = [
    {
      title: "Total Signals",
      value: stats.total,
      icon: <ChartBarIcon className="w-6 h-6" />,
      color: "from-blue-500/20 to-blue-600/10",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-400",
    },
    {
      title: "Buy Signals",
      value: stats.buy,
      icon: <ArrowTrendingUpIcon className="w-6 h-6" />,
      color: "from-green-500/20 to-green-600/10",
      borderColor: "border-green-500/30",
      textColor: "text-green-400",
      percentage: stats.total
        ? ((stats.buy / stats.total) * 100).toFixed(1)
        : 0,
    },
    {
      title: "Sell Signals",
      value: stats.sell,
      icon: <ArrowTrendingDownIcon className="w-6 h-6" />,
      color: "from-red-500/20 to-red-600/10",
      borderColor: "border-red-500/30",
      textColor: "text-red-400",
      percentage: stats.total
        ? ((stats.sell / stats.total) * 100).toFixed(1)
        : 0,
    },
    {
      title: "Hold Signals",
      value: stats.hold,
      icon: <CheckCircleIcon className="w-6 h-6" />,
      color: "from-gray-500/20 to-gray-600/10",
      borderColor: "border-gray-500/30",
      textColor: "text-gray-400",
      percentage: stats.total
        ? ((stats.hold / stats.total) * 100).toFixed(1)
        : 0,
    },
    {
      title: "Strong Signals",
      value: stats.strongSignals,
      icon: <CheckCircleIcon className="w-6 h-6" />,
      color: "from-purple-500/20 to-purple-600/10",
      borderColor: "border-purple-500/30",
      textColor: "text-purple-400",
      subtitle: "Score > 0.5 & Strong",
    },
    {
      title: "Uptrends",
      value: stats.uptrends,
      icon: <ArrowTrendingUpIcon className="w-6 h-6" />,
      color: "from-emerald-500/20 to-emerald-600/10",
      borderColor: "border-emerald-500/30",
      textColor: "text-emerald-400",
    },
    {
      title: "Downtrends",
      value: stats.downtrends,
      icon: <ArrowTrendingDownIcon className="w-6 h-6" />,
      color: "from-rose-500/20 to-rose-600/10",
      borderColor: "border-rose-500/30",
      textColor: "text-rose-400",
    },
    {
      title: "Avg Score",
      value: stats.avgScore.toFixed(3),
      icon: <ChartBarIcon className="w-6 h-6" />,
      color: "from-cyan-500/20 to-cyan-600/10",
      borderColor: "border-cyan-500/30",
      textColor: "text-cyan-400",
      subtitle: "All signals average",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Signal Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className={`bg-gradient-to-br ${card.color} border ${card.borderColor} rounded-xl p-5`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={card.textColor}>{card.icon}</div>
              {card.percentage && (
                <span className="text-xs font-bold text-gray-400">
                  {card.percentage}%
                </span>
              )}
            </div>

            <h3 className="text-sm text-gray-400 mb-1">{card.title}</h3>
            <p className={`text-3xl font-bold ${card.textColor}`}>
              {card.value}
            </p>

            {card.subtitle && (
              <p className="text-xs text-gray-500 mt-2">{card.subtitle}</p>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#1a1f2e] rounded-xl p-6 border border-[#2a3142]"
      >
        <h3 className="text-lg font-bold text-white mb-4">
          Signal Distribution
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Buy vs Sell Ratio</span>
              <span className="text-sm font-bold text-white">
                {stats.total
                  ? (stats.buy / (stats.sell || 1)).toFixed(2)
                  : "0.00"}
                :1
              </span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-700">
              <div
                className="bg-green-500"
                style={{
                  width: `${
                    stats.total ? (stats.buy / stats.total) * 100 : 0
                  }%`,
                }}
              />
              <div
                className="bg-red-500"
                style={{
                  width: `${
                    stats.total ? (stats.sell / stats.total) * 100 : 0
                  }%`,
                }}
              />
              <div
                className="bg-gray-500"
                style={{
                  width: `${
                    stats.total ? (stats.hold / stats.total) * 100 : 0
                  }%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Buy: {stats.buy}</span>
              <span>Sell: {stats.sell}</span>
              <span>Hold: {stats.hold}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                Trend Direction Balance
              </span>
              <span className="text-sm font-bold text-white">
                {stats.total
                  ? ((stats.uptrends / stats.total) * 100).toFixed(1)
                  : "0.0"}
                % UP
              </span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-700">
              <div
                className="bg-emerald-500"
                style={{
                  width: `${
                    stats.total ? (stats.uptrends / stats.total) * 100 : 0
                  }%`,
                }}
              />
              <div
                className="bg-rose-500"
                style={{
                  width: `${
                    stats.total ? (stats.downtrends / stats.total) * 100 : 0
                  }%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Uptrends: {stats.uptrends}</span>
              <span>Downtrends: {stats.downtrends}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
