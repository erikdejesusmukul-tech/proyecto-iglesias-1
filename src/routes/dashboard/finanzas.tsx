import { createFileRoute } from "@tanstack/react-router";
import { FinanzasIndex } from "@/views/dashboard/FinanzasIndex";

export const Route = createFileRoute("/dashboard/finanzas")({
  component: FinanzasIndex,
});
