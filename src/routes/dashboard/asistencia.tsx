import { createFileRoute } from "@tanstack/react-router";
import { AsistenciaIndex } from "@/views/dashboard/AsistenciaIndex";

export const Route = createFileRoute("/dashboard/asistencia")({
  component: AsistenciaIndex,
});
