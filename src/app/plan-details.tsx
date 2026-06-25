import { Redirect } from "expo-router";

export default function PlanDetailsRoute() {
  return <Redirect href={{ pathname: "/plan/[id]", params: { id: "1" } }} />;
}
