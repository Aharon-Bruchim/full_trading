import apiClient from "./client";

export interface Balance {
  exchange: string;
  asset: string;
  free: number;
  locked: number;
  total: number;
  unrealizedPnl?: number;
}

export interface BalanceResponse {
  success: boolean;
  data: Balance[];
}

export const walletApi = {
  getBitunixBalance: async (): Promise<BalanceResponse> => {
    const response = await apiClient.get("/api/balances");
    return response.data;
  },
};
