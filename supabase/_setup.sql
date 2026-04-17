-- ─────────────────────────────────────────────────────────────
-- Setup completo para copiar/pegar en Supabase SQL Editor.
-- Incluye: schema + RLS + triggers + bucket de avatares.
-- Idempotente: puedes correrlo varias veces sin romper nada.
-- ─────────────────────────────────────────────────────────────

-- 1. Extensión
create extension if not exists "pgcrypto";

-- 2. Tabla profiles
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

-- 3. RLS
alter table public.profiles enable row level security;
alter table public.profiles force row level security;

drop policy if exists "profiles_select_own"  on public.profiles;
drop policy if exists "profiles_update_own"  on public.profiles;
drop policy if exists "profiles_insert_self" on public.profiles;
drop policy if exists "profiles_delete_own"  on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_insert_self"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete to authenticated
  using (auth.uid() = id);

revoke all on public.profiles from anon;
grant  select, insert, update, delete on public.profiles to authenticated;

-- 4. Triggers
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

revoke execute on function public.handle_new_user()   from public, anon, authenticated;
revoke execute on function public.handle_updated_at() from public, anon;

-- 5. Bucket de avatares (Storage)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_public_read"    on storage.objects;
drop policy if exists "avatars_user_upload"    on storage.objects;
drop policy if exists "avatars_user_update"    on storage.objects;
drop policy if exists "avatars_user_delete"    on storage.objects;

create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_user_upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_user_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_user_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ✅ Listo. Ahora regístrate desde la app.
