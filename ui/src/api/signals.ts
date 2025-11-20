import { SignalRequest, SignalResult } from "@/types/signal-types";
import apiClient from "./client";

export const signalsApi = {
  analyze: async (data: SignalRequest): Promise<SignalResult> => {
    const response = await apiClient.get("/api/signals", {
      params: {
        symbol: data.symbol,
        timeframe: data.timeframe,
        exchange: data.exchange,
      },
    });
    return response.data;
  },
};
