import { createFileRoute } from "@tanstack/react-router";
import { EventosIndex } from "@/views/dashboard/EventosIndex";

export const Route = createFileRoute("/dashboard/eventos")({
  component: EventosIndex,
});
