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

const transactionSchema = z.object({
  type: z.enum(["ingreso", "egreso"]),
  category: z
    .string()
    .trim()
    .min(2, "Escribe una categoría.")
    .max(120, "La categoría no debe superar 120 caracteres."),
  amount: z
    .number()
    .finite("Escribe un monto válido.")
    .positive("El monto debe ser mayor que cero.")
    .max(9_999_999_999.99, "El monto supera el máximo permitido.")
    .refine(
      (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-7,
      "El monto admite hasta dos decimales.",
    ),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha válida."),
  description: z.string().trim().max(2000, "La descripción no debe superar 2000 caracteres."),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export type TransactionFormRecord = {
  id: string;
  type: "ingreso" | "egreso";
  category: string;
  amount: string;
  transaction_date: string;
  description: string | null;
};

type TransactionFormModalProps = {
  open: boolean;
  transaction?: TransactionFormRecord | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

const suggestedCategories = ["Diezmos", "Ofrendas", "Servicios", "Mantenimiento"];

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getEmptyValues(): TransactionFormValues {
  return {
    type: "ingreso",
    category: "",
    amount: 0,
    transactionDate: getLocalDate(),
    description: "",
  };
}

export function TransactionFormModal({
  open,
  transaction,
  onOpenChange,
  onSuccess,
}: TransactionFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: getEmptyValues(),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      transaction
        ? {
            type: transaction.type,
            category: transaction.category,
            amount: Number(transaction.amount),
            transactionDate: transaction.transaction_date,
            description: transaction.description ?? "",
          }
        : getEmptyValues(),
    );
  }, [form, open, transaction]);

  async function onSubmit(values: TransactionFormValues) {
    setIsLoading(true);
    try {
      const payload = {
        type: values.type,
        category: values.category,
        amount: values.amount.toFixed(2),
        transaction_date: values.transactionDate,
        description: values.description || null,
      };

      if (transaction) {
        const { error } = await supabase
          .from("transactions")
          .update(payload)
          .eq("id", transaction.id)
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
          .select("church_id, role")
          .eq("id", user.id)
          .maybeSingle();
        if (profileError || !profile?.church_id)
          throw new Error("No se encontró una iglesia vinculada a tu perfil.");
        if (profile.role !== "admin" && profile.role !== "tesorero") {
          throw new Error("Solo administración y tesorería pueden registrar movimientos.");
        }

        const { error } = await supabase.from("transactions").insert({
          ...payload,
          church_id: profile.church_id,
        });
        if (error) throw error;
      }

      toast.success(
        transaction
          ? "Movimiento actualizado correctamente."
          : "Movimiento registrado correctamente.",
      );
      form.reset(getEmptyValues());
      await onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el movimiento.");
    } finally {
      setIsLoading(false);
    }
  }

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isLoading && onOpenChange(nextOpen)}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto border-ink/10 bg-ivory text-ink sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal text-ink">
            {transaction ? "Editar movimiento" : "Nueva transacción"}
          </DialogTitle>
          <DialogDescription className="text-ink/60">
            Registra un ingreso o egreso de la iglesia.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transaction-type" className="text-ink">
              Tipo
            </Label>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="transaction-type"
                    className="h-10 border-ink/15 bg-ivory text-ink"
                  >
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent className="border-ink/10 bg-ivory text-ink">
                    <SelectItem value="ingreso">Ingreso</SelectItem>
                    <SelectItem value="egreso">Egreso</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="transaction-amount" label="Monto" error={errors.amount?.message}>
              <Input
                id="transaction-amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                max="9999999999.99"
                step="0.01"
                placeholder="0.00"
                aria-invalid={Boolean(errors.amount)}
                {...form.register("amount", { valueAsNumber: true })}
                className="h-10 border-ink/15 bg-ivory"
              />
            </Field>
            <Field id="transaction-date" label="Fecha" error={errors.transactionDate?.message}>
              <Input
                id="transaction-date"
                type="date"
                aria-invalid={Boolean(errors.transactionDate)}
                {...form.register("transactionDate")}
                className="h-10 border-ink/15 bg-ivory"
              />
            </Field>
          </div>

          <Field id="transaction-category" label="Categoría" error={errors.category?.message}>
            <Input
              id="transaction-category"
              list="transaction-category-options"
              placeholder="Ej. Ofrendas"
              aria-invalid={Boolean(errors.category)}
              {...form.register("category")}
              className="h-10 border-ink/15 bg-ivory"
            />
            <datalist id="transaction-category-options">
              {suggestedCategories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </Field>

          <Field
            id="transaction-description"
            label="Descripción (opcional)"
            error={errors.description?.message}
            required={false}
          >
            <Textarea
              id="transaction-description"
              rows={3}
              maxLength={2000}
              placeholder="Agrega detalles del movimiento..."
              aria-invalid={Boolean(errors.description)}
              {...form.register("description")}
              className="border-ink/15 bg-ivory"
            />
          </Field>

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
              {isLoading ? "Guardando…" : transaction ? "Guardar cambios" : "Registrar movimiento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id,
  label,
  error,
  required = true,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-ink">
        {label}
        {required && <span className="ml-1 text-rose-old">*</span>}
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
