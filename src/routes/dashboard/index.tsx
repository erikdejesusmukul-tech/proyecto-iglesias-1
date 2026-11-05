import { createFileRoute } from "@tanstack/react-router";
import { DashboardIndex } from "@/views/dashboard/DashboardIndex";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});
