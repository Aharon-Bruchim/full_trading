import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { SignalRequest } from "@/types/signal-types";
import SymbolSelector from "@/data/SymbolSelector";

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
  const { t } = useTranslation();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignalRequest>({
    defaultValues: {
      symbol: "BTCUSDT",
      exchange: "binance",
      timeframe: "1h",
      limit: 300,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Controller
          name="symbol"
          control={control}
          rules={{
            required: t("signals.form.symbolRequired"),
          }}
          render={({ field }) => (
            <SymbolSelector
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              error={errors.symbol?.message}
              availableBalance={null}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t("signals.form.exchange")}
          </label>
          <select
            {...register("exchange", {
              required: t("signals.form.exchangeRequired"),
            })}
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
            {t("signals.form.timeframe")}
          </label>
          <select
            {...register("timeframe", {
              required: t("signals.form.timeframeRequired"),
            })}
            className="w-full bg-[#1a1f2e] border border-[#2a3142] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="1m">{t("signals.form.timeframes.1m")}</option>
            <option value="5m">{t("signals.form.timeframes.5m")}</option>
            <option value="15m">{t("signals.form.timeframes.15m")}</option>
            <option value="30m">{t("signals.form.timeframes.30m")}</option>
            <option value="1h">{t("signals.form.timeframes.1h")}</option>
            <option value="4h">{t("signals.form.timeframes.4h")}</option>
            <option value="1d">{t("signals.form.timeframes.1d")}</option>
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
          {t("signals.form.dataPoints")}
        </label>
        <input
          {...register("limit", {
            required: t("signals.form.limitRequired"),
            min: { value: 100, message: t("signals.form.limitMin") },
            max: { value: 500, message: t("signals.form.limitMax") },
          })}
          type="number"
          placeholder="300"
          className="w-full bg-[#1a1f2e] border border-[#2a3142] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        {errors.limit && (
          <p className="text-red-400 text-sm mt-1">{errors.limit.message}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          {t("signals.form.dataPointsHint")}
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
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          loading={loading}
        >
          {t("signals.analyze")}
        </Button>
      </div>
    </form>
  );
};
