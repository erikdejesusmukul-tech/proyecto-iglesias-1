import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  LockKeyhole,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TransactionFormModal,
  type TransactionFormRecord,
} from "@/components/dashboard/TransactionFormModal";
import { supabase } from "@/integrations/supabase/client";

type Transaction = TransactionFormRecord & { created_at: string };
type AccessState = "loading" | "allowed" | "denied" | "error";

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(
    new Date(year, month - 1, day),
  );
}

export function FinanzasIndex() {
  const [accessState, setAccessState] = useState<AccessState>("loading");
  const [churchId, setChurchId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function checkFinancialAccess() {
      setAccessState("loading");
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("No se pudo verificar tu sesión.");

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("church_id, role")
          .eq("id", user.id)
          .maybeSingle();
        if (profileError) throw profileError;
        if (cancelled) return;

        if (!profile?.church_id || (profile.role !== "admin" && profile.role !== "tesorero")) {
          setAccessState("denied");
          return;
        }

        setChurchId(profile.church_id);
        setAccessState("allowed");
      } catch {
        if (!cancelled) {
          setAccessState("error");
          toast.error("No se pudo verificar el acceso al módulo financiero.");
        }
      }
    }

    void checkFinancialAccess();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (accessState !== "allowed" || !churchId) return;
    setIsLoadingTransactions(true);
    setLoadError(false);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("id, type, category, amount, transaction_date, description, created_at")
        .is("deleted_at", null)
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTransactions((data ?? []) as Transaction[]);
    } catch {
      setTransactions([]);
      setLoadError(true);
      toast.error("No se pudieron cargar los movimientos financieros.");
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [accessState, churchId]);

  useEffect(() => {
    if (accessState === "allowed" && churchId) void fetchTransactions();
  }, [accessState, churchId, fetchTransactions]);

  const monthlyTotals = useMemo(() => {
    const monthKey = localDateKey().slice(0, 7);
    return transactions.reduce(
      (totals, transaction) => {
        if (!transaction.transaction_date.startsWith(monthKey)) return totals;
        const amount = Number(transaction.amount) || 0;
        if (transaction.type === "ingreso") totals.income += amount;
        else totals.expenses += amount;
        return totals;
      },
      { income: 0, expenses: 0 },
    );
  }, [transactions]);

  async function deleteTransaction() {
    if (!transactionToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", transactionToDelete.id)
        .is("deleted_at", null);
      if (error) throw error;
      toast.success("Movimiento eliminado del historial activo.");
      setTransactionToDelete(null);
      await fetchTransactions();
    } catch {
      toast.error("No se pudo eliminar el movimiento. Verifica tus permisos e inténtalo de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  }

  function openCreateForm() {
    setSelectedTransaction(null);
    setIsFormOpen(true);
  }

  function closeForm(open: boolean) {
    setIsFormOpen(open);
    if (!open) setSelectedTransaction(null);
  }

  if (accessState === "loading") {
    return (
      <div aria-label="Verificando acceso financiero" className="space-y-5">
        <Skeleton className="h-10 w-64 bg-ink/10" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl bg-ink/10" />
          ))}
        </div>
      </div>
    );
  }

  if (accessState !== "allowed") {
    return (
      <Card className="mx-auto max-w-xl border-ink/10 bg-ivory shadow-sm shadow-ink/5">
        <CardContent className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-rose-old/15 text-rose-old">
            <LockKeyhole aria-hidden="true" className="size-7" />
          </span>
          <h1 className="mt-5 font-serif text-2xl text-ink">
            {accessState === "error" ? "No se pudo verificar el acceso" : "Acceso restringido"}
          </h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink/60">
            {accessState === "error"
              ? "Vuelve al panel e inténtalo de nuevo."
              : "Solo los roles de administración y tesorería pueden consultar y gestionar la información financiera."}
          </p>
          <Button asChild className="mt-6 bg-ink text-ivory hover:bg-ink/90">
            <Link to="/dashboard">Volver al inicio</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-old">
            Administración
          </p>
          <h1 className="mt-1 font-serif text-3xl leading-tight text-ink sm:text-4xl">Finanzas</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
            Consulta y administra los ingresos y egresos de tu iglesia.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreateForm}
          className="h-10 shrink-0 bg-ink text-ivory shadow-sm hover:bg-ink/90"
        >
          <Plus aria-hidden="true" /> Nueva Transacción
        </Button>
      </header>

      <section aria-label="Resumen del mes actual" className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Ingresos del mes"
          amount={monthlyTotals.income}
          icon={<ArrowUpRight aria-hidden="true" className="size-5" />}
          amountClassName="text-emerald-700"
          iconClassName="bg-emerald-700/10 text-emerald-700"
          loading={isLoadingTransactions}
        />
        <SummaryCard
          title="Egresos del mes"
          amount={monthlyTotals.expenses}
          icon={<ArrowDownRight aria-hidden="true" className="size-5" />}
          amountClassName="text-red-700"
          iconClassName="bg-red-700/10 text-red-700"
          loading={isLoadingTransactions}
        />
        <SummaryCard
          title="Saldo del mes"
          amount={monthlyTotals.income - monthlyTotals.expenses}
          icon={<WalletCards aria-hidden="true" className="size-5" />}
          amountClassName="text-ink"
          iconClassName="bg-ochre/15 text-ink"
          loading={isLoadingTransactions}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl text-ink">Movimientos</h2>
          <p className="mt-1 text-sm text-ink/55">Historial ordenado por fecha más reciente.</p>
        </div>
        <Card className="overflow-hidden border-ink/10 bg-ivory shadow-sm shadow-ink/5">
          <Table>
            <TableHeader className="bg-parchment/70">
              <TableRow className="border-ink/10 hover:bg-transparent">
                <TableHead className="min-w-32 px-5 text-xs font-semibold uppercase tracking-wide text-ink/55">
                  Fecha
                </TableHead>
                <TableHead className="min-w-32 px-5 text-xs font-semibold uppercase tracking-wide text-ink/55">
                  Tipo
                </TableHead>
                <TableHead className="min-w-36 px-5 text-xs font-semibold uppercase tracking-wide text-ink/55">
                  Categoría
                </TableHead>
                <TableHead className="min-w-52 px-5 text-xs font-semibold uppercase tracking-wide text-ink/55">
                  Descripción
                </TableHead>
                <TableHead className="min-w-36 px-5 text-right text-xs font-semibold uppercase tracking-wide text-ink/55">
                  Monto
                </TableHead>
                <TableHead className="w-14 px-3">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingTransactions ? (
                Array.from({ length: 5 }, (_, index) => (
                  <TableRow key={index} className="border-ink/10">
                    {Array.from({ length: 6 }, (_, cell) => (
                      <TableCell key={cell} className="px-5 py-4">
                        <Skeleton className="h-4 w-full max-w-28 bg-ink/10" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : transactions.length ? (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-ink/10 hover:bg-parchment/30">
                    <TableCell className="px-5 py-4 text-ink/70">
                      {formatDate(transaction.transaction_date)}
                    </TableCell>
                    <TableCell className="px-5 py-4 capitalize text-ink/70">
                      {transaction.type}
                    </TableCell>
                    <TableCell className="px-5 py-4 font-medium text-ink">
                      {transaction.category}
                    </TableCell>
                    <TableCell className="max-w-sm px-5 py-4 text-ink/60">
                      {transaction.description || "—"}
                    </TableCell>
                    <TableCell
                      className={`px-5 py-4 text-right font-semibold tabular-nums ${transaction.type === "ingreso" ? "text-emerald-700" : "text-red-700"}`}
                    >
                      {transaction.type === "ingreso" ? "+" : "−"}
                      {formatCurrency(Number(transaction.amount) || 0)}
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Acciones para ${transaction.category}`}
                            className="size-9 text-ink/55 hover:bg-parchment hover:text-ink"
                          >
                            <MoreHorizontal aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 border-ink/10 bg-ivory">
                          <DropdownMenuItem
                            onSelect={() => {
                              setSelectedTransaction(transaction);
                              setIsFormOpen(true);
                            }}
                          >
                            <Pencil aria-hidden="true" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-ink/10" />
                          <DropdownMenuItem
                            onSelect={() => setTransactionToDelete(transaction)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 aria-hidden="true" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 px-5 text-center text-sm text-ink/55">
                    {loadError
                      ? "No se pudieron cargar los movimientos."
                      : "Aún no hay transacciones registradas."}
                    {loadError && (
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => void fetchTransactions()}
                        className="ml-2 p-0 text-rose-old"
                      >
                        Reintentar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </section>

      <TransactionFormModal
        open={isFormOpen}
        transaction={selectedTransaction}
        onOpenChange={closeForm}
        onSuccess={fetchTransactions}
      />

      <AlertDialog
        open={transactionToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setTransactionToDelete(null);
        }}
      >
        <AlertDialogContent className="border-ink/10 bg-ivory text-ink sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl font-normal text-ink">
              Eliminar movimiento
            </AlertDialogTitle>
            <AlertDialogDescription className="text-ink/65">
              ¿Deseas ocultar el movimiento de {transactionToDelete?.category} por{" "}
              {transactionToDelete ? formatCurrency(Number(transactionToDelete.amount)) : ""} del
              historial activo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setTransactionToDelete(null)}
              className="border-ink/15 bg-ivory text-ink/70"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={isDeleting || !transactionToDelete}
              onClick={() => void deleteTransaction()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando…" : "Eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SummaryCard({
  title,
  amount,
  icon,
  amountClassName,
  iconClassName,
  loading,
}: {
  title: string;
  amount: number;
  icon: React.ReactNode;
  amountClassName: string;
  iconClassName: string;
  loading: boolean;
}) {
  return (
    <Card className="border-ink/10 bg-ivory shadow-sm shadow-ink/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-ink/60">{title}</CardTitle>
        <span className={`grid size-10 place-items-center rounded-xl ${iconClassName}`}>
          {icon}
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-36 bg-ink/10" />
        ) : (
          <p className={`font-serif text-3xl tabular-nums ${amountClassName}`}>
            {formatCurrency(amount)}
          </p>
        )}
        <p className="mt-1 text-xs text-ink/45">Periodo del mes actual</p>
      </CardContent>
    </Card>
  );
}
