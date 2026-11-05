import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Clock3, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { EventFormModal, type EventFormRecord } from "@/components/dashboard/EventFormModal";
import { supabase } from "@/integrations/supabase/client";

type ChurchEvent = EventFormRecord & {
  created_at: string;
  ministries: { name: string } | null;
};

export function EventosIndex() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<ChurchEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const { data, error } = await supabase
        .from("events")
        .select(
          "id, name, description, event_date, event_time, ministry_id, created_at, ministries(name)",
        )
        .is("deleted_at", null)
        .order("event_date", { ascending: true })
        .order("event_time", { ascending: true });
      if (error) throw error;
      setEvents((data ?? []) as ChurchEvent[]);
    } catch {
      setEvents([]);
      setLoadError(true);
      toast.error("No se pudieron cargar los eventos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  function openCreateForm() {
    setSelectedEvent(null);
    setIsFormOpen(true);
  }

  function closeForm(open: boolean) {
    setIsFormOpen(open);
    if (!open) setSelectedEvent(null);
  }

  async function deleteEvent() {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("events")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", eventToDelete.id)
        .is("deleted_at", null);
      if (error) throw error;
      toast.success("Evento cancelado correctamente.");
      setEventToDelete(null);
      await fetchEvents();
    } catch {
      toast.error("No se pudo cancelar el evento. Verifica tus permisos e inténtalo de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-old">Agenda</p>
          <h1 className="mt-1 font-serif text-3xl leading-tight text-ink sm:text-4xl">
            Calendario de Eventos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
            Organiza las reuniones y actividades de tu congregación.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreateForm}
          className="h-10 shrink-0 bg-ink text-ivory shadow-sm hover:bg-ink/90"
        >
          <Plus aria-hidden="true" /> Nuevo Evento
        </Button>
      </header>

      {isLoading ? (
        <section aria-label="Cargando eventos" className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={i} className="border-ink/10 bg-ivory shadow-sm shadow-ink/5">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <Skeleton className="size-12 shrink-0 rounded-xl bg-ink/10" />
                <div className="w-full space-y-2">
                  <Skeleton className="h-5 w-2/5 bg-ink/10" />
                  <Skeleton className="h-4 w-3/5 bg-ink/10" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : events.length ? (
        <section aria-label="Eventos registrados" className="space-y-3">
          {events.map((event) => (
            <Card
              key={event.id}
              className="group border-ink/10 bg-ivory shadow-sm shadow-ink/5 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-ink/10"
            >
              <CardHeader className="flex flex-row items-start justify-between gap-4 p-5 sm:items-center sm:px-6">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-sage/20 text-ink">
                    <CalendarDays aria-hidden="true" className="size-5" />
                  </span>
                  <div className="min-w-0 space-y-2">
                    <CardTitle className="font-serif text-xl font-normal leading-snug text-ink">
                      {event.name}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink/65">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays aria-hidden="true" className="size-4 text-rose-old" />
                        {formatEventDate(event.event_date)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 aria-hidden="true" className="size-4 text-rose-old" />
                        {formatEventTime(event.event_time)}
                      </span>
                      {event.ministries?.name && (
                        <Badge
                          variant="secondary"
                          className="border border-ink/10 bg-parchment font-medium text-ink/75"
                        >
                          {event.ministries.name}
                        </Badge>
                      )}
                    </div>
                    {event.description && (
                      <p className="max-w-3xl whitespace-pre-line text-sm leading-6 text-ink/55">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Acciones para ${event.name}`}
                      className="size-9 shrink-0 text-ink/55 hover:bg-parchment hover:text-ink"
                    >
                      <MoreHorizontal aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 border-ink/10 bg-ivory">
                    <DropdownMenuItem
                      onSelect={() => {
                        setSelectedEvent(event);
                        setIsFormOpen(true);
                      }}
                    >
                      <Pencil aria-hidden="true" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-ink/10" />
                    <DropdownMenuItem
                      onSelect={() => setEventToDelete(event)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 aria-hidden="true" />
                      Cancelar Evento
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
            </Card>
          ))}
        </section>
      ) : (
        <Card className="border-ink/10 bg-ivory shadow-sm shadow-ink/5">
          <CardContent className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-parchment text-ink/65">
              <CalendarDays aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-4 font-serif text-xl text-ink">
              {loadError ? "No se pudieron cargar los eventos" : "Aún no hay eventos registrados"}
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-ink/55">
              {loadError
                ? "Vuelve a intentar cargar la agenda."
                : "Crea el primer evento para comenzar a organizar la agenda de tu iglesia."}
            </p>
            {loadError && (
              <Button
                type="button"
                variant="outline"
                onClick={() => void fetchEvents()}
                className="mt-5 border-ink/15 bg-ivory text-ink"
              >
                Reintentar
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <EventFormModal
        open={isFormOpen}
        event={selectedEvent}
        onOpenChange={closeForm}
        onSuccess={fetchEvents}
      />

      <AlertDialog
        open={eventToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setEventToDelete(null);
        }}
      >
        <AlertDialogContent className="border-ink/10 bg-ivory text-ink sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl font-normal text-ink">
              Cancelar evento
            </AlertDialogTitle>
            <AlertDialogDescription className="text-ink/65">
              ¿Deseas cancelar “{eventToDelete?.name}”? El evento se ocultará de la agenda activa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setEventToDelete(null)}
              className="border-ink/15 bg-ivory text-ink/70"
            >
              Volver
            </Button>
            <Button
              type="button"
              disabled={isDeleting || !eventToDelete}
              onClick={() => void deleteEvent()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Cancelando…" : "Cancelar evento"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function formatEventDate(value: string) {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "full" }).format(
    new Date(year, month - 1, day),
  );
}

function formatEventTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit" }).format(
    new Date(2000, 0, 1, hours, minutes),
  );
}
