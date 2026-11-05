import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, ClipboardCheck, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

type AttendanceStatus = "presente" | "ausente" | "justificado";
type ChurchEvent = { id: string; name: string; event_date: string; event_time: string };
type ChurchMember = { id: string; first_name: string; last_name: string };
type SavedAttendance = { member_id: string; status: AttendanceStatus; notes: string | null };

const statusOptions: { value: AttendanceStatus; label: string; selectedClassName: string }[] = [
  { value: "presente", label: "Presente", selectedClassName: "bg-sage/30" },
  { value: "ausente", label: "Ausente", selectedClassName: "bg-rose-old/20" },
  { value: "justificado", label: "Justificado", selectedClassName: "bg-ochre/20" },
];

export function AsistenciaIndex() {
  const [churchId, setChurchId] = useState<string | null>(null);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [members, setMembers] = useState<ChurchMember[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string | null>>({});
  const [search, setSearch] = useState("");
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingRoll, setIsLoadingRoll] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [eventLoadAttempt, setEventLoadAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setIsLoadingEvents(true);
      setLoadFailed(false);
      try {
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

        const { data, error } = await supabase
          .from("events")
          .select("id, name, event_date, event_time")
          .is("deleted_at", null)
          .order("event_date", { ascending: false })
          .order("event_time", { ascending: false });
        if (error) throw error;
        if (cancelled) return;
        setChurchId(profile.church_id);
        setEvents(data ?? []);
      } catch {
        if (cancelled) return;
        setEvents([]);
        setLoadFailed(true);
        toast.error("No se pudieron cargar los eventos de tu iglesia.");
      } finally {
        if (!cancelled) setIsLoadingEvents(false);
      }
    }

    void loadEvents();
    return () => {
      cancelled = true;
    };
  }, [eventLoadAttempt]);

  useEffect(() => {
    if (!selectedEventId) {
      setMembers([]);
      setStatuses({});
      setNotes({});
      setSearch("");
      setIsLoadingRoll(false);
      return;
    }

    let cancelled = false;
    async function loadRollCall() {
      setIsLoadingRoll(true);
      setMembers([]);
      setStatuses({});
      setNotes({});
      setSearch("");

      try {
        const [membersResult, attendanceResult] = await Promise.all([
          supabase
            .from("members")
            .select("id, first_name, last_name")
            .eq("status", "activo")
            .is("deleted_at", null)
            .order("first_name", { ascending: true })
            .order("last_name", { ascending: true }),
          supabase
            .from("attendance")
            .select("member_id, status, notes")
            .eq("event_id", selectedEventId),
        ]);

        if (cancelled) return;
        if (membersResult.error || attendanceResult.error) {
          toast.error("No se pudo cargar la lista de miembros y asistencias.");
          return;
        }

        const activeMembers = membersResult.data ?? [];
        const savedRows = (attendanceResult.data ?? []) as SavedAttendance[];
        const savedByMember = new Map(savedRows.map((row) => [row.member_id, row]));
        setMembers(activeMembers);
        setStatuses(
          Object.fromEntries(
            activeMembers.map((member) => [
              member.id,
              savedByMember.get(member.id)?.status ?? "presente",
            ]),
          ) as Record<string, AttendanceStatus>,
        );
        setNotes(
          Object.fromEntries(
            activeMembers.map((member) => [member.id, savedByMember.get(member.id)?.notes ?? null]),
          ),
        );
      } catch {
        if (!cancelled) toast.error("No se pudo cargar la lista de miembros y asistencias.");
      } finally {
        if (!cancelled) setIsLoadingRoll(false);
      }
    }

    void loadRollCall();
    return () => {
      cancelled = true;
    };
  }, [selectedEventId]);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-MX");
    if (!query) return members;
    return members.filter((member) =>
      `${member.first_name} ${member.last_name}`.toLocaleLowerCase("es-MX").includes(query),
    );
  }, [members, search]);

  const selectedEvent = events.find((event) => event.id === selectedEventId);

  async function saveAttendance() {
    if (!selectedEventId || !churchId || members.length === 0) return;
    setIsSaving(true);
    try {
      const records = members.map((member) => ({
        church_id: churchId,
        event_id: selectedEventId,
        member_id: member.id,
        status: statuses[member.id] ?? "presente",
        notes: notes[member.id] ?? null,
      }));

      const { error } = await supabase
        .from("attendance")
        .upsert(records, { onConflict: "event_id,member_id" });
      if (error) throw error;
      toast.success(`Asistencia guardada para ${records.length} miembros.`);
    } catch {
      toast.error("No se pudo guardar la asistencia. Verifica tus permisos e inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-7 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-old">
            Registro
          </p>
          <h1 className="mt-1 font-serif text-3xl leading-tight text-ink sm:text-4xl">
            Pase de lista
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
            Selecciona un evento y registra la asistencia de los miembros activos.
          </p>
        </div>
        {selectedEventId && (
          <Button
            type="button"
            onClick={() => void saveAttendance()}
            disabled={isSaving || isLoadingRoll || members.length === 0}
            className="h-10 shrink-0 bg-ink text-ivory shadow-sm hover:bg-ink/90"
          >
            <Check aria-hidden="true" />
            {isSaving ? "Guardando…" : "Guardar Asistencia"}
          </Button>
        )}
      </header>

      <Card className="border-ink/10 bg-ivory shadow-sm shadow-ink/5">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-xl font-normal text-ink">
            Seleccionar evento
          </CardTitle>
          <CardDescription className="text-ink/60">
            Elige la actividad para abrir su lista de miembros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedEventId}
            onValueChange={setSelectedEventId}
            disabled={isLoadingEvents || events.length === 0}
          >
            <SelectTrigger className="h-11 border-ink/15 bg-ivory text-ink sm:max-w-xl">
              <SelectValue
                placeholder={isLoadingEvents ? "Cargando eventos…" : "Selecciona un evento"}
              />
            </SelectTrigger>
            <SelectContent className="border-ink/10 bg-ivory text-ink">
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name} · {formatDate(event.event_date)} · {formatTime(event.event_time)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {loadFailed && (
            <Button
              type="button"
              variant="link"
              className="mt-2 h-auto p-0 text-rose-old"
              onClick={() => setEventLoadAttempt((attempt) => attempt + 1)}
            >
              Reintentar carga de eventos
            </Button>
          )}
        </CardContent>
      </Card>

      {selectedEventId && (
        <section className="space-y-4" aria-label="Lista de asistencia">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl text-ink">{selectedEvent?.name}</h2>
              {selectedEvent && (
                <p className="mt-1 flex items-center gap-2 text-sm text-ink/55">
                  <CalendarDays aria-hidden="true" className="size-4" />
                  {formatDate(selectedEvent.event_date)} · {formatTime(selectedEvent.event_time)}
                </p>
              )}
            </div>
            <div className="relative w-full sm:max-w-sm">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/45"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar miembro por nombre…"
                aria-label="Buscar miembro por nombre"
                className="h-10 border-ink/15 bg-ivory pl-9 placeholder:text-ink/40"
              />
            </div>
          </div>

          <Card className="overflow-hidden border-ink/10 bg-ivory shadow-sm shadow-ink/5">
            <div className="border-b border-ink/10 px-5 py-3 text-sm text-ink/55">
              {isLoadingRoll
                ? "Cargando miembros…"
                : `${filteredMembers.length} de ${members.length} miembros`}
            </div>
            <Table>
              <TableHeader className="bg-parchment/70">
                <TableRow className="border-ink/10 hover:bg-transparent">
                  <TableHead className="min-w-52 px-5 text-xs font-semibold uppercase tracking-wide text-ink/55">
                    Miembro
                  </TableHead>
                  <TableHead className="min-w-[30rem] px-5 text-xs font-semibold uppercase tracking-wide text-ink/55">
                    Estado de asistencia
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRoll ? (
                  Array.from({ length: 5 }, (_, index) => (
                    <TableRow key={index} className="border-ink/10">
                      <TableCell className="px-5 py-4">
                        <Skeleton className="h-4 w-36 bg-ink/10" />
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Skeleton className="h-8 w-80 bg-ink/10" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredMembers.length ? (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id} className="border-ink/10 hover:bg-parchment/30">
                      <TableCell className="px-5 py-4 font-medium text-ink">
                        {member.first_name} {member.last_name}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        <RadioGroup
                          value={statuses[member.id] ?? "presente"}
                          onValueChange={(value: AttendanceStatus) =>
                            setStatuses((current) => ({ ...current, [member.id]: value }))
                          }
                          aria-label={`Asistencia de ${member.first_name} ${member.last_name}`}
                          className="flex flex-wrap gap-3 sm:gap-5"
                        >
                          {statusOptions.map((option) => {
                            const id = `attendance-${member.id}-${option.value}`;
                            const selected = statuses[member.id] === option.value;
                            return (
                              <div
                                key={option.value}
                                className={`flex items-center gap-2 rounded-md px-2 py-1 ${selected ? option.selectedClassName : ""}`}
                              >
                                <RadioGroupItem
                                  id={id}
                                  value={option.value}
                                  className="border-ink/40 text-ink focus-visible:ring-ink"
                                />
                                <Label
                                  htmlFor={id}
                                  className="cursor-pointer text-sm font-normal text-ink/75"
                                >
                                  {option.label}
                                </Label>
                              </div>
                            );
                          })}
                        </RadioGroup>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-28 px-5 text-center text-sm text-ink/55">
                      {members.length === 0
                        ? "No hay miembros activos para este pase de lista."
                        : "No hay miembros que coincidan con la búsqueda."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </section>
      )}

      {!selectedEventId && !isLoadingEvents && !loadFailed && (
        <Card className="border-ink/10 bg-ivory shadow-sm shadow-ink/5">
          <CardContent className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-parchment text-ink/65">
              <ClipboardCheck aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-4 font-serif text-xl text-ink">
              {events.length
                ? "Selecciona un evento para empezar"
                : "Aún no hay eventos registrados"}
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-ink/55">
              {events.length
                ? "Al elegir un evento, aparecerán los miembros activos y sus estados de asistencia."
                : "Primero registra un evento para poder pasar lista a los miembros."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatDate(value: string) {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(
    new Date(year, month - 1, day),
  );
}

function formatTime(value: string) {
  const [hour = "0", minute = "0"] = value.split(":");
  return new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit" }).format(
    new Date(2000, 0, 1, Number(hour), Number(minute)),
  );
}
