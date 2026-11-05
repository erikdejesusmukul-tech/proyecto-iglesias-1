-- Tenant-scoped events directory. Requires the SaaS schema and current_profile_* helpers.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches (id),
  name varchar not null,
  description text,
  event_date date not null,
  event_time time not null,
  ministry_id uuid references public.ministries (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists events_church_date_idx
  on public.events (church_id, event_date);
create index if not exists events_ministry_id_idx
  on public.events (ministry_id);

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

alter table public.events enable row level security;

revoke all on public.events from anon, authenticated;
grant select, insert, update, delete on public.events to authenticated;
grant all on public.events to service_role;

drop policy if exists "Church staff can read tenant events" on public.events;
create policy "Church staff can read tenant events"
on public.events
for select
to authenticated
using (
  deleted_at is null
  and church_id = (select public.current_profile_church_id())
  and (select public.current_profile_role()) in (
    'superadmin', 'admin', 'pastor', 'secretario', 'tesorero', 'coordinador'
  )
);

drop policy if exists "Church staff can insert tenant events" on public.events;
create policy "Church staff can insert tenant events"
on public.events
for insert
to authenticated
with check (
  church_id = (select public.current_profile_church_id())
  and (select public.current_profile_role()) in (
    'superadmin', 'admin', 'pastor', 'secretario', 'tesorero', 'coordinador'
  )
  and (
    ministry_id is null
    or exists (
      select 1 from public.ministries m
      where m.id = ministry_id
        and m.church_id = events.church_id
        and m.deleted_at is null
    )
  )
);

drop policy if exists "Church staff can update tenant events" on public.events;
create policy "Church staff can update tenant events"
on public.events
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
  and (
    ministry_id is null
    or exists (
      select 1 from public.ministries m
      where m.id = ministry_id
        and m.church_id = events.church_id
        and m.deleted_at is null
    )
  )
);

drop policy if exists "Church staff can delete tenant events" on public.events;
create policy "Church staff can delete tenant events"
on public.events
for delete
to authenticated
using (
  church_id = (select public.current_profile_church_id())
  and (select public.current_profile_role()) in (
    'superadmin', 'admin', 'pastor', 'secretario', 'tesorero', 'coordinador'
  )
);
