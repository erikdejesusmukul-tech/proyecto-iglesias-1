import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LockKeyhole, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const churchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres.")
    .max(255, "El nombre es demasiado largo."),
  legalRegistrationNumber: z
    .string()
    .trim()
    .max(120, "El RFC o registro no debe superar 120 caracteres."),
});

type ChurchFormValues = z.infer<typeof churchSchema>;
type PageState = "checking" | "loading" | "ready" | "denied" | "error";

export function ConfiguracionIndex() {
  const [pageState, setPageState] = useState<PageState>("checking");
  const [churchId, setChurchId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const form = useForm<ChurchFormValues>({
    resolver: zodResolver(churchSchema),
    defaultValues: { name: "", legalRegistrationNumber: "" },
  });

  useEffect(() => {
    let cancelled = false;
    async function checkAdmin() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("No se pudo validar la sesión.");

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("church_id, role")
          .eq("id", user.id)
          .maybeSingle();
        if (error) throw error;
        if (cancelled) return;

        if (profile?.role !== "admin" || !profile.church_id) {
          setPageState("denied");
          return;
        }

        setChurchId(profile.church_id);
        setPageState("loading");
      } catch {
        if (!cancelled) {
          setPageState("error");
          toast.error("No se pudo verificar el acceso a la configuración.");
        }
      }
    }

    void checkAdmin();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!churchId || pageState !== "loading") return;
    const activeChurchId = churchId;
    let cancelled = false;

    async function loadChurch() {
      try {
        const { data, error } = await supabase
          .from("churches")
          .select("name, legal_registration_number")
          .eq("id", activeChurchId)
          .is("deleted_at", null)
          .maybeSingle();

        if (cancelled) return;
        if (error || !data) throw new Error("Church settings are unavailable.");

        form.reset({
          name: data.name,
          legalRegistrationNumber: data.legal_registration_number ?? "",
        });
        setPageState("ready");
      } catch {
        if (cancelled) return;
        setPageState("error");
        toast.error("No se pudo cargar la información de la iglesia.");
      }
    }

    void loadChurch();
    return () => {
      cancelled = true;
    };
  }, [churchId, form, pageState]);

  async function onSubmit(values: ChurchFormValues) {
    if (!churchId) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("churches")
        .update({
          name: values.name,
          legal_registration_number: values.legalRegistrationNumber || null,
        })
        .eq("id", churchId)
        .is("deleted_at", null);
      if (error) throw error;
      form.reset(values);
      toast.success("La información de la iglesia se actualizó correctamente.");
    } catch {
      toast.error("No se pudo actualizar la iglesia. Verifica tus permisos e inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  }

  if (pageState === "checking" || pageState === "loading") {
    return (
      <div className="mx-auto max-w-3xl space-y-6" aria-label="Cargando configuración">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 bg-ink/10" />
          <Skeleton className="h-10 w-72 bg-ink/10" />
        </div>
        <Card className="border-ink/10 bg-ivory">
          <CardHeader className="space-y-3">
            <Skeleton className="h-6 w-56 bg-ink/10" />
            <Skeleton className="h-4 w-80 bg-ink/10" />
          </CardHeader>
          <CardContent className="space-y-5">
            <Skeleton className="h-10 w-full bg-ink/10" />
            <Skeleton className="h-10 w-full bg-ink/10" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pageState === "denied" || pageState === "error") {
    return (
      <Card className="mx-auto max-w-xl border-ink/10 bg-ivory shadow-sm shadow-ink/5">
        <CardContent className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-rose-old/15 text-rose-old">
            <LockKeyhole aria-hidden="true" className="size-7" />
          </span>
          <h1 className="mt-5 font-serif text-2xl text-ink">
            {pageState === "denied" ? "Acceso Denegado" : "No se pudo cargar la configuración"}
          </h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink/60">
            {pageState === "denied"
              ? "Solo el administrador de la iglesia puede actualizar la información institucional."
              : "Vuelve al panel e inténtalo de nuevo."}
          </p>
          <Button asChild className="mt-6 bg-ink text-ivory hover:bg-ink/90">
            <Link to="/dashboard">Volver al inicio</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-old">
          Administración
        </p>
        <h1 className="mt-1 font-serif text-3xl leading-tight text-ink sm:text-4xl">
          Configuración
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
          Administra los datos institucionales de tu iglesia.
        </p>
      </header>

      <Card className="border-ink/10 bg-ivory shadow-sm shadow-ink/5">
        <CardHeader>
          <CardTitle className="font-serif text-2xl font-normal text-ink">
            Información de la iglesia
          </CardTitle>
          <CardDescription className="text-ink/60">
            Estos datos identifican a tu congregación en el portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="church-name" className="text-ink">
                Nombre de la Iglesia <span className="text-rose-old">*</span>
              </Label>
              <Input
                id="church-name"
                autoComplete="organization"
                aria-invalid={Boolean(form.formState.errors.name)}
                aria-describedby={form.formState.errors.name ? "church-name-error" : undefined}
                {...form.register("name")}
                className="h-11 border-ink/15 bg-ivory placeholder:text-ink/40"
              />
              {form.formState.errors.name?.message && (
                <p id="church-name-error" role="alert" className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="church-registration" className="text-ink">
                RFC / Razón Social{" "}
                <span className="text-xs font-normal text-ink/45">(opcional)</span>
              </Label>
              <Input
                id="church-registration"
                autoComplete="off"
                placeholder="RFC o registro de asociación religiosa"
                aria-invalid={Boolean(form.formState.errors.legalRegistrationNumber)}
                aria-describedby={
                  form.formState.errors.legalRegistrationNumber
                    ? "church-registration-error"
                    : undefined
                }
                {...form.register("legalRegistrationNumber")}
                className="h-11 border-ink/15 bg-ivory placeholder:text-ink/40"
              />
              {form.formState.errors.legalRegistrationNumber?.message && (
                <p id="church-registration-error" role="alert" className="text-sm text-destructive">
                  {form.formState.errors.legalRegistrationNumber.message}
                </p>
              )}
            </div>

            <div className="flex justify-end border-t border-ink/10 pt-4">
              <Button
                type="submit"
                disabled={isSaving || !form.formState.isDirty}
                className="bg-ink text-ivory hover:bg-ink/90"
              >
                <Save aria-hidden="true" />
                {isSaving ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
