import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export const AnimatedFlowDiagram = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      title: "Market Data Collection",
      description: "Fetch 300 OHLCV candles",
      color: "from-cyan-500 to-blue-500",
      borderColor: "border-cyan-500/30",
      details: [
        "Symbol: BTC/USDT",
        "Exchange: Binance/Bybit/KuCoin",
        "Timeframe: 1m to 1d",
        "Data Points: 100-500 candles",
      ],
    },
    {
      id: 2,
      title: "Decision Engine",
      description: "Multi-factor analysis hub",
      color: "from-purple-500 to-pink-500",
      borderColor: "border-purple-500/30",
      details: [
        "Parallel analysis execution",
        "4 detection modules",
        "Independent calculations",
        "Real-time processing",
      ],
    },
    {
      id: 3,
      title: "Trend Detection",
      description: "MA & EMA analysis",
      color: "from-blue-500 to-blue-600",
      borderColor: "border-blue-500/30",
      details: [
        "MA50 & MA200 comparison",
        "EMA20 positioning",
        "Price vs MA analysis",
        "Result: UPTREND/DOWNTREND/SIDEWAYS",
      ],
      weight: "35%",
    },
    {
      id: 4,
      title: "Momentum Detection",
      description: "RSI, MACD, Stochastic",
      color: "from-purple-500 to-purple-600",
      borderColor: "border-purple-500/30",
      details: [
        "RSI (14) - Oversold/Overbought",
        "MACD (12/26/9) - Histogram",
        "Stochastic K/D lines",
        "Result: BULLISH/BEARISH/NEUTRAL",
      ],
      weight: "30%",
    },
    {
      id: 5,
      title: "Strength Detection",
      description: "ADX trend strength",
      color: "from-green-500 to-green-600",
      borderColor: "border-green-500/30",
      details: [
        "ADX calculation",
        "+DI / -DI comparison",
        "Trend strength measurement",
        "Result: STRONG/MODERATE/WEAK",
      ],
      weight: "20%",
    },
    {
      id: 6,
      title: "Structure Detection",
      description: "Market patterns",
      color: "from-orange-500 to-orange-600",
      borderColor: "border-orange-500/30",
      details: [
        "Higher Highs/Lows detection",
        "Lower Highs/Lows patterns",
        "Market structure analysis",
        "Result: BULLISH/BEARISH/CHOPPY",
      ],
      weight: "15%",
    },
    {
      id: 7,
      title: "Scoring Engine",
      description: "Weighted calculation",
      color: "from-pink-500 to-rose-500",
      borderColor: "border-pink-500/30",
      details: [
        "Apply weights to each detector",
        "Calculate combined score",
        "Normalize to -1.0 to +1.0",
        "Final score computation",
      ],
    },
    {
      id: 8,
      title: "Signal Generation",
      description: "Buy/Sell/Hold decision",
      color: "from-emerald-500 to-green-500",
      borderColor: "border-emerald-500/30",
      details: [
        "Score > 0.3 → BUY",
        "Score < -0.3 → SELL",
        "-0.3 to 0.3 → HOLD",
        "Return complete analysis",
      ],
    },
  ];

  return (
    <div className="bg-[#131824] rounded-xl border border-[#1e2538] p-8">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <ChartBarIcon className="w-6 h-6 text-blue-400" />
        Interactive Analysis Pipeline
      </h2>

      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.id} className="mb-6 last:mb-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setActiveStep(step.id)}
              onHoverEnd={() => setActiveStep(null)}
              className="relative"
            >
              <motion.div
                className={`bg-gradient-to-r ${step.color} bg-opacity-10 border ${step.borderColor} rounded-lg p-5 cursor-pointer`}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-bold text-gray-500">
                        STEP {step.id}
                      </span>
                      {step.weight && (
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded">
                          {step.weight}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>

                  <motion.div
                    animate={{
                      scale: activeStep === step.id ? 1.2 : 1,
                      rotate: activeStep === step.id ? 90 : 0,
                    }}
                  >
                    <CheckCircleIcon className="w-6 h-6 text-emerald-400" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {activeStep === step.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-white/10">
                        <ul className="space-y-2">
                          {step.details.map((detail, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="flex items-center gap-2 text-sm text-gray-300"
                            >
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                              {detail}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {index < steps.length - 1 && (
                <div className="flex justify-center my-3">
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRightIcon className="w-5 h-5 text-gray-600 rotate-90" />
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg"
      >
        <p className="text-sm text-gray-300 text-center">
          <span className="font-bold text-blue-400">Hover over each step</span>{" "}
          to see detailed information about the analysis process
        </p>
      </motion.div>
    </div>
  );
};
