import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  HomeIcon,
  CpuChipIcon,
  WalletIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowRightStartOnRectangleIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";
import { GlobeAltIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { path: "/", icon: HomeIcon, label: "nav.home" },
  { path: "/bots", icon: CpuChipIcon, label: "nav.bots" },
  { path: "/analytics", icon: SignalIcon, label: "nav.analytics" },
  { path: "/positions", icon: ChartBarIcon, label: "nav.positions" },
  { path: "/trades", icon: ClockIcon, label: "nav.trades" },
  { path: "/wallet", icon: WalletIcon, label: "nav.wallet" },
];

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { logout } = useAuth();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "he" : "en";
    i18n.changeLanguage(newLang);
    document.dir = newLang === "he" ? "rtl" : "ltr";
  };

  const handleLogout = () => {
    {
      logout();
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-[#131824]/80 backdrop-blur-xl border-b border-[#1e2538] sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
            >
              <CpuChipIcon className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-white">CryptoBot</span>
          </Link>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden md:inline">{t(item.label)}</span>
                  </motion.div>
                </Link>
              );
            })}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
              title={t("nav.changeLanguage", "Change Language")}
            >
              <GlobeAltIcon className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:text-white hover:bg-red-600/20 border border-red-500/20 hover:border-red-500 transition-all"
              title={t("auth.logout")}
            >
              <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
              <span className="hidden md:inline">{t("auth.logout")}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
