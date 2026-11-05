import { createFileRoute } from "@tanstack/react-router";
import { MiembrosIndex } from "@/views/dashboard/MiembrosIndex";

export const Route = createFileRoute("/dashboard/miembros")({
  component: MiembrosIndex,
});
