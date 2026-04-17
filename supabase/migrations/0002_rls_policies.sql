-- ─────────────────────────────────────────────────────────────
-- 0002_rls_policies.sql
-- Activa Row Level Security en `profiles` y define policies
-- explícitas por operación. Regla: un usuario solo ve/edita
-- su propio perfil. Los INSERT los hace el trigger del auth.
-- ─────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_self" on public.profiles;
drop policy if exists "profiles_delete_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_insert_self"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles
  for delete
  to authenticated
  using (auth.uid() = id);

revoke all on public.profiles from anon;
grant  select, insert, update, delete on public.profiles to authenticated;
