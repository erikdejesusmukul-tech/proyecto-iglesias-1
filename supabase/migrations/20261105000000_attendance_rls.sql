-- Church-scoped attendance records. Requires the SaaS schema and current_profile_* helpers.

do $$
begin
  create type public.attendance_status as enum ('presente', 'ausente', 'justificado');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches (id),
  event_id uuid not null references public.events (id),
  member_id uuid not null references public.members (id),
  status public.attendance_status not null default 'presente',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_event_member_unique unique (event_id, member_id)
);

create index if not exists attendance_church_event_idx
  on public.attendance (church_id, event_id);

drop trigger if exists attendance_set_updated_at on public.attendance;
create trigger attendance_set_updated_at
before update on public.attendance
for each row execute function public.set_updated_at();

alter table public.attendance enable row level security;

revoke all on public.attendance from anon, authenticated;
grant select, insert, update, delete on public.attendance to authenticated;
grant all on public.attendance to service_role;
grant usage on type public.attendance_status to authenticated;

drop policy if exists "Church staff can read tenant attendance" on public.attendance;
create policy "Church staff can read tenant attendance"
on public.attendance
for select
to authenticated
using (
  church_id = (select public.current_profile_church_id())
  and (select public.current_profile_role()) in (
    'superadmin', 'admin', 'pastor', 'secretario', 'tesorero', 'coordinador'
  )
);

drop policy if exists "Church staff can insert tenant attendance" on public.attendance;
create policy "Church staff can insert tenant attendance"
on public.attendance
for insert
to authenticated
with check (
  church_id = (select public.current_profile_church_id())
  and (select public.current_profile_role()) in (
    'superadmin', 'admin', 'pastor', 'secretario', 'tesorero', 'coordinador'
  )
  and exists (
    select 1 from public.events e
    where e.id = event_id
      and e.church_id = attendance.church_id
      and e.deleted_at is null
  )
  and exists (
    select 1 from public.members m
    where m.id = member_id
      and m.church_id = attendance.church_id
      and m.deleted_at is null
      and m.status = 'activo'
  )
);

drop policy if exists "Church staff can update tenant attendance" on public.attendance;
create policy "Church staff can update tenant attendance"
on public.attendance
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
  and exists (
    select 1 from public.events e
    where e.id = event_id
      and e.church_id = attendance.church_id
      and e.deleted_at is null
  )
  and exists (
    select 1 from public.members m
    where m.id = member_id
      and m.church_id = attendance.church_id
      and m.deleted_at is null
      and m.status = 'activo'
  )
);

drop policy if exists "Church staff can delete tenant attendance" on public.attendance;
create policy "Church staff can delete tenant attendance"
on public.attendance
for delete
to authenticated
using (
  church_id = (select public.current_profile_church_id())
  and (select public.current_profile_role()) in (
    'superadmin', 'admin', 'pastor', 'secretario', 'tesorero', 'coordinador'
  )
);
