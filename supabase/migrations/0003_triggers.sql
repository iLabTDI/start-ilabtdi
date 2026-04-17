-- ─────────────────────────────────────────────────────────────
-- 0003_triggers.sql
--
--   1. `handle_new_user`  → crea profile cuando se registra un user
--   2. `handle_updated_at` → mantiene `updated_at` en cada UPDATE
--
-- `SECURITY DEFINER` se usa en (1) porque la inserción ocurre
-- dentro del contexto de auth.users y necesita permisos
-- elevados. `search_path` se fija explícitamente para evitar
-- ataques de resolución de nombres (CVE-2018-1058).
-- ─────────────────────────────────────────────────────────────

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
