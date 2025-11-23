import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import {
  CpuChipIcon,
  BoltIcon,
  ChartBarIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    icon: CpuChipIcon,
    title: "home.features.automated",
    description: "home.features.automatedDesc",
  },
  {
    icon: BoltIcon,
    title: "home.features.realtime",
    description: "home.features.realtimeDesc",
  },
  {
    icon: GlobeAltIcon,
    title: "home.features.multiExchange",
    description: "home.features.multiExchangeDesc",
  },
  {
    icon: ChartBarIcon,
    title: "home.features.advanced",
    description: "home.features.advancedDesc",
  },
];

export const HomePage = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="space-y-16">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
          >
            <CpuChipIcon className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text"
          >
            {t("home.welcome")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            {t("home.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/bots">
              <Button size="lg" variant="primary">
                {t("home.startTrading")}
              </Button>
            </Link>
          </motion.div>
        </motion.section>

        <section>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-center mb-12"
          >
            {t("home.features.title")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-[#131824] rounded-xl border border-[#1e2538] p-6 hover:border-blue-500/50 transition-all"
              >
                <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {t(feature.title)}
                </h3>
                <p className="text-gray-400">{t(feature.description)}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};
