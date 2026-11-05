import { useCallback, useEffect, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2, UsersRound } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MinistryFormModal,
  type MinistryFormRecord,
} from "@/components/dashboard/MinistryFormModal";
import { supabase } from "@/integrations/supabase/client";

type Ministry = MinistryFormRecord & { created_at: string };

export function MinisteriosIndex() {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);
  const [ministryToDelete, setMinistryToDelete] = useState<Ministry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMinistries = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);

    try {
      const { data, error } = await supabase
        .from("ministries")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMinistries(data);
    } catch {
      setMinistries([]);
      setLoadError(true);
      toast.error("No se pudieron cargar los ministerios.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMinistries();
  }, [fetchMinistries]);

  function openCreateForm() {
    setSelectedMinistry(null);
    setIsFormOpen(true);
  }

  function closeForm(open: boolean) {
    setIsFormOpen(open);
    if (!open) setSelectedMinistry(null);
  }

  async function deleteMinistry() {
    if (!ministryToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("ministries")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", ministryToDelete.id)
        .is("deleted_at", null);

      if (error) {
        toast.error(
          "No se pudo eliminar el ministerio. Verifica tus permisos e inténtalo de nuevo.",
        );
        return;
      }

      toast.success("Ministerio eliminado correctamente.");
      setMinistryToDelete(null);
      await fetchMinistries();
    } catch {
      toast.error("Ocurrió un error al eliminar el ministerio. Inténtalo de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-old">
            Comunidad
          </p>
          <h1 className="mt-1 font-serif text-3xl leading-tight text-ink sm:text-4xl">
            Ministerios y Grupos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
            Organiza los equipos de servicio y las áreas de participación de tu congregación.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreateForm}
          className="h-10 shrink-0 bg-ink text-ivory shadow-sm hover:bg-ink/90"
        >
          <Plus aria-hidden="true" />
          Nuevo Ministerio
        </Button>
      </header>

      {isLoading ? (
        <section
          aria-label="Cargando ministerios"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {Array.from({ length: 6 }, (_, index) => (
            <Card key={index} className="min-h-48 border-ink/10 bg-ivory shadow-sm shadow-ink/5">
              <CardHeader className="flex flex-row items-start justify-between">
                <Skeleton className="h-6 w-40 bg-ink/10" />
                <Skeleton className="size-9 rounded-md bg-ink/10" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full bg-ink/10" />
                <Skeleton className="h-4 w-4/5 bg-ink/10" />
                <Skeleton className="mt-6 h-3 w-28 bg-ink/10" />
              </CardContent>
            </Card>
          ))}
        </section>
      ) : ministries.length > 0 ? (
        <section
          aria-label="Ministerios registrados"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {ministries.map((ministry) => (
            <Card
              key={ministry.id}
              className="group min-h-48 border-ink/10 bg-ivory shadow-sm shadow-ink/5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-ink/10"
            >
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-sage/20 text-ink">
                    <UsersRound aria-hidden="true" className="size-5" />
                  </span>
                  <CardTitle className="pt-1 font-serif text-xl font-normal leading-snug text-ink">
                    {ministry.name}
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Acciones para ${ministry.name}`}
                      className="size-9 shrink-0 text-ink/55 hover:bg-parchment hover:text-ink"
                    >
                      <MoreHorizontal aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 border-ink/10 bg-ivory">
                    <DropdownMenuItem
                      onSelect={() => {
                        setSelectedMinistry(ministry);
                        setIsFormOpen(true);
                      }}
                    >
                      <Pencil aria-hidden="true" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-ink/10" />
                    <DropdownMenuItem
                      onSelect={() => setMinistryToDelete(ministry)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 aria-hidden="true" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="flex min-h-[7rem] flex-col justify-between">
                <CardDescription className="whitespace-pre-line text-sm leading-6 text-ink/65">
                  {ministry.description || "Sin descripción por el momento."}
                </CardDescription>
                <p className="mt-5 text-xs text-ink/45">
                  Creado el{" "}
                  {new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(
                    new Date(ministry.created_at),
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : (
        <Card className="border-ink/10 bg-ivory shadow-sm shadow-ink/5">
          <CardContent className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-parchment text-ink/65">
              <UsersRound aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-4 font-serif text-xl text-ink">
              {loadError
                ? "No se pudieron cargar los ministerios"
                : "Aún no hay ministerios registrados"}
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-ink/55">
              {loadError
                ? "Vuelve a intentar cargar la lista."
                : "Crea el primer ministerio para organizar los grupos de servicio de tu iglesia."}
            </p>
            {loadError && (
              <Button
                type="button"
                variant="outline"
                onClick={() => void fetchMinistries()}
                className="mt-5 border-ink/15 bg-ivory text-ink"
              >
                Reintentar
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <MinistryFormModal
        open={isFormOpen}
        ministry={selectedMinistry}
        onOpenChange={closeForm}
        onSuccess={fetchMinistries}
      />

      <AlertDialog
        open={ministryToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setMinistryToDelete(null);
        }}
      >
        <AlertDialogContent className="border-ink/10 bg-ivory text-ink sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl font-normal text-ink">
              Eliminar ministerio
            </AlertDialogTitle>
            <AlertDialogDescription className="text-ink/65">
              ¿Estás seguro de que deseas eliminar el ministerio {ministryToDelete?.name}? Esta
              acción lo ocultará de la lista de ministerios activos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setMinistryToDelete(null)}
              className="border-ink/15 bg-ivory text-ink/70"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={isDeleting || !ministryToDelete}
              onClick={() => void deleteMinistry()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando…" : "Eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
