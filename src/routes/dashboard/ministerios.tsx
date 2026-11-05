import { createFileRoute } from "@tanstack/react-router";
import { MinisteriosIndex } from "@/views/dashboard/MinisteriosIndex";

export const Route = createFileRoute("/dashboard/ministerios")({
  component: MinisteriosIndex,
});
