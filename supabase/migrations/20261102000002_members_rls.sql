-- Tenant-scoped member directory.
-- Requires the SaaS schema migration and current_profile_* helper functions.

do $$
begin
  create type public.member_status as enum ('activo', 'inactivo');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches (id),
  first_name varchar not null,
  last_name varchar not null,
  email varchar,
  phone varchar,
  status public.member_status not null default 'activo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists members_church_id_idx
  on public.members (church_id);

create index if not exists members_church_status_idx
  on public.members (church_id, status);

drop trigger if exists members_set_updated_at on public.members;
create trigger members_set_updated_at
before update on public.members
for each row execute function public.set_updated_at();

alter table public.members enable row level security;

revoke all on public.members from anon, authenticated;
grant select, insert, update, delete on public.members to authenticated;
grant all on public.members to service_role;
grant usage on type public.member_status to authenticated;

drop policy if exists "Church staff can read tenant members" on public.members;
create policy "Church staff can read tenant members"
on public.members
for select
to authenticated
using (
  deleted_at is null
  and church_id = (select public.current_profile_church_id())
  and (select public.current_profile_role()) in (
    'superadmin', 'admin', 'pastor', 'secretario', 'tesorero', 'coordinador'
  )
);

drop policy if exists "Church staff can insert tenant members" on public.members;
create policy "Church staff can insert tenant members"
on public.members
for insert
to authenticated
with check (
  church_id = (select public.current_profile_church_id())
  and (select public.current_profile_role()) in (
    'superadmin', 'admin', 'pastor', 'secretario', 'tesorero', 'coordinador'
  )
);

drop policy if exists "Church staff can update tenant members" on public.members;
create policy "Church staff can update tenant members"
on public.members
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

drop policy if exists "Church staff can delete tenant members" on public.members;
create policy "Church staff can delete tenant members"
on public.members
for delete
to authenticated
using (
  church_id = (select public.current_profile_church_id())
  and (select public.current_profile_role()) in (
    'superadmin', 'admin', 'pastor', 'secretario', 'tesorero', 'coordinador'
  )
);
