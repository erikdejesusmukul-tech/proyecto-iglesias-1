import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/views/dashboard/DashboardLayout";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  component: DashboardLayout,
});
