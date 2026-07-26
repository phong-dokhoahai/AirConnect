import type { ESIMStatus } from "@/constants/airconnect";
import { useI18n } from "@/lib/i18n";
import { Badge } from "./Badge";

export function StatusBadge({ status }: { status: ESIMStatus }) {
  const { t } = useI18n();
  const label =
    status === "active"
      ? t("common.active")
      : status === "ready"
        ? t("common.readyToInstall")
        : t("common.expired");
  const tone =
    status === "active"
      ? "bg-emerald-50 text-emerald-700"
      : status === "ready"
        ? "bg-purple-50 text-[#6915E0]"
        : "bg-gray-100 text-gray-500";
  return <Badge label={label} tone={tone} />;
}
