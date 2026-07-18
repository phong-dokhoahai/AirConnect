import { Redirect, useLocalSearchParams } from "expo-router";

export default function PlanDetailsRoute() {
  const { id = "1" } = useLocalSearchParams<{ id?: string }>();

  return <Redirect href={{ pathname: "/plan/[id]", params: { id } }} />;
}
