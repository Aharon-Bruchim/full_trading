import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  ShieldCheckIcon,
  CubeTransparentIcon,
} from "@heroicons/react/24/outline";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SignalForm } from "@/components/signals/SignalForm";
import { SignalCard } from "@/components/signals/SignalCard";
import { SignalFlowDiagram } from "@/components/signals/SignalFlowDiagram";
import { SignalDetailsModal } from "@/components/signals/SignalDetailsModal";
import { useGetSignal } from "@/hooks/useMarketSignals";
import { SignalRequest } from "@/types/signal-types";

export const MarketSignalsPage = () => {
  const { t } = useTranslation();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<any>(null);
  const [latestSignals, setLatestSignals] = useState<any[]>([]);

  const getSignal = useGetSignal();

  const handleAnalyze = async (data: SignalRequest) => {
    const result = await getSignal.mutateAsync(data);
    setLatestSignals([result, ...latestSignals].slice(0, 6));
    setIsFormModalOpen(false);
  };

  const handleDeleteSignal = (signalId: string) => {
    setLatestSignals((prev) => prev.filter((signal) => signal.id !== signalId));
    if (selectedSignal?.id === signalId) {
      setSelectedSignal(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {t("signals.title")}
            </h1>
            <p className="text-gray-400 mt-2">{t("signals.subtitle")}</p>
          </motion.div>

          <Button
            variant="primary"
            icon={<ChartBarIcon className="w-5 h-5" />}
            onClick={() => setIsFormModalOpen(true)}
          >
            {t("signals.analyze")}
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowTrendingUpIcon className="w-6 h-6 text-blue-400" />
              <span className="text-gray-400 text-sm">
                {t("signals.weights.trend")}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">35%</p>
            <p className="text-xs text-gray-500 mt-1">
              {t("signals.weights.weightInScoring")}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <BoltIcon className="w-6 h-6 text-purple-400" />
              <span className="text-gray-400 text-sm">
                {t("signals.weights.momentum")}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">30%</p>
            <p className="text-xs text-gray-500 mt-1">
              {t("signals.weights.weightInScoring")}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheckIcon className="w-6 h-6 text-green-400" />
              <span className="text-gray-400 text-sm">
                {t("signals.weights.strength")}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">20%</p>
            <p className="text-xs text-gray-500 mt-1">
              {t("signals.weights.weightInScoring")}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CubeTransparentIcon className="w-6 h-6 text-orange-400" />
              <span className="text-gray-400 text-sm">
                {t("signals.weights.structure")}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">15%</p>
            <p className="text-xs text-gray-500 mt-1">
              {t("signals.weights.weightInScoring")}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SignalFlowDiagram />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-white">
            {t("signals.recent")}
          </h2>

          {latestSignals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestSignals.map((signal: any, index: number) => (
                <SignalCard
                  key={signal.id || index}
                  signal={signal}
                  onClick={() => setSelectedSignal(signal)}
                  onDelete={() => handleDeleteSignal(signal.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#131824] rounded-xl border border-[#1e2538]">
              <ChartBarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">
                {t("signals.noSignals")}
              </p>
              <p className="text-gray-500 mb-6">
                {t("signals.startAnalyzing")}
              </p>
              <Button
                variant="primary"
                icon={<ChartBarIcon className="w-5 h-5" />}
                onClick={() => setIsFormModalOpen(true)}
              >
                {t("signals.analyze")}
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={t("signals.analyzeTitle")}
        maxWidth="xl"
      >
        <SignalForm
          onSubmit={handleAnalyze}
          onCancel={() => setIsFormModalOpen(false)}
          loading={getSignal.isPending}
        />
      </Modal>

      <SignalDetailsModal
        isOpen={!!selectedSignal}
        onClose={() => setSelectedSignal(null)}
        signal={selectedSignal}
      />
    </Layout>
  );
};
