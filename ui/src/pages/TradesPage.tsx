import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { AgGridReact } from "ag-grid-react";
import { Layout } from "@/components/layout/Layout";
import { Loading } from "@/components/ui/Loading";
import { useTrades } from "@/hooks/useData";
import { format } from "date-fns";
import { Trade } from "@/types/api";
import { ColDef } from "ag-grid-community";

export const TradesPage = () => {
  const { t } = useTranslation();
  const { data: tradesData, isLoading } = useTrades({ limit: 100 });

  const columnDefs = [
    {
      field: "timestamp",
      headerName: t("trades.time"),
      width: 180,
      cellRenderer: (params: any) =>
        format(new Date(params.value), "MMM dd, HH:mm:ss"),
    },
    {
      field: "symbol",
      headerName: t("trades.symbol"),
      width: 140,
      cellRenderer: (params: any) => (
        <span className="font-semibold text-white">{params.value}</span>
      ),
    },
    {
      field: "side",
      headerName: t("trades.side"),
      width: 100,
      cellRenderer: (params: any) => (
        <span
          className={
            params.value === "BUY"
              ? "text-green-400 font-semibold"
              : "text-red-400 font-semibold"
          }
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "type",
      headerName: t("trades.type"),
      width: 100,
    },
    {
      field: "price",
      headerName: t("trades.price"),
      width: 140,
      cellRenderer: (params: any) => `$${params.value.toFixed(2)}`,
    },
    {
      field: "amount",
      headerName: t("trades.amount"),
      width: 140,
      cellRenderer: (params: any) => params.value.toFixed(6),
    },
    {
      field: "total",
      headerName: t("trades.total"),
      width: 140,
      cellRenderer: (params: any) => `$${params.value.toFixed(2)}`,
    },
    {
      field: "fee",
      headerName: t("trades.fee"),
      width: 100,
      cellRenderer: (params: any) => `$${params.value.toFixed(2)}`,
    },
    {
      field: "pnl",
      headerName: t("trades.pnl"),
      width: 130,
      cellRenderer: (params: any) => {
        if (!params.value) return "-";
        const pnl = params.value;
        return (
          <span
            className={
              pnl >= 0
                ? "text-green-400 font-semibold"
                : "text-red-400 font-semibold"
            }
          >
            ${pnl.toFixed(2)}
          </span>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <Layout>
        <Loading fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold"
        >
          {t("trades.title")}
        </motion.h1>

        {tradesData?.data && tradesData.data.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="ag-theme-alpine-dark h-[600px] rounded-xl overflow-hidden border border-[#1e2538]"
          >
            <AgGridReact<Trade>
              rowData={tradesData.data}
              columnDefs={columnDefs as ColDef<Trade>[]}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
              }}
              animateRows
              rowHeight={60}
              headerHeight={50}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-[#131824] rounded-xl border border-[#1e2538]"
          >
            <p className="text-gray-400 text-lg">{t("trades.noTrades")}</p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};
