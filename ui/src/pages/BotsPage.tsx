import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  PlusIcon,
  PlayIcon,
  StopIcon,
  TrashIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Loading } from "@/components/ui/Loading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BotForm } from "@/components/bots/BotForm";
import {
  useBots,
  useCreateBot,
  useStartBot,
  useStopBot,
  useDeleteBot,
} from "@/hooks/useBots";
import { Bot, BotCreateInput, BotStatus } from "@/types/api";
import { format } from "date-fns";
import { DeleteBotModal } from "@/components/bots/DeleteBotModal";

export const BotsPage = () => {
  const { t } = useTranslation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingBot, setDeletingBot] = useState<Bot | null>(null);
  const { data: botsData, isLoading } = useBots();
  const createBot = useCreateBot();
  const startBot = useStartBot();
  const stopBot = useStopBot();
  const deleteBot = useDeleteBot();

  const transformedBots = (botsData || []).map((bot: any) => ({
    ...bot,
    id: bot._id || bot.id,
    stats: bot.stats || { todayPnL: 0 },
  }));

  const handleCreateBot = async (data: BotCreateInput) => {
    await createBot.mutateAsync(data);
    setIsCreateModalOpen(false);
  };

  const handleStartBot = (botId: string) => {
    startBot.mutate(botId);
  };

  const handleStopBot = (botId: string) => {
    stopBot.mutate(botId);
  };

  const handleDeleteClick = (bot: any) => {
    setDeletingBot(bot);
  };

  const handleDeleteConfirm = () => {
    if (deletingBot) {
      deleteBot.mutate(deletingBot.id, {
        onSuccess: () => {
          setDeletingBot(null);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t("bots.title")}</h1>
          <Button
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            {t("bots.createNew")}
          </Button>
        </div>

        {transformedBots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transformedBots.map((bot: any, index: number) => (
              <motion.div
                key={bot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {bot.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={bot.status} />
                      <span className="text-sm text-gray-400">
                        {bot.exchange}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {t("bots.symbol")}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {bot.config?.symbol}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {t("bots.type")}
                    </span>
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                      {bot.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {t("bots.pnl")}
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        (bot.stats?.todayPnL || 0) >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      ${(bot.stats?.todayPnL || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 text-right">
                    {format(new Date(bot.updatedAt), "MMM dd, HH:mm")}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-700">
                  {bot.status === BotStatus.STOPPED && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<PlayIcon className="w-4 h-4" />}
                      onClick={() => handleStartBot(bot.id)}
                      className="flex-1"
                    >
                      Start
                    </Button>
                  )}

                  {bot.status === BotStatus.RUNNING && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<StopIcon className="w-4 h-4" />}
                      onClick={() => handleStopBot(bot.id)}
                      className="flex-1"
                    >
                      Stop
                    </Button>
                  )}

                  <Button
                    variant="danger"
                    size="sm"
                    icon={<TrashIcon className="w-4 h-4" />}
                    onClick={() => handleDeleteClick(bot)}
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ChartBarIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {t("bots.noBots")}
            </h3>
            <p className="text-gray-500 mb-6">{t("bots.createFirst")}</p>
            <Button
              icon={<PlusIcon className="w-5 h-5" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              {t("bots.createNew")}
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t("botForm.create")}
        maxWidth="2xl"
      >
        <BotForm
          onSubmit={handleCreateBot}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={createBot.isPending}
        />
      </Modal>

      <DeleteBotModal
        isOpen={!!deletingBot}
        onClose={() => setDeletingBot(null)}
        bot={deletingBot}
        onConfirm={handleDeleteConfirm}
        loading={deleteBot.isPending}
      />
    </Layout>
  );
};
