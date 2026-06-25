import { Text } from "react-native";

import { Row } from "./Row";

export function SummaryRow({
  label,
  value,
  tone = "text-gray-950",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <Row className="mb-3 justify-between">
      <Text className="text-gray-600">{label}</Text>
      <Text className={`font-bold ${tone}`}>{value}</Text>
    </Row>
  );
}
