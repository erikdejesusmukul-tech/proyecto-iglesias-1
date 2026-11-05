import { createFileRoute } from "@tanstack/react-router";
import { ConfiguracionIndex } from "@/views/dashboard/ConfiguracionIndex";

export const Route = createFileRoute("/dashboard/configuracion")({
  component: ConfiguracionIndex,
});
