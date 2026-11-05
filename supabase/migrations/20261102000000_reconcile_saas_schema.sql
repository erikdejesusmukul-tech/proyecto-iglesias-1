-- Forward migration from the existing editorial schema to the SaaS tenant schema.
-- Prerequisite: 20261025000000_app_schema.sql has already been applied.
-- This intentionally alters the existing tables; it does not create profiles or churches.

create type public.user_role as enum (
  'superadmin',
  'admin',
  'pastor',
  'secretario',
  'tesorero',
  'coordinador',
  'miembro',
  'usuario_web'
);

create type public.verification_status as enum (
  'unverified',
  'pending_review',
  'verified',
  'rejected'
);

-- churches existed with slug as the primary key. Add and backfill UUIDs first,
-- then move the primary key while preserving the existing slug and editorial data.
alter table public.churches
  add column id uuid default gen_random_uuid() not null,
  add column legal_registration_number varchar(120),
  add column verification_status public.verification_status not null default 'unverified',
  add column verification_document_url text,
  add column logo_url text,
  add column contact_email varchar(320),
  add column contact_phone varchar(40),
  add column address text,
  add column deleted_at timestamptz;

alter table public.churches
  alter column name type varchar using name::varchar,
  alter column slug type varchar using slug::varchar;

alter table public.churches
  drop constraint if exists churches_pkey;

alter table public.churches
  add constraint churches_pkey primary key (id),
  add constraint churches_slug_key unique (slug);

-- profiles existed with id/full_name/created_at. New accounts remain web users
-- until they register a church through the trusted register_church RPC.
alter table public.profiles
  add column church_id uuid,
  add column role public.user_role not null default 'usuario_web',
  add column avatar_url text,
  add column updated_at timestamptz not null default now(),
  add column deleted_at timestamptz;

alter table public.profiles
  add constraint profiles_church_id_fkey
    foreign key (church_id) references public.churches (id) on delete set null;
