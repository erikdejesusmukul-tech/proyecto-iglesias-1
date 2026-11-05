import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const eventSchema = z.object({
  name: z.string().trim().min(2, "Escribe el nombre del evento."),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha válida."),
  eventTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Selecciona una hora válida."),
  description: z.string().trim().max(2000, "La descripción no debe superar 2000 caracteres."),
  ministryId: z.string(),
});

type EventFormValues = z.infer<typeof eventSchema>;
type MinistryOption = { id: string; name: string };

export type EventFormRecord = {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  event_time: string;
  ministry_id: string | null;
};

type EventFormModalProps = {
  open: boolean;
  event?: EventFormRecord | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

const emptyValues: EventFormValues = {
  name: "",
  eventDate: "",
  eventTime: "",
  description: "",
  ministryId: "general",
};

export function EventFormModal({ open, event, onOpenChange, onSuccess }: EventFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMinistries, setIsLoadingMinistries] = useState(false);
  const [ministries, setMinistries] = useState<MinistryOption[]>([]);
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      event
        ? {
            name: event.name,
            eventDate: event.event_date,
            eventTime: event.event_time.slice(0, 5),
            description: event.description ?? "",
            ministryId: event.ministry_id ?? "general",
          }
        : emptyValues,
    );

    let cancelled = false;
    async function loadMinistries() {
      setIsLoadingMinistries(true);
      const { data, error } = await supabase
        .from("ministries")
        .select("id, name")
        .is("deleted_at", null)
        .order("name", { ascending: true });

      if (cancelled) return;
      if (error) {
        setMinistries([]);
        toast.error("No se pudieron cargar los ministerios disponibles.");
      } else {
        setMinistries(data ?? []);
      }
      setIsLoadingMinistries(false);
    }

    void loadMinistries();
    return () => {
      cancelled = true;
    };
  }, [event, form, open]);

  async function onSubmit(values: EventFormValues) {
    setIsLoading(true);
    try {
      const eventValues = {
        name: values.name,
        event_date: values.eventDate,
        event_time: values.eventTime,
        description: values.description || null,
        ministry_id: values.ministryId === "general" ? null : values.ministryId,
      };

      if (event) {
        const { error } = await supabase
          .from("events")
          .update(eventValues)
          .eq("id", event.id)
          .is("deleted_at", null);
        if (error) throw error;
      } else {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Tu sesión no está activa.");

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("church_id")
          .eq("id", user.id)
          .maybeSingle();
        if (profileError || !profile?.church_id)
          throw new Error("No se encontró una iglesia vinculada a tu perfil.");

        const { error } = await supabase.from("events").insert({
          ...eventValues,
          church_id: profile.church_id,
        });
        if (error) throw error;
      }

      toast.success(event ? "Evento actualizado correctamente." : "Evento creado correctamente.");
      form.reset(emptyValues);
      await onSuccess?.();
      onOpenChange(false);
    } catch {
      toast.error("No se pudo guardar el evento. Verifica tus permisos e inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isLoading && onOpenChange(nextOpen)}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto border-ink/10 bg-ivory text-ink sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal text-ink">
            {event ? "Editar evento" : "Nuevo evento"}
          </DialogTitle>
          <DialogDescription className="text-ink/60">
            Registra la fecha, hora y grupo relacionado, si corresponde.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField
            id="event-name"
            label="Nombre del evento"
            error={form.formState.errors.name?.message}
          >
            <Input
              id="event-name"
              placeholder="Ej. Reunión de jóvenes"
              {...form.register("name")}
              className="h-10 border-ink/15 bg-ivory"
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="event-date"
              label="Fecha"
              error={form.formState.errors.eventDate?.message}
            >
              <Input
                id="event-date"
                type="date"
                {...form.register("eventDate")}
                className="h-10 border-ink/15 bg-ivory"
              />
            </FormField>
            <FormField
              id="event-time"
              label="Hora"
              error={form.formState.errors.eventTime?.message}
            >
              <Input
                id="event-time"
                type="time"
                {...form.register("eventTime")}
                className="h-10 border-ink/15 bg-ivory"
              />
            </FormField>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-ministry" className="text-ink">
              Ministerio <span className="text-xs font-normal text-ink/45">(opcional)</span>
            </Label>
            <Controller
              control={form.control}
              name="ministryId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoadingMinistries}
                >
                  <SelectTrigger
                    id="event-ministry"
                    className="h-10 border-ink/15 bg-ivory text-ink"
                  >
                    <SelectValue
                      placeholder={isLoadingMinistries ? "Cargando ministerios…" : "Evento General"}
                    />
                  </SelectTrigger>
                  <SelectContent className="border-ink/10 bg-ivory text-ink">
                    <SelectItem value="general">Evento General</SelectItem>
                    {ministries.map((ministry) => (
                      <SelectItem key={ministry.id} value={ministry.id}>
                        {ministry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <FormField
            id="event-description"
            label="Descripción (opcional)"
            error={form.formState.errors.description?.message}
          >
            <Textarea
              id="event-description"
              rows={3}
              maxLength={2000}
              placeholder="Información adicional del evento..."
              {...form.register("description")}
              className="border-ink/15 bg-ivory"
            />
          </FormField>

          <DialogFooter className="gap-2 border-t border-ink/10 pt-4 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
              className="border-ink/15 bg-ivory text-ink/70"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isLoadingMinistries}
              className="bg-ink text-ivory hover:bg-ink/90"
            >
              {isLoading ? "Guardando…" : event ? "Guardar cambios" : "Crear evento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-ink">
        {label} <span className="text-rose-old">*</span>
      </Label>
      {children}
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
