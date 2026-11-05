-- Tenant security for public.churches and public.profiles.
-- Run only after the Drizzle schema migration has created the enums, columns,
-- indexes, and foreign keys declared in drizzle/schema.ts.

-- SECURITY DEFINER helpers avoid recursive RLS checks when a policy needs the
-- current user's tenant or role. They return only the caller's own profile data.
create or replace function public.current_profile_church_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.church_id
  from public.profiles as p
  where p.id = (select auth.uid())
    and p.deleted_at is null
  limit 1;
$$;

create or replace function public.current_profile_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles as p
  where p.id = (select auth.uid())
    and p.deleted_at is null
  limit 1;
$$;

revoke all on function public.current_profile_church_id() from public, anon;
revoke all on function public.current_profile_role() from public, anon;
grant execute on function public.current_profile_church_id() to authenticated;
grant execute on function public.current_profile_role() to authenticated;

-- Keep updated_at consistent for every database-side update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists churches_set_updated_at on public.churches;
create trigger churches_set_updated_at
before update on public.churches
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.churches enable row level security;
alter table public.profiles enable row level security;

-- Remove policies from the earlier editorial schema. PostgreSQL policies are
-- permissive by default, so an old USING (true) policy would widen access.
drop policy if exists "Churches are readable by everyone" on public.churches;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

drop policy if exists "Anyone can read verified churches" on public.churches;
create policy "Anyone can read verified churches"
on public.churches
for select
to anon, authenticated
using (verification_status = 'verified' and deleted_at is null);

drop policy if exists "Tenant users can read their church" on public.churches;
create policy "Tenant users can read their church"
on public.churches
for select
to authenticated
using (
  deleted_at is null
  and id = (select public.current_profile_church_id())
  and (select public.current_profile_role()) <> 'usuario_web'
);

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()) and deleted_at is null);

drop policy if exists "Church admins and pastors can read tenant profiles" on public.profiles;
create policy "Church admins and pastors can read tenant profiles"
on public.profiles
for select
to authenticated
using (
  deleted_at is null
  and church_id = (select public.current_profile_church_id())
  and (select public.current_profile_role()) in ('admin', 'pastor')
);

drop policy if exists "Users can update their own editable profile fields" on public.profiles;
create policy "Users can update their own editable profile fields"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()) and deleted_at is null)
with check (id = (select auth.uid()) and deleted_at is null);

drop policy if exists "Church admins and pastors can update tenant profile fields" on public.profiles;
create policy "Church admins and pastors can update tenant profile fields"
on public.profiles
for update
to authenticated
using (
  deleted_at is null
  and church_id = (select public.current_profile_church_id())
  and (select public.current_profile_role()) in ('admin', 'pastor')
)
with check (
  deleted_at is null
  and church_id = (select public.current_profile_church_id())
  and (select public.current_profile_role()) in ('admin', 'pastor')
);

-- A user's own update and tenant staff updates may change profile presentation
-- fields only. In particular, clients cannot self-assign role/church_id or
-- soft-delete a profile. Role and tenant assignment are server-controlled.
revoke all on public.churches from anon, authenticated;
grant select on public.churches to anon, authenticated;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;
grant all on public.churches, public.profiles to service_role;

-- New Supabase Auth accounts receive a web-only profile. Never trust signup
-- metadata for role or tenant assignment.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Atomic tenant onboarding: a new church starts in pending_review and its
-- registering user becomes that church's admin. There is intentionally no
-- direct INSERT policy or client grant on churches, and role is not client-editable.
create or replace function public.register_church(
  p_name text,
  p_slug text,
  p_legal_registration_number text default null,
  p_contact_email text default null,
  p_contact_phone text default null,
  p_address text default null,
  p_verification_document_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_church_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if nullif(trim(p_name), '') is null or length(trim(p_name)) > 255 then
    raise exception 'Church name must contain 1 to 255 characters' using errcode = '22023';
  end if;

  if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_slug) > 180 then
    raise exception 'Slug must be lowercase alphanumeric words separated by hyphens' using errcode = '22023';
  end if;

  select * into v_profile
  from public.profiles
  where id = v_user_id and deleted_at is null
  for update;

  if not found or v_profile.church_id is not null or v_profile.role <> 'usuario_web' then
    raise exception 'Only an unassigned web user can register a church' using errcode = '42501';
  end if;

  insert into public.churches (
    name,
    slug,
    legal_registration_number,
    verification_status,
    verification_document_url,
    contact_email,
    contact_phone,
    address
  ) values (
    trim(p_name),
    p_slug,
    nullif(trim(p_legal_registration_number), ''),
    'pending_review',
    nullif(trim(p_verification_document_url), ''),
    nullif(trim(p_contact_email), ''),
    nullif(trim(p_contact_phone), ''),
    nullif(trim(p_address), '')
  ) returning id into v_church_id;

  update public.profiles
  set church_id = v_church_id, role = 'admin'
  where id = v_user_id;

  return v_church_id;
end;
$$;

revoke all on function public.register_church(text, text, text, text, text, text, text) from public, anon;
grant execute on function public.register_church(text, text, text, text, text, text, text) to authenticated;
