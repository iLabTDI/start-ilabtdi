-- ─────────────────────────────────────────────────────────────
-- 0001_initial_schema.sql
-- Crea la tabla `profiles` vinculada 1:1 con `auth.users`.
-- ─────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null unique,
  full_name    text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint profiles_full_name_length   check (char_length(full_name) <= 100),
  constraint profiles_email_format       check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint profiles_avatar_url_length  check (char_length(avatar_url) <= 2048)
);

create index if not exists profiles_email_idx      on public.profiles(email);
create index if not exists profiles_created_at_idx on public.profiles(created_at desc);

comment on table  public.profiles           is 'Datos de perfil público de cada usuario registrado.';
comment on column public.profiles.id        is 'FK → auth.users.id (cascade delete).';
comment on column public.profiles.email     is 'Copia desnormalizada del email de auth para búsquedas rápidas.';
