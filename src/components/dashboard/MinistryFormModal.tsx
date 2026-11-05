import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const ministrySchema = z.object({
  name: z.string().trim().min(2, "Escribe el nombre del ministerio."),
  description: z.string().trim().max(1000, "La descripción no debe superar 1000 caracteres."),
});

type MinistryFormValues = z.infer<typeof ministrySchema>;

export type MinistryFormRecord = {
  id: string;
  name: string;
  description: string | null;
};

type MinistryFormModalProps = {
  open: boolean;
  ministry?: MinistryFormRecord | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

const emptyValues: MinistryFormValues = { name: "", description: "" };

export function MinistryFormModal({
  open,
  ministry,
  onOpenChange,
  onSuccess,
}: MinistryFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<MinistryFormValues>({
    resolver: zodResolver(ministrySchema),
    defaultValues: emptyValues,
  });
  const { reset } = form;

  useEffect(() => {
    if (!open) return;
    reset(
      ministry ? { name: ministry.name, description: ministry.description ?? "" } : emptyValues,
    );
  }, [ministry, open, reset]);

  async function onSubmit(values: MinistryFormValues) {
    setIsLoading(true);
    try {
      if (ministry) {
        const { error } = await supabase
          .from("ministries")
          .update({ name: values.name, description: values.description || null })
          .eq("id", ministry.id)
          .is("deleted_at", null);

        if (error) {
          toast.error("No se pudo actualizar el ministerio. Inténtalo de nuevo.");
          return;
        }
      } else {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          toast.error("Tu sesión no está activa. Inicia sesión e inténtalo de nuevo.");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("church_id")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError || !profile?.church_id) {
          toast.error("No se encontró una iglesia vinculada a tu perfil.");
          return;
        }

        const { error } = await supabase.from("ministries").insert({
          church_id: profile.church_id,
          name: values.name,
          description: values.description || null,
        });

        if (error) {
          toast.error(
            "No se pudo crear el ministerio. Verifica tus permisos e inténtalo de nuevo.",
          );
          return;
        }
      }

      toast.success(
        ministry ? "Ministerio actualizado correctamente." : "Ministerio creado correctamente.",
      );
      reset(emptyValues);
      await onSuccess?.();
      onOpenChange(false);
    } catch {
      toast.error("Ocurrió un error al guardar el ministerio. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isLoading) onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="border-ink/10 bg-ivory text-ink sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal text-ink">
            {ministry ? "Editar Ministerio" : "Nuevo Ministerio"}
          </DialogTitle>
          <DialogDescription className="text-ink/60">
            Registra el nombre y una breve descripción del grupo de servicio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="ministry-name" className="text-ink">
              Nombre del Ministerio <span className="text-rose-old">*</span>
            </Label>
            <Input
              id="ministry-name"
              autoComplete="off"
              placeholder="Ej. Ministerio de Música"
              aria-invalid={Boolean(form.formState.errors.name)}
              aria-describedby={form.formState.errors.name ? "ministry-name-error" : undefined}
              {...form.register("name")}
              className="h-10 border-ink/15 bg-ivory placeholder:text-ink/40"
            />
            {form.formState.errors.name?.message && (
              <p id="ministry-name-error" role="alert" className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ministry-description" className="text-ink">
              Descripción <span className="text-xs font-normal text-ink/45">(opcional)</span>
            </Label>
            <Textarea
              id="ministry-description"
              rows={4}
              maxLength={1000}
              placeholder="Describe brevemente las actividades del ministerio..."
              aria-invalid={Boolean(form.formState.errors.description)}
              aria-describedby={
                form.formState.errors.description ? "ministry-description-error" : undefined
              }
              {...form.register("description")}
              className="resize-y border-ink/15 bg-ivory placeholder:text-ink/40"
            />
            {form.formState.errors.description?.message && (
              <p id="ministry-description-error" role="alert" className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

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
              disabled={isLoading}
              className="bg-ink text-ivory hover:bg-ink/90"
            >
              {isLoading ? "Guardando…" : ministry ? "Guardar Cambios" : "Crear Ministerio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
