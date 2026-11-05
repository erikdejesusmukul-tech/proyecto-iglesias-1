import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

type DeactivateMemberDialogProps = {
  memberId: string | null;
  memberName: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function DeactivateMemberDialog({
  memberId,
  memberName,
  onOpenChange,
  onSuccess,
}: DeactivateMemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function deactivateMember() {
    if (!memberId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("members")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", memberId)
        .is("deleted_at", null);

      if (error) {
        toast.error(
          "No se pudo desactivar al miembro. Verifica tus permisos e inténtalo de nuevo.",
        );
        return;
      }

      toast.success("Miembro desactivado correctamente.");
      await onSuccess();
      onOpenChange(false);
    } catch {
      toast.error("Ocurrió un error al desactivar al miembro. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog
      open={memberId !== null}
      onOpenChange={(open) => {
        if (!open && !isLoading) onOpenChange(false);
      }}
    >
      <AlertDialogContent className="border-ink/10 bg-ivory text-ink sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-2xl font-normal text-ink">
            Desactivar miembro
          </AlertDialogTitle>
          <AlertDialogDescription className="text-ink/65">
            ¿Estás seguro de que deseas desactivar a {memberName}? Esta acción lo ocultará del
            directorio activo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:space-x-0">
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
            type="button"
            disabled={isLoading || !memberId}
            onClick={() => void deactivateMember()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Desactivando…" : "Desactivar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
