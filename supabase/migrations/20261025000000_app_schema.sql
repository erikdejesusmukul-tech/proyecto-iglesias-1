-- Esquema base para el explorador de iglesias de Yucatán.
-- Ejecutar en Supabase SQL Editor. No elimina usuarios ni tablas existentes.

create extension if not exists pgcrypto;

-- Supabase Auth administra auth.users. Esta tabla guarda únicamente el perfil público.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

-- La app actualmente obtiene las fichas desde src/models/churches.ts.
-- Esta tabla permite migrarlas a Supabase conservando la misma estructura lógica.
create table if not exists public.churches (
  slug text primary key check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  short text not null,
  tagline text not null,
  image text not null,
  founded text not null,
  map_query text not null,
  history text[] not null default '{}',
  capillas jsonb not null default '[]'::jsonb,
  horarios jsonb not null default '[]'::jsonb,
  contacto jsonb not null default '{}'::jsonb,
  objetos jsonb not null default '[]'::jsonb,
  eventos jsonb not null default '[]'::jsonb,
  libros jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint churches_capillas_array check (jsonb_typeof(capillas) = 'array'),
  constraint churches_horarios_array check (jsonb_typeof(horarios) = 'array'),
  constraint churches_contacto_object check (jsonb_typeof(contacto) = 'object'),
  constraint churches_objetos_array check (jsonb_typeof(objetos) = 'array'),
  constraint churches_eventos_array check (jsonb_typeof(eventos) = 'array'),
  constraint churches_libros_array check (jsonb_typeof(libros) = 'array')
);

create index if not exists churches_name_idx on public.churches (name);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists churches_set_updated_at on public.churches;
create trigger churches_set_updated_at
before update on public.churches
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.churches enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
for update to authenticated using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Churches are readable by everyone" on public.churches;
create policy "Churches are readable by everyone" on public.churches
for select to anon, authenticated using (true);

grant select on public.churches to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles, public.churches to service_role;

-- No se habilita escritura pública de iglesias. Administra el catálogo con service_role
-- desde un entorno de servidor seguro o desde el SQL Editor de Supabase.
