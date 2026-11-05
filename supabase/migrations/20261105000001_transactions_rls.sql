-- Financial transactions are restricted exclusively to church admins and treasurers.

do $$
begin
  create type public.transaction_type as enum ('ingreso', 'egreso');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches (id),
  type public.transaction_type not null,
  category varchar(120) not null,
  amount numeric(12, 2) not null check (amount > 0),
  transaction_date date not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists transactions_church_date_idx
  on public.transactions (church_id, transaction_date desc);

drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

alter table public.transactions enable row level security;

revoke all on public.transactions from anon, authenticated;
grant select, insert, update, delete on public.transactions to authenticated;
grant all on public.transactions to service_role;
grant usage on type public.transaction_type to authenticated;

drop policy if exists "Financial staff can read tenant transactions" on public.transactions;
create policy "Financial staff can read tenant transactions"
on public.transactions
for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.deleted_at is null
      and p.church_id = transactions.church_id
      and p.role in ('admin', 'tesorero')
  )
);

drop policy if exists "Financial staff can insert tenant transactions" on public.transactions;
create policy "Financial staff can insert tenant transactions"
on public.transactions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.deleted_at is null
      and p.church_id = transactions.church_id
      and p.role in ('admin', 'tesorero')
  )
);

drop policy if exists "Financial staff can update tenant transactions" on public.transactions;
create policy "Financial staff can update tenant transactions"
on public.transactions
for update
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.deleted_at is null
      and p.church_id = transactions.church_id
      and p.role in ('admin', 'tesorero')
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.deleted_at is null
      and p.church_id = transactions.church_id
      and p.role in ('admin', 'tesorero')
  )
);

drop policy if exists "Financial staff can delete tenant transactions" on public.transactions;
create policy "Financial staff can delete tenant transactions"
on public.transactions
for delete
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.deleted_at is null
      and p.church_id = transactions.church_id
      and p.role in ('admin', 'tesorero')
  )
);
