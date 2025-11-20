import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { BotsPage } from "@/pages/BotsPage";
import { MarketSignalsPage } from "@/pages/MarketSignalsPage";
import { PositionsPage } from "@/pages/PositionsPage";
import { TradesPage } from "@/pages/TradesPage";
import { WalletPage } from "@/pages/WalletPage";
import { SettingsPage } from "@/pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/bots",
    element: <BotsPage />,
  },
  {
    path: "/analytics",
    element: <MarketSignalsPage />,
  },
  {
    path: "/positions",
    element: <PositionsPage />,
  },
  {
    path: "/trades",
    element: <TradesPage />,
  },
  {
    path: "/wallet",
    element: <WalletPage />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
  },
]);
