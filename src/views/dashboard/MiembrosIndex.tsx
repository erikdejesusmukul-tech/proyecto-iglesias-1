import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MemberFormModal } from "@/components/dashboard/MemberFormModal";
import type { MemberFormRecord } from "@/components/dashboard/MemberFormModal";
import { DeactivateMemberDialog } from "@/components/dashboard/DeactivateMemberDialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Member = MemberFormRecord & {
  name: string;
  registeredAt: string;
};

const PAGE_SIZE = 5;
const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function MiembrosIndex() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberToDeactivate, setMemberToDeactivate] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [page, setPage] = useState(1);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMembers(
        data.map((member) => ({
          id: member.id,
          firstName: member.first_name,
          lastName: member.last_name,
          name: `${member.first_name} ${member.last_name}`,
          email: member.email,
          phone: member.phone,
          registeredAt: member.created_at,
          status: member.status,
        })),
      );
    } catch {
      setMembers([]);
      setLoadError("No se pudo cargar el directorio. Intenta actualizar la página.");
      toast.error("No se pudieron cargar los miembros.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMembers();
  }, [fetchMembers]);

  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es-MX");

    return members.filter((member) => {
      const matchesSearch =
        !normalizedSearch ||
        member.name.toLocaleLowerCase("es-MX").includes(normalizedSearch) ||
        (member.email ?? "").toLocaleLowerCase("es-MX").includes(normalizedSearch);
      const matchesStatus = statusFilter === "todos" || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleMembers = filteredMembers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function updateStatus(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-old">
            Comunidad
          </p>
          <h1 className="mt-1 font-serif text-3xl leading-tight text-ink sm:text-4xl">
            Directorio de Miembros
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
            Consulta y organiza la información de las personas que forman parte de tu congregación.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setSelectedMember(null);
            setIsModalOpen(true);
          }}
          className="h-10 shrink-0 bg-ink text-ivory shadow-sm hover:bg-ink/90"
        >
          <Plus aria-hidden="true" />
          Nuevo Miembro
        </Button>
      </header>

      <Card className="overflow-hidden border-ink/10 bg-ivory shadow-sm shadow-ink/5">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-ink/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="relative w-full sm:max-w-sm">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/45"
              />
              <Input
                type="search"
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Buscar por nombre o correo..."
                aria-label="Buscar miembros por nombre o correo"
                className="h-10 border-ink/15 bg-ivory pl-9 placeholder:text-ink/40"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="shrink-0 text-sm text-ink/55">Estado</span>
              <Select value={statusFilter} onValueChange={updateStatus}>
                <SelectTrigger className="h-10 w-full border-ink/15 bg-ivory text-ink sm:w-40">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="border-ink/10 bg-parchment/60 hover:bg-parchment/60">
                  <TableHead className="h-12 pl-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/50">
                    Nombre completo
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/50">
                    Correo / Teléfono
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/50">
                    Fecha de registro
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/50">
                    Estado
                  </TableHead>
                  <TableHead className="pr-5 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/50">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }, (_, rowIndex) => (
                      <TableRow key={`member-skeleton-${rowIndex}`} className="border-ink/5">
                        <TableCell className="py-4 pl-5">
                          <div className="flex items-center gap-3">
                            <Skeleton className="size-9 rounded-full bg-ink/10" />
                            <Skeleton className="h-4 w-32 bg-ink/10" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-44 bg-ink/10" />
                          <Skeleton className="mt-2 h-3 w-24 bg-ink/10" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24 bg-ink/10" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16 rounded-full bg-ink/10" />
                        </TableCell>
                        <TableCell className="pr-5 text-right">
                          <Skeleton className="ml-auto size-9 bg-ink/10" />
                        </TableCell>
                      </TableRow>
                    ))
                  : visibleMembers.map((member) => (
                      <TableRow key={member.id} className="border-ink/5 hover:bg-parchment/40">
                        <TableCell className="py-4 pl-5">
                          <div className="flex items-center gap-3">
                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-rose-old/15 text-xs font-semibold text-ink/75">
                              {getInitials(member.name)}
                            </span>
                            <span className="font-medium text-ink">{member.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-0.5">
                            <p className="text-sm text-ink/80">{member.email || "Sin correo"}</p>
                            <p className="text-xs text-ink/50">{member.phone || "Sin teléfono"}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-ink/65">
                          {dateFormatter.format(new Date(`${member.registeredAt}T00:00:00Z`))}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            variant="outline"
                            className={
                              member.status === "activo"
                                ? "border-sage/40 bg-sage/15 text-emerald-900"
                                : "border-ink/10 bg-ink/5 text-ink/55"
                            }
                          >
                            <span
                              aria-hidden="true"
                              className={`mr-1.5 size-1.5 rounded-full ${member.status === "activo" ? "bg-emerald-700" : "bg-ink/35"}`}
                            />
                            {member.status === "activo" ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 pr-5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Acciones para ${member.name}`}
                                className="size-9 text-ink/60 hover:bg-parchment hover:text-ink"
                              >
                                <MoreHorizontal aria-hidden="true" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-44 border-ink/10 bg-ivory"
                            >
                              <DropdownMenuItem
                                onSelect={() => console.log("Ver perfil", member.id)}
                              >
                                <Eye aria-hidden="true" />
                                Ver Perfil
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  setSelectedMember(member);
                                  setIsModalOpen(true);
                                }}
                              >
                                <Pencil aria-hidden="true" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-ink/10" />
                              <DropdownMenuItem
                                onSelect={() => setMemberToDeactivate(member)}
                                className="text-destructive focus:text-destructive"
                              >
                                <UserRoundX aria-hidden="true" />
                                Desactivar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                {!isLoading && visibleMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-2 text-ink/55">
                        <UsersRound aria-hidden="true" className="size-6 opacity-50" />
                        <p className="text-sm font-medium text-ink/70">
                          {loadError
                            ? "No se pudo mostrar el directorio"
                            : "No encontramos miembros"}
                        </p>
                        <p className="text-xs">
                          {loadError || "Prueba con otro nombre, correo o estado."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <footer className="flex flex-col gap-3 border-t border-ink/10 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-ink/55">
              {filteredMembers.length === 0
                ? "0 miembros"
                : `Mostrando ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filteredMembers.length)} de ${filteredMembers.length} miembros`}
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="h-8 border-ink/15 bg-ivory text-ink/70"
              >
                <ChevronLeft aria-hidden="true" />
                Anterior
              </Button>
              <span className="min-w-16 text-center text-xs tabular-nums text-ink/55">
                {currentPage} / {pageCount}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= pageCount}
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                className="h-8 border-ink/15 bg-ivory text-ink/70"
              >
                Siguiente
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          </footer>
        </CardContent>
      </Card>
      <MemberFormModal
        open={isModalOpen}
        member={selectedMember}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setSelectedMember(null);
        }}
        onSuccess={fetchMembers}
      />
      <DeactivateMemberDialog
        memberId={memberToDeactivate?.id ?? null}
        memberName={memberToDeactivate?.name ?? ""}
        onOpenChange={(open) => {
          if (!open) setMemberToDeactivate(null);
        }}
        onSuccess={fetchMembers}
      />
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase("es-MX");
}
