import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import iglesia from "@/assets/iglesia.jpg";

const validateSearch = (s: Record<string, unknown>) => ({
  redirect: typeof s["redirect"] === "string" && s["redirect"].startsWith("/") && !s["redirect"].startsWith("//") ? s["redirect"] : "/",
});

export const Route = createFileRoute("/auth")({
  validateSearch,
  head: () => ({
    meta: [
      { title: "Entrar — Iglesias de Mérida" },
      { name: "description", content: "Inicia sesión para conocer las iglesias históricas de Mérida, Yucatán." },
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: redirect });
    });
  }, [navigate, redirect]);

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
        const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error) {
          setError("Correo o contraseña incorrectos.");
          return;
        }
        await navigate({ to: redirect });
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-16 text-ivory">
      <img src={iglesia} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="hero-shade absolute inset-0" />

      <div className="relative w-full max-w-md rounded-[2rem] border border-ivory/15 bg-ink/80 p-8 shadow-2xl backdrop-blur">
        <p className="font-serif text-sm italic opacity-70">La Edición Sagrada · Yucatán</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {sent ? "Revisa tu correo" : mode === "entrar" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
        </h1>

        {sent ? (
          <div className="mt-6 space-y-4">
            <p className="font-serif text-lg leading-snug opacity-90">
              Te enviamos un enlace de confirmación a <span className="italic">{email}</span>. Ábrelo para activar tu cuenta y entrar.
            </p>
            <button
              onClick={() => { setSent(false); setMode("entrar"); setPassword(""); setError(null); }}
              className="w-full rounded-full bg-ivory px-4 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
            >
              Ya confirmé, quiero entrar
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6 flex rounded-full border border-ivory/20 p-1 text-sm font-semibold">
              {(["entrar", "crear"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null); setSent(false); }}
                  disabled={busy}
                  className={`flex-1 rounded-full px-4 py-1.5 transition-colors ${mode === m ? "bg-ivory text-ink" : "opacity-70 hover:opacity-100"}`}
                >
                  {m === "entrar" ? "Entrar" : "Crear cuenta"}
                </button>
              ))}
            </div>

            <form onSubmit={handleEmail} className="mt-6 space-y-4">
              {mode === "crear" && (
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  aria-label="Tu nombre"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(null); }}
                  placeholder="Tu nombre"
                  className="w-full rounded-xl border border-ivory/20 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-ivory/40 focus:border-ivory/60"
                />
              )}
              <input
                type="email"
                required
                autoComplete="email"
                aria-label="Correo electrónico"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="Correo electrónico"
                className="w-full rounded-xl border border-ivory/20 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-ivory/40 focus:border-ivory/60"
              />
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === "entrar" ? "current-password" : "new-password"}
                aria-label="Contraseña"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="Contraseña"
                className="w-full rounded-xl border border-ivory/20 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-ivory/40 focus:border-ivory/60"
              />
              {error && <p className="text-sm text-rose-old">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-ivory px-4 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {busy ? "Un momento…" : mode === "entrar" ? "Entrar" : "Crear cuenta"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest opacity-50">
              <span className="h-px flex-1 bg-ivory/20" /> o continúa con <span className="h-px flex-1 bg-ivory/20" />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy}
                className="w-full rounded-full border border-ivory/25 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-ivory/10 disabled:opacity-50"
              >
                {busy ? "Conectando…" : "Continuar con Google"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
