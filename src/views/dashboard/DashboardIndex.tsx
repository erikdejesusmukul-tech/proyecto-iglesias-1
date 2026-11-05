import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarDays,
  ChartNoAxesCombined,
  Handshake,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

type GrowthPoint = { month: string; members: number };
type DashboardData = {
  churchName: string;
  activeMembers: number;
  upcomingEvents: number;
  attendanceThisMonth: number;
  activeMinistries: number;
  income: number;
  expenses: number;
  growth: GrowthPoint[];
};

const emptyDashboard: DashboardData = {
  churchName: "tu iglesia",
  activeMembers: 0,
  upcomingEvents: 0,
  attendanceThisMonth: 0,
  activeMinistries: 0,
  income: 0,
  expenses: 0,
  growth: [],
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfNextMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
}

function getGrowthMonths() {
  const now = new Date();
  return Array.from(
    { length: 6 },
    (_, index) => new Date(now.getFullYear(), now.getMonth() - 5 + index, 1),
  );
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function DashboardIndex() {
  const [data, setData] = useState<DashboardData>(emptyDashboard);
  const [canSeeFinancials, setCanSeeFinancials] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setIsLoading(true);
      setLoadError(false);
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("No se pudo obtener la sesión.");

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("church_id, role")
          .eq("id", user.id)
          .maybeSingle();
        if (profileError || !profile?.church_id)
          throw new Error("No se encontró la iglesia del perfil.");
        if (cancelled) return;

        const financialAccess = profile.role === "admin" || profile.role === "tesorero";
        setCanSeeFinancials(financialAccess);

        const now = new Date();
        const monthStart = startOfMonth(now);
        const nextMonthStart = startOfNextMonth(now);
        const monthStartDate = localDateString(monthStart);
        const nextMonthStartDate = localDateString(nextMonthStart);
        const today = localDateString(now);
        const growthMonths = getGrowthMonths();
        const growthStart = growthMonths[0] ?? monthStart;
        const growthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const financialRequest = financialAccess
          ? supabase
              .from("transactions")
              .select("type, amount")
              .eq("church_id", profile.church_id)
              .is("deleted_at", null)
              .gte("transaction_date", monthStartDate)
              .lt("transaction_date", nextMonthStartDate)
          : Promise.resolve({ data: [], error: null });

        const [
          memberCountResult,
          upcomingEventCountResult,
          attendanceCountResult,
          ministryCountResult,
          churchResult,
          growthResult,
          financialResult,
        ] = await Promise.all([
          supabase
            .from("members")
            .select("id", { count: "exact", head: true })
            .eq("church_id", profile.church_id)
            .eq("status", "activo")
            .is("deleted_at", null),
          supabase
            .from("events")
            .select("id", { count: "exact", head: true })
            .eq("church_id", profile.church_id)
            .is("deleted_at", null)
            .gte("event_date", today),
          supabase
            .from("attendance")
            .select("id", { count: "exact", head: true })
            .eq("church_id", profile.church_id)
            .gte("created_at", monthStart.toISOString())
            .lt("created_at", nextMonthStart.toISOString()),
          supabase
            .from("ministries")
            .select("id", { count: "exact", head: true })
            .eq("church_id", profile.church_id)
            .is("deleted_at", null),
          supabase
            .from("churches")
            .select("name")
            .eq("id", profile.church_id)
            .is("deleted_at", null)
            .maybeSingle(),
          supabase
            .from("members")
            .select("created_at")
            .eq("church_id", profile.church_id)
            .eq("status", "activo")
            .is("deleted_at", null)
            .gte("created_at", growthStart.toISOString())
            .lt("created_at", growthEnd.toISOString()),
          financialRequest,
        ]);

        const queryErrors = [
          memberCountResult.error,
          upcomingEventCountResult.error,
          attendanceCountResult.error,
          ministryCountResult.error,
          churchResult.error,
          growthResult.error,
          financialResult.error,
        ];
        if (queryErrors.some(Boolean)) throw new Error("Una o más consultas del panel fallaron.");
        if (cancelled) return;

        const growthCounts = new Map<string, number>();
        for (const date of growthMonths) growthCounts.set(monthKey(date), 0);
        for (const member of growthResult.data ?? []) {
          const key = monthKey(new Date(member.created_at));
          if (growthCounts.has(key)) growthCounts.set(key, (growthCounts.get(key) ?? 0) + 1);
        }

        let income = 0;
        let expenses = 0;
        if (financialAccess) {
          for (const transaction of financialResult.data ?? []) {
            const amount = Number(transaction.amount) || 0;
            if (transaction.type === "ingreso") income += amount;
            else expenses += amount;
          }
        }

        setData({
          churchName: churchResult.data?.name ?? "tu iglesia",
          activeMembers: memberCountResult.count ?? 0,
          upcomingEvents: upcomingEventCountResult.count ?? 0,
          attendanceThisMonth: attendanceCountResult.count ?? 0,
          activeMinistries: ministryCountResult.count ?? 0,
          income,
          expenses,
          growth: growthMonths.map((date) => ({
            month: new Intl.DateTimeFormat("es-MX", { month: "short" }).format(date),
            members: growthCounts.get(monthKey(date)) ?? 0,
          })),
        });
      } catch {
        if (!cancelled) {
          setLoadError(true);
          toast.error("No se pudieron cargar los datos del panel.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [loadAttempt]);

  const metrics = [
    {
      label: "Miembros activos",
      value: data.activeMembers,
      note: "Comunidad registrada",
      icon: UsersRound,
    },
    {
      label: "Eventos próximos",
      value: data.upcomingEvents,
      note: "En la agenda",
      icon: CalendarDays,
    },
    {
      label: "Asistencias este mes",
      value: data.attendanceThisMonth,
      note: "Registros de asistencia",
      icon: ChartNoAxesCombined,
    },
    {
      label: "Ministerios activos",
      value: data.activeMinistries,
      note: "Equipos de servicio",
      icon: Handshake,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-old">
          Resumen de la comunidad
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {isLoading ? (
            <Skeleton className="h-10 w-[min(36rem,90vw)] bg-ink/10" />
          ) : (
            <h1 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
              Bienvenido al Panel de {data.churchName}
            </h1>
          )}
          {loadError && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setLoadAttempt((attempt) => attempt + 1)}
              aria-label="Reintentar carga"
              className="border-ink/15 bg-ivory text-ink"
            >
              <RefreshCw aria-hidden="true" className="size-4" />
            </Button>
          )}
        </div>
        <p className="max-w-2xl text-sm leading-6 text-ink/60">
          Una vista general de la actividad y el crecimiento de tu congregación.
        </p>
      </section>

      <section
        aria-label="Indicadores principales"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map(({ label, value, note, icon: Icon }) => (
          <Card key={label} className="border-ink/10 bg-ivory shadow-sm shadow-ink/5">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <CardDescription className="max-w-[12rem] text-sm text-ink/60">
                {label}
              </CardDescription>
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-parchment text-ink/70">
                <Icon aria-hidden="true" className="size-4" />
              </span>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-20 bg-ink/10" />
              ) : (
                <CardTitle className="font-serif text-3xl font-normal text-ink">
                  {value.toLocaleString("es-MX")}
                </CardTitle>
              )}
              <p className="mt-1 text-xs text-ink/50">{note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {canSeeFinancials && (
        <section aria-labelledby="financial-summary-title" className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="financial-summary-title" className="font-serif text-2xl text-ink">
                Resumen Financiero
              </h2>
              <p className="mt-1 text-sm text-ink/55">Ingresos y egresos del mes actual.</p>
            </div>
            <span className="rounded-full border border-sage/40 bg-sage/15 px-3 py-1 text-xs font-medium text-ink/70">
              Solo personal autorizado
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FinancialMetric
              label="Ingresos del mes"
              value={data.income}
              loading={isLoading}
              icon={<TrendingUp aria-hidden="true" className="size-4" />}
              className="text-emerald-700"
            />
            <FinancialMetric
              label="Egresos del mes"
              value={data.expenses}
              loading={isLoading}
              icon={<TrendingDown aria-hidden="true" className="size-4" />}
              className="text-red-700"
            />
            <FinancialMetric
              label="Saldo total del mes"
              value={data.income - data.expenses}
              loading={isLoading}
              icon={<WalletCards aria-hidden="true" className="size-4" />}
              className="text-ink"
            />
          </div>
        </section>
      )}

      <Card className="border-ink/10 bg-ivory shadow-sm shadow-ink/5">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="font-serif text-xl font-normal text-ink">
              Crecimiento de la comunidad
            </CardTitle>
            <CardDescription className="mt-1 text-ink/55">
              Nuevos miembros activos registrados · últimos seis meses
            </CardDescription>
          </div>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-parchment text-ink/70">
            <ChartNoAxesCombined aria-hidden="true" className="size-4" />
          </span>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full bg-ink/10 sm:h-72" />
          ) : (
            <div
              className="h-64 w-full sm:h-72"
              role="img"
              aria-label="Gráfica de nuevos miembros registrados en los últimos seis meses"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.growth} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="memberGrowthLive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--rose-old)" stopOpacity={0.34} />
                      <stop offset="95%" stopColor="var(--rose-old)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--ink)" strokeDasharray="3 5" strokeOpacity={0.1} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--ink)", fillOpacity: 0.55, fontSize: 12 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--ink)", fillOpacity: 0.5, fontSize: 11 }}
                    allowDecimals={false}
                    domain={[0, "dataMax + 2"]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "1px solid color-mix(in oklch, var(--ink) 12%, transparent)",
                      backgroundColor: "var(--ivory)",
                      color: "var(--ink)",
                      boxShadow: "0 8px 24px color-mix(in oklch, var(--ink) 10%, transparent)",
                    }}
                    formatter={(value) => [value, "Miembros nuevos"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="members"
                    stroke="var(--rose-old)"
                    strokeWidth={2.5}
                    fill="url(#memberGrowthLive)"
                    activeDot={{
                      r: 5,
                      fill: "var(--rose-old)",
                      stroke: "var(--ivory)",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FinancialMetric({
  label,
  value,
  loading,
  icon,
  className,
}: {
  label: string;
  value: number;
  loading: boolean;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <Card className="border-ink/10 bg-ivory shadow-sm shadow-ink/5">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <CardDescription className="text-ink/60">{label}</CardDescription>
          <span className="text-ink/50">{icon}</span>
        </div>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-36 bg-ink/10" />
        ) : (
          <p className={`mt-2 font-serif text-2xl tabular-nums ${className}`}>
            {formatCurrency(value)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
