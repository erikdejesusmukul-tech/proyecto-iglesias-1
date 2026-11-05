import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Church } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completePendingChurchRegistration } from "@/lib/auth/church-registration";

const validateSearch = (s: Record<string, unknown>) => ({
  redirect:
    typeof s["redirect"] === "string" &&
    s["redirect"].startsWith("/") &&
    !s["redirect"].startsWith("//")
      ? s["redirect"]
      : "/",
});

export const Route = createFileRoute("/auth")({
  validateSearch,
  head: () => ({
    meta: [
      { title: "Entrar — Iglesias de Mérida" },
      {
        name: "description",
        content: "Inicia sesión para conocer las iglesias históricas de Mérida, Yucatán.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"entrar" | "crear">("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const continueForAuthenticatedUser = useCallback(
    async (user: User) => {
      let registration: "completed" | "none" | "different-user";
      try {
        registration = await completePendingChurchRegistration(user.email);
      } catch {
        await supabase.auth.signOut();
        setError(
          "No se pudo completar la solicitud de registro. Inicia sesión de nuevo para reintentar.",
        );
        return;
      }
      if (registration === "completed") {
        toast.success("Solicitud enviada con éxito", {
          description: "Tu iglesia quedó pendiente de validación.",
        });
        await supabase.auth.signOut();
        await navigate({ to: "/login" });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError("No se pudo consultar el rol de tu cuenta. Inténtalo de nuevo.");
        return;
      }

      if (profile.role === "usuario_web") {
        await navigate({ to: "/" });
      } else {
        window.location.assign("/dashboard");
      }
    },
    [navigate],
  );

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      try {
        await continueForAuthenticatedUser(data.user);
      } catch {
        if (active) setError("No se pudo completar el acceso. Inténtalo de nuevo.");
      }
    });
    return () => {
      active = false;
    };
  }, [continueForAuthenticatedUser]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Escribe un correo electrónico válido.");
      return;
    }
    if (mode === "crear" && normalizedName.length < 2) {
      setError("Escribe tu nombre para crear la cuenta.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      if (mode === "entrar") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (error || !data.user) {
          setError("Correo o contraseña incorrectos.");
          return;
        }
        await continueForAuthenticatedUser(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { full_name: normalizedName },
            emailRedirectTo: `${window.location.origin}/auth?redirect=${encodeURIComponent(redirect)}`,
          },
        });
        if (error) {
          setError("No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.");
          return;
        }

        setName(normalizedName);
        if (data.session) {
          await navigate({ to: redirect });
          return;
        }
        setSent(true);
      }
    } catch {
      setError("No se pudo completar la operación. Comprueba tu conexión e inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    const callback = new URL("/auth", window.location.origin);
    callback.searchParams.set("redirect", redirect);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callback.toString(),
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) {
        setError("No se pudo iniciar sesión con Google. Inténtalo de nuevo.");
      }
    } catch {
      setError("No se pudo conectar con Google. Comprueba tu conexión e inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-parchment px-4 py-10 text-ink sm:px-6">
      <Card className="w-full max-w-md rounded-2xl border-ink/10 bg-ivory shadow-xl shadow-ink/10">
        <CardHeader className="space-y-5 p-6 pb-2 sm:p-8 sm:pb-3">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-3 rounded-md text-sm font-semibold tracking-tight outline-none transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-ink text-ivory">
              <Church aria-hidden="true" className="size-5" />
            </span>
            <span>
              Iglesias de <span className="font-serif italic font-normal">Yucatán</span>
            </span>
          </Link>
          <div>
            <CardTitle className="font-sans text-3xl font-bold tracking-tight text-ink">
              {sent ? "Revisa tu correo" : mode === "entrar" ? "Iniciar Sesión" : "Crear cuenta"}
            </CardTitle>
            <CardDescription className="mt-2 text-sm leading-6 text-ink/65">
              {sent ? (
                <>
                  Enviamos un enlace de confirmación a{" "}
                  <span className="font-medium text-ink">{email}</span>. Ábrelo para activar tu
                  cuenta.
                </>
              ) : mode === "entrar" ? (
                "Accede a tu espacio y mantén a tu comunidad conectada."
              ) : (
                "Crea una cuenta para continuar en el portal."
              )}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-4 sm:p-8 sm:pt-5">
          {sent ? (
            <Button
              type="button"
              className="h-11 w-full"
              onClick={() => {
                setSent(false);
                setMode("entrar");
                setPassword("");
                setError(null);
              }}
            >
              Ya confirmé, quiero entrar
            </Button>
          ) : (
            <>
              {mode === "crear" && (
                <div className="mb-5 grid grid-cols-2 rounded-lg bg-parchment p-1 text-sm">
                  {(["entrar", "crear"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMode(m);
                        setError(null);
                      }}
                      disabled={busy}
                      aria-pressed={mode === m}
                      className={`min-h-9 rounded-md px-3 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${mode === m ? "bg-ivory text-ink shadow-sm" : "text-ink/60 hover:text-ink"}`}
                    >
                      {m === "entrar" ? "Iniciar sesión" : "Crear cuenta"}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleEmail} className="space-y-5">
                {mode === "crear" && (
                  <div className="space-y-2">
                    <Label htmlFor="auth-name">Nombre completo</Label>
                    <Input
                      id="auth-name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={100}
                      autoComplete="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError(null);
                      }}
                      placeholder="Tu nombre"
                      className="h-11 border-ink/15 bg-ivory"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="auth-email">Correo electrónico</Label>
                  <Input
                    id="auth-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="nombre@ejemplo.com"
                    className="h-11 border-ink/15 bg-ivory"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth-password">Contraseña</Label>
                  <Input
                    id="auth-password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === "entrar" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="••••••••"
                    className="h-11 border-ink/15 bg-ivory"
                  />
                </div>
                {error && (
                  <p
                    role="alert"
                    className="rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                  >
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={busy} className="h-11 w-full">
                  {busy ? "Un momento…" : mode === "entrar" ? "Iniciar Sesión" : "Crear cuenta"}
                </Button>
              </form>

              {mode === "entrar" && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  <a
                    href="/recuperar-password"
                    className="font-medium text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:decoration-ink"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </p>
              )}

              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                <span>o continúa con</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={handleGoogle}
                className="h-11 w-full border-ink/15 bg-ivory"
              >
                {busy ? "Conectando…" : "Continuar con Google"}
              </Button>

              {mode === "entrar" && (
                <p className="mt-5 text-center text-sm text-muted-foreground">
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("crear");
                      setError(null);
                    }}
                    className="font-medium text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:decoration-ink"
                  >
                    Crear cuenta
                  </button>
                </p>
              )}
            </>
          )}

          <div className="mt-8 border-t border-ink/10 pt-6 text-center">
            <p className="mx-auto max-w-sm text-sm leading-6 text-ink/65">
              ¿Eres líder o administrador de una iglesia?{" "}
              <Link
                to="/registro-iglesia"
                className="font-semibold text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:decoration-rose-old"
              >
                Registra tu iglesia aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
