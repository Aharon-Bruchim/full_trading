import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { SignalRequest } from "@/types/signal-types";

interface SignalFormProps {
  onSubmit: (data: SignalRequest) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const SignalForm = ({
  onSubmit,
  onCancel,
  loading,
}: SignalFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignalRequest>({
    defaultValues: {
      exchange: "binance",
      timeframe: "1h",
      limit: 300,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Symbol
        </label>
        <input
          {...register("symbol", {
            required: "Symbol is required",
            pattern: {
              value: /^[A-Z]+$/,
              message: "Invalid symbol format",
            },
          })}
          type="text"
          placeholder="BTCUSDT"
          className="w-full bg-[#1a1f2e] border border-[#2a3142] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        {errors.symbol && (
          <p className="text-red-400 text-sm mt-1">{errors.symbol.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Exchange
          </label>
          <select
            {...register("exchange", { required: "Exchange is required" })}
            className="w-full bg-[#1a1f2e] border border-[#2a3142] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="binance">Binance</option>
            <option value="bybit">Bybit</option>
            <option value="kucoin">KuCoin</option>
          </select>
          {errors.exchange && (
            <p className="text-red-400 text-sm mt-1">
              {errors.exchange.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Timeframe
          </label>
          <select
            {...register("timeframe", { required: "Timeframe is required" })}
            className="w-full bg-[#1a1f2e] border border-[#2a3142] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="1m">1 Minute</option>
            <option value="5m">5 Minutes</option>
            <option value="15m">15 Minutes</option>
            <option value="30m">30 Minutes</option>
            <option value="1h">1 Hour</option>
            <option value="4h">4 Hours</option>
            <option value="1d">1 Day</option>
          </select>
          {errors.timeframe && (
            <p className="text-red-400 text-sm mt-1">
              {errors.timeframe.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Data Points
        </label>
        <input
          {...register("limit", {
            required: "Limit is required",
            min: { value: 100, message: "Minimum 100 data points" },
            max: { value: 500, message: "Maximum 500 data points" },
          })}
          type="number"
          placeholder="300"
          className="w-full bg-[#1a1f2e] border border-[#2a3142] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        {errors.limit && (
          <p className="text-red-400 text-sm mt-1">{errors.limit.message}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          Number of historical candles to analyze (100-500)
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          loading={loading}
        >
          Analyze
        </Button>
      </div>
    </form>
  );
};
