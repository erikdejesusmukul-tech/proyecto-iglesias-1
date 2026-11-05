import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import {
  registerChurchForCurrentUser,
  savePendingChurchRegistration,
} from "@/lib/auth/church-registration";

const churchRegistrationSchema = z.object({
  churchName: z
    .string()
    .trim()
    .min(3, "Escribe al menos 3 letras.")
    .refine((value) => (value.match(/\p{L}/gu) ?? []).length >= 3, {
      message: "El nombre debe contener al menos 3 letras.",
    }),
  legalId: z.string().trim().min(3, "Escribe la razón social, RFC o Registro AR."),
  adminName: z
    .string()
    .trim()
    .min(2, "Escribe el nombre de la persona administradora.")
    .regex(/^[\p{L}\p{M}\s.'-]+$/u, "Usa solo letras en este campo."),
  adminEmail: z.string().trim().email("Escribe un correo electrónico válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

type ChurchRegistrationValues = z.infer<typeof churchRegistrationSchema>;

export const Route = createFileRoute("/registro-iglesia")({
  head: () => ({
    meta: [
      { title: "Registro de iglesia — Iglesias de Yucatán" },
      {
        name: "description",
        content: "Solicita el registro de tu iglesia en el portal de Iglesias de Yucatán.",
      },
    ],
  }),
  component: ChurchRegistrationPage,
});

function ChurchRegistrationPage() {
  const navigate = useNavigate();
  const form = useForm<ChurchRegistrationValues>({
    resolver: zodResolver(churchRegistrationSchema),
    defaultValues: {
      churchName: "",
      legalId: "",
      adminName: "",
      adminEmail: "",
      password: "",
    },
  });

  async function onSubmit(values: ChurchRegistrationValues) {
    form.clearErrors("root");

    let signupResult: Awaited<ReturnType<typeof supabase.auth.signUp>>;
    try {
      signupResult = await supabase.auth.signUp({
        email: values.adminEmail.trim().toLowerCase(),
        password: values.password,
        options: {
          data: { full_name: values.adminName.trim() },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
    } catch {
      form.setError("root.server", {
        message: "No se pudo conectar con el servicio de registro. Inténtalo de nuevo.",
      });
      return;
    }

    const { data, error } = signupResult;

    if (error || !data.user || data.user.identities?.length === 0) {
      form.setError("root.server", {
        message: error?.message.toLowerCase().includes("already registered")
          ? "Este correo ya tiene una cuenta. Inicia sesión y vuelve a solicitar el registro."
          : "No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.",
      });
      return;
    }

    const registration = {
      churchName: values.churchName.trim(),
      legalId: values.legalId.trim(),
      adminName: values.adminName.trim(),
      adminEmail: values.adminEmail.trim().toLowerCase(),
    };

    try {
      if (!data.session) {
        // The RPC requires auth.uid(); hold only the non-secret church details
        // until the user confirms their email and returns to /auth.
        savePendingChurchRegistration(registration);
        toast.info("Confirma tu correo para completar la solicitud", {
          description:
            "Al volver desde el enlace de confirmación, se enviarán los datos de la iglesia.",
        });
        await navigate({ to: "/login" });
        return;
      }

      savePendingChurchRegistration(registration);
      await registerChurchForCurrentUser(registration);
      toast.success("Solicitud enviada con éxito", {
        description: "Tu iglesia quedó pendiente de validación.",
      });
      await supabase.auth.signOut();
      await navigate({ to: "/login" });
    } catch {
      form.setError("root.server", {
        message:
          "La cuenta se creó, pero no se pudo enviar la solicitud. Inicia sesión con ese correo para reintentar.",
      });
      await supabase.auth.signOut();
    }
  }

  const fields = [
    {
      name: "churchName" as const,
      label: "Nombre de la iglesia",
      placeholder: "Ej. Parroquia de Santa Ana",
      autoComplete: "organization",
      type: "text",
    },
    {
      name: "legalId" as const,
      label: "Razón social, RFC o Registro AR",
      placeholder: "Dato de registro institucional",
      autoComplete: "off",
      type: "text",
    },
    {
      name: "adminName" as const,
      label: "Nombre de la persona administradora",
      placeholder: "Nombre completo",
      autoComplete: "name",
      type: "text",
    },
    {
      name: "adminEmail" as const,
      label: "Correo electrónico",
      placeholder: "nombre@iglesia.org",
      autoComplete: "email",
      type: "email",
    },
    {
      name: "password" as const,
      label: "Contraseña",
      placeholder: "Mínimo 8 caracteres",
      autoComplete: "new-password",
      type: "password",
    },
  ];
  const serverErrorMessage = form.formState.errors.root?.["server"]?.message;

  return (
    <main className="flex min-h-screen items-center justify-center bg-parchment px-4 py-8 text-ink sm:px-6">
      <Card className="w-full max-w-lg rounded-2xl border-ink/10 bg-ivory shadow-xl shadow-ink/10">
        <CardHeader className="space-y-4 p-6 pb-2 sm:p-8 sm:pb-3">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink/75 transition-colors hover:text-ink"
          >
            <span aria-hidden="true" className="text-rose-old">
              ←
            </span>
            Iglesias de <span className="font-serif italic font-normal">Yucatán</span>
          </Link>
          <div>
            <CardTitle className="font-sans text-3xl font-bold tracking-tight text-ink">
              Registro de iglesia
            </CardTitle>
            <CardDescription className="mt-2 text-sm leading-6 text-ink/65">
              Comparte los datos institucionales y de contacto para solicitar acceso al portal.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-4 sm:p-8 sm:pt-5">
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
            {fields.map((field) => {
              const error = form.formState.errors[field.name];
              const id = `church-registration-${field.name}`;

              return (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={id} className={error ? "text-destructive" : "text-ink"}>
                    {field.label}
                  </Label>
                  <Input
                    id={id}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    placeholder={field.placeholder}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : undefined}
                    {...form.register(field.name)}
                    className="h-11 border-ink/15 bg-ivory placeholder:text-ink/40"
                  />
                  {error?.message && (
                    <p
                      id={`${id}-error`}
                      role="alert"
                      className="text-sm font-medium text-destructive"
                    >
                      {error.message}
                    </p>
                  )}
                </div>
              );
            })}

            {serverErrorMessage && (
              <p
                role="alert"
                className="rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {serverErrorMessage}
              </p>
            )}

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-11 w-full bg-ink text-ivory hover:bg-ink/90"
            >
              {form.formState.isSubmitting
                ? "Enviando solicitud…"
                : "Solicitar Registro de Iglesia"}
            </Button>
          </form>

          <p className="mt-6 border-t border-ink/10 pt-5 text-center text-sm text-ink/65">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="font-semibold text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:decoration-rose-old"
            >
              Iniciar sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
