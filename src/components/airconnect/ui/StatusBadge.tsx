import type { ESIMStatus } from "@/constants/airconnect";
import { Badge } from "./Badge";

export function StatusBadge({ status }: { status: ESIMStatus }) {
  const label =
    status === "active"
      ? "Active"
      : status === "ready"
        ? "Ready to Install"
        : "Expired";
  const tone =
    status === "active"
      ? "bg-emerald-50 text-emerald-700"
      : status === "ready"
        ? "bg-purple-50 text-[#6915E0]"
        : "bg-gray-100 text-gray-500";
  return <Badge label={label} tone={tone} />;
}
