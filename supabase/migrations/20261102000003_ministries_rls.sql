-- Tenant-scoped ministries directory.
-- Requires the SaaS schema migration and current_profile_* helper functions.

create table if not exists public.ministries (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches (id),
  name varchar not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists ministries_church_id_idx
  on public.ministries (church_id);

drop trigger if exists ministries_set_updated_at on public.ministries;
create trigger ministries_set_updated_at
before update on public.ministries
for each row execute function public.set_updated_at();

alter table public.ministries enable row level security;

revoke all on public.ministries from anon, authenticated;
grant select, insert, update, delete on public.ministries to authenticated;
grant all on public.ministries to service_role;

drop policy if exists "Church staff can read tenant ministries" on public.ministries;
create policy "Church staff can read tenant ministries"
on public.ministries
for select
to authenticated
using (
  deleted_at is null
  and church_id = (select public.current_profile_church_id())
  and (select public.current_profile_role()) in (
    'superadmin', 'admin', 'pastor', 'secretario', 'tesorero', 'coordinador'
  )
);

drop policy if exists "Church staff can insert tenant ministries" on public.ministries;
create policy "Church staff can insert tenant ministries"
on public.ministries
for insert
to authenticated
with check (
  church_id = (select public.current_profile_church_id())
  and (select public.current_profile_role()) in (
    'superadmin', 'admin', 'pastor', 'secretario', 'tesorero', 'coordinador'
  )
);

drop policy if exists "Church staff can update tenant ministries" on public.ministries;
create policy "Church staff can update tenant ministries"
on public.ministries
for update
to authenticated
using (
  church_id = (select public.current_profile_church_id())
  and (select public.current_profile_role()) in (
    'superadmin', 'admin', 'pastor', 'secretario', 'tesorero', 'coordinador'
  )
)
with check (
  church_id = (select public.current_profile_church_id())
  and (select public.current_profile_role()) in (
    'superadmin', 'admin', 'pastor', 'secretario', 'tesorero', 'coordinador'
  )
);

drop policy if exists "Church staff can delete tenant ministries" on public.ministries;
create policy "Church staff can delete tenant ministries"
on public.ministries
for delete
to authenticated
using (
  church_id = (select public.current_profile_church_id())
  and (select public.current_profile_role()) in (
    'superadmin', 'admin', 'pastor', 'secretario', 'tesorero', 'coordinador'
  )
);
