import { useState } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  Church,
  ClipboardCheck,
  Handshake,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProtectedRoute, type UserRole } from "@/components/auth/ProtectedRoute";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

const PORTAL_ROLES = [
  "superadmin",
  "admin",
  "pastor",
  "secretario",
  "tesorero",
  "coordinador",
] as const satisfies readonly UserRole[];

const navigation = [
  { label: "Inicio", href: "/dashboard", icon: LayoutDashboard },
  { label: "Miembros", href: "/dashboard/miembros", icon: UsersRound },
  { label: "Eventos", href: "/dashboard/eventos", icon: CalendarDays },
  { label: "Asistencia", href: "/dashboard/asistencia", icon: ClipboardCheck },
  { label: "Ministerios", href: "/dashboard/ministerios", icon: Handshake },
  { label: "Finanzas", href: "/dashboard/finanzas", icon: WalletCards },
  { label: "Configuración", href: "/dashboard/configuracion", icon: Settings2 },
] as const;

export function DashboardLayout() {
  return (
    <ProtectedRoute allowedRoles={PORTAL_ROLES}>
      <DashboardShell />
    </ProtectedRoute>
  );
}

function DashboardShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    setSigningOut(false);

    if (error) {
      toast.error("No se pudo cerrar la sesión. Inténtalo de nuevo.");
      return;
    }

    await navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen bg-parchment text-ink lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink/10 bg-ivory px-4 py-6 lg:flex">
        <Brand />
        <SidebarNavigation pathname={pathname} />
        <SignOutButton onClick={handleSignOut} disabled={signingOut} />
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink/10 bg-ivory/95 px-4 backdrop-blur sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-ink/15 bg-ivory lg:hidden"
                  aria-label="Abrir menú de navegación"
                >
                  <Menu aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="flex w-[min(20rem,85vw)] flex-col bg-ivory p-5 text-ink"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Menú del portal</SheetTitle>
                  <SheetDescription>Navegación de administración de la iglesia.</SheetDescription>
                </SheetHeader>
                <Brand />
                <SidebarNavigation
                  pathname={pathname}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
                <SignOutButton
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void handleSignOut();
                  }}
                  disabled={signingOut}
                />
              </SheetContent>
            </Sheet>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink/50">
                Portal para iglesias
              </p>
              <p className="text-sm font-semibold text-ink">Administración</p>
            </div>
          </div>
          <span className="hidden font-serif text-sm italic text-ink/60 sm:inline">
            Fe, comunidad y servicio
          </span>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link
      to="/dashboard"
      className="mb-8 inline-flex items-center gap-3 rounded-md text-sm font-semibold tracking-tight text-ink outline-none transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-ink text-ivory">
        <Church aria-hidden="true" className="size-5" />
      </span>
      <span>
        Iglesias de <span className="font-serif font-normal italic">Yucatán</span>
      </span>
    </Link>
  );
}

function SidebarNavigation({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <nav aria-label="Navegación principal del portal" className="flex-1 space-y-1">
        {navigation.map(({ label, href, icon: Icon }) => {
          const isActive = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          const linkClassName = `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${isActive ? "bg-ink text-ivory shadow-sm" : "text-ink/65 hover:bg-parchment hover:text-ink"}`;

          return (
            <Link
              key={href}
              to={href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={linkClassName}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function SignOutButton({
  onClick,
  disabled = false,
  className = "",
}: {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-ink/65 transition-colors hover:bg-rose-old/15 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${className}`}
    >
      <LogOut aria-hidden="true" className="size-4" />
      {disabled ? "Cerrando sesión…" : "Cerrar sesión"}
    </button>
  );
}
