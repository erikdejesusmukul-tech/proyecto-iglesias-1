import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type UserRole = Database["public"]["Enums"]["user_role"];

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: readonly UserRole[];
};

type AccessState = "loading" | "allowed" | "denied" | "profile-error";

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const rolesKey = allowedRoles?.join(",") ?? "";
  const [access, setAccess] = useState<AccessState>("loading");

  useEffect(() => {
    let active = true;

    async function verifyAccess() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        if (active) void navigate({ to: "/login" });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;
      if (profileError || !profile) {
        setAccess("profile-error");
        return;
      }

      const roles = rolesKey ? (rolesKey.split(",") as UserRole[]) : null;
      setAccess(!roles || roles.includes(profile.role) ? "allowed" : "denied");
    }

    void verifyAccess();
    return () => {
      active = false;
    };
  }, [navigate, rolesKey]);

  if (access === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-parchment px-4 text-ink">
        <p role="status" className="text-sm text-ink/65">
          Verificando acceso…
        </p>
      </main>
    );
  }

  if (access === "profile-error") {
    return (
      <AccessMessage
        code="403"
        title="No se pudo verificar tu perfil"
        description="Tu cuenta no tiene un perfil accesible en esta iglesia. Contacta con el administrador."
      />
    );
  }

  if (access === "denied") {
    return (
      <AccessMessage
        code="403"
        title="Acceso denegado"
        description="Tu rol no tiene permiso para consultar esta sección."
      />
    );
  }

  return children;
}

function AccessMessage({
  code,
  title,
  description,
}: {
  code: string;
  title: string;
  description: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-parchment px-4 py-10 text-ink">
      <section className="w-full max-w-md rounded-2xl border border-ink/10 bg-ivory p-8 text-center shadow-lg shadow-ink/10">
        <p className="font-serif text-5xl text-rose-old">{code}</p>
        <h1 className="mt-3 text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-ink/65">{description}</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-medium text-ivory transition-colors hover:bg-ink/85"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
