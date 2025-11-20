import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signalsApi } from "@/api/signals";
import { SignalRequest } from "@/types/signal-types";
import { toast } from "react-toastify";

export const SIGNALS_QUERY_KEY = "marketSignals";

export const useGetSignal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignalRequest) => signalsApi.analyze(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SIGNALS_QUERY_KEY] });
      toast.success("Signal analysis completed!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to analyze signal");
    },
  });
};
