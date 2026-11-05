import { Controller, useForm, type UseFormRegisterReturn } from "react-hook-form";
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
import { supabase } from "@/integrations/supabase/client";

const memberFormSchema = z.object({
  firstName: z.string().trim().min(2, "Escribe al menos 2 caracteres."),
  lastName: z.string().trim().min(2, "Escribe al menos 2 caracteres."),
  email: z.union([z.string().trim().email("Escribe un correo válido."), z.literal("")]),
  phone: z.union([
    z.string().trim().max(40, "El teléfono no debe superar 40 caracteres."),
    z.literal(""),
  ]),
  status: z.enum(["activo", "inactivo"]),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

export type MemberFormRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: "activo" | "inactivo";
};

type MemberFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: MemberFormRecord | null;
  onSuccess?: () => void | Promise<void>;
};

const emptyValues: MemberFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  status: "activo",
};

export function MemberFormModal({ open, onOpenChange, member, onSuccess }: MemberFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: emptyValues,
  });
  const { reset } = form;

  useEffect(() => {
    if (!open) return;

    reset(
      member
        ? {
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email ?? "",
            phone: member.phone ?? "",
            status: member.status,
          }
        : emptyValues,
    );
  }, [member, open, reset]);

  async function onSubmit(values: MemberFormValues) {
    setIsLoading(true);

    try {
      if (member) {
        const { error: updateError } = await supabase
          .from("members")
          .update({
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email || null,
            phone: values.phone || null,
            status: values.status,
          })
          .eq("id", member.id)
          .is("deleted_at", null);

        if (updateError) {
          toast.error(
            "No se pudo actualizar el miembro. Verifica tus permisos e inténtalo de nuevo.",
          );
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

        const { error: insertError } = await supabase.from("members").insert({
          church_id: profile.church_id,
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email || null,
          phone: values.phone || null,
          status: values.status,
        });

        if (insertError) {
          toast.error("No se pudo guardar el miembro. Verifica tus permisos e inténtalo de nuevo.");
          return;
        }
      }

      toast.success(
        member ? "Cambios guardados correctamente." : "Miembro agregado correctamente.",
      );
      form.reset();
      await onSuccess?.();
      onOpenChange(false);
    } catch {
      toast.error("Ocurrió un error al guardar el miembro. Inténtalo de nuevo.");
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
      <DialogContent className="max-h-[90dvh] overflow-y-auto border-ink/10 bg-ivory text-ink sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal text-ink">
            {member ? "Editar Miembro" : "Nuevo miembro"}
          </DialogTitle>
          <DialogDescription className="text-ink/60">
            Completa los datos básicos para agregar a una persona al directorio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="member-first-name"
              label="Nombre"
              placeholder="Ej. Juan"
              autoComplete="given-name"
              error={form.formState.errors.firstName?.message}
              registration={form.register("firstName")}
            />
            <TextField
              id="member-last-name"
              label="Apellido"
              placeholder="Ej. Pérez"
              autoComplete="family-name"
              error={form.formState.errors.lastName?.message}
              registration={form.register("lastName")}
            />
          </div>

          <TextField
            id="member-email"
            label="Correo electrónico"
            placeholder="nombre@ejemplo.com"
            autoComplete="email"
            type="email"
            required={false}
            error={form.formState.errors.email?.message}
            registration={form.register("email")}
          />

          <TextField
            id="member-phone"
            label="Teléfono"
            placeholder="999 123 4567"
            autoComplete="tel"
            type="tel"
            required={false}
            error={form.formState.errors.phone?.message}
            registration={form.register("phone")}
          />

          <div className="space-y-2">
            <Label htmlFor="member-status" className="text-ink">
              Estado
            </Label>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="member-status"
                    className="h-10 border-ink/15 bg-ivory text-ink"
                  >
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent className="border-ink/10 bg-ivory text-ink">
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.status?.message && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {form.formState.errors.status.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 border-t border-ink/10 pt-4 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-ink/15 bg-ivory text-ink/70"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-ink text-ivory hover:bg-ink/90"
            >
              {isLoading ? "Guardando…" : member ? "Guardar Cambios" : "Guardar miembro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  type?: "text" | "email" | "tel";
  required?: boolean;
  error?: string | undefined;
  registration: UseFormRegisterReturn;
};

function TextField({
  id,
  label,
  placeholder,
  autoComplete,
  type = "text",
  required = true,
  error,
  registration,
}: TextFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-ink">
        {label}
        {required && <span className="ml-1 text-rose-old">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...registration}
        className="h-10 border-ink/15 bg-ivory placeholder:text-ink/40"
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
