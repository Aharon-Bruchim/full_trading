import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ArrowTrendingUpIcon,
  BoltIcon,
  ShieldCheckIcon,
  CubeTransparentIcon,
  ChartBarIcon,
  ArrowRightIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";

export const SignalFlowDiagram = () => {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-[#131824] rounded-xl border border-[#1e2538] p-8">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <BeakerIcon className="w-6 h-6 text-blue-400" />
        {t("signals.flow.title")}
      </h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="flex-shrink-0 w-48 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ChartBarIcon className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-semibold text-white">
                {t("signals.flow.marketData")}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {t("signals.flow.candlesCount")}
            </p>
          </div>
          <ArrowRightIcon className="w-6 h-6 text-gray-600" />
          <div className="flex-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
            <span className="text-sm font-semibold text-white">
              {t("signals.flow.decisionEngine")}
            </span>
            <p className="text-xs text-gray-400 mt-1">
              {t("signals.flow.multiFactorAnalysis")}
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowTrendingUpIcon className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold text-white">
                {t("signals.flow.trend")}
              </span>
            </div>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                <span>{t("signals.flow.trendIndicators.ma50")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                <span>{t("signals.flow.trendIndicators.ema20")}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-500/20">
                <span className="text-blue-300 font-semibold">
                  {t("signals.flow.trendStatus")}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <BoltIcon className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-bold text-white">
                {t("signals.flow.momentum")}
              </span>
            </div>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                <span>{t("signals.flow.momentumIndicators.rsi")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                <span>{t("signals.flow.momentumIndicators.macd")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                <span>{t("signals.flow.momentumIndicators.stochastic")}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-purple-500/20">
                <span className="text-purple-300 font-semibold">
                  {t("signals.flow.momentumStatus")}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheckIcon className="w-5 h-5 text-green-400" />
              <span className="text-sm font-bold text-white">
                {t("signals.flow.strength")}
              </span>
            </div>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span>{t("signals.flow.strengthIndicators.adx")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span>
                  {t("signals.flow.strengthIndicators.trendStrength")}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-green-500/20">
                <span className="text-green-300 font-semibold">
                  {t("signals.flow.strengthStatus")}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CubeTransparentIcon className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-bold text-white">
                {t("signals.flow.structure")}
              </span>
            </div>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                <span>{t("signals.flow.structureIndicators.higherHighs")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                <span>
                  {t("signals.flow.structureIndicators.marketPatterns")}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-orange-500/20">
                <span className="text-orange-300 font-semibold">
                  {t("signals.flow.structureStatus")}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="flex-1 flex justify-center">
            <ArrowRightIcon className="w-6 h-6 text-gray-600 rotate-90" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="flex-1 bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-white">
                {t("signals.flow.scoringEngine")}
              </span>
              <BeakerIcon className="w-6 h-6 text-pink-400" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-400">{t("signals.flow.trend")}</span>
                <p className="text-blue-400 font-bold text-lg">35%</p>
              </div>
              <div>
                <span className="text-gray-400">
                  {t("signals.flow.momentum")}
                </span>
                <p className="text-purple-400 font-bold text-lg">30%</p>
              </div>
              <div>
                <span className="text-gray-400">
                  {t("signals.flow.strength")}
                </span>
                <p className="text-green-400 font-bold text-lg">20%</p>
              </div>
              <div>
                <span className="text-gray-400">
                  {t("signals.flow.structure")}
                </span>
                <p className="text-orange-400 font-bold text-lg">15%</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-pink-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {t("signals.flow.finalScoreRange")}
                </span>
                <span className="text-white font-bold">-1.0 to +1.0</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="flex-1 flex justify-center">
            <ArrowRightIcon className="w-6 h-6 text-gray-600 rotate-90" />
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 text-center">
            <span className="text-2xl font-bold text-green-400">
              {t("signals.actions.buy")}
            </span>
            <p className="text-xs text-gray-400 mt-2">Score {"> 0.3"}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-500/20 to-slate-500/20 border border-gray-500/30 rounded-lg p-4 text-center">
            <span className="text-2xl font-bold text-gray-400">
              {t("signals.actions.hold")}
            </span>
            <p className="text-xs text-gray-400 mt-2">Score -0.3 to 0.3</p>
          </div>
          <div className="bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 rounded-lg p-4 text-center">
            <span className="text-2xl font-bold text-red-400">
              {t("signals.actions.sell")}
            </span>
            <p className="text-xs text-gray-400 mt-2">Score {"< -0.3"}</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
