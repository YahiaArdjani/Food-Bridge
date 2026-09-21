-- ===========================================================================
-- Food Bridge — schema (phase 1: accounts & profiles)
-- Run in the Supabase SQL editor (or `supabase db push`).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Roles
-- --------------------------------------------------------------------------- 
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('restaurant', 'charity', 'admin');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Profiles — one row per auth user
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  role              public.user_role not null default 'charity',
  full_name         text,
  organization_name text,
  phone             text,
  address           text,
  city              text,
  created_at        timestamptz not null default now()
);

comment on table public.profiles is
  'Public-facing profile for every authenticated user (restaurant, charity or admin).';

-- ---------------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Everyone (authenticated + anonymous) may read the directory listings of
-- restaurants and charities. Admin rows stay private.
drop policy if exists "Public profiles are readable" on public.profiles;
create policy "Public profiles are readable"
  on public.profiles
  for select
  to anon, authenticated
  using (role in ('restaurant', 'charity'));

-- A user can always read their own row (this is what the dashboard and the
-- middleware use to resolve the role; it also covers admins).
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- A user can create their own row (the trigger below normally does this).
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- A user can update only their own row.
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Keep the API able to reach the table (RLS still decides row by row).
grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Guard: a user must not be able to change their own role
--    (otherwise "update your own row" would allow self-promotion to admin).
-- ---------------------------------------------------------------------------
create or replace function public.profiles_lock_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     -- service_role / postgres are allowed to reassign roles (admins, seeds).
     and current_setting('request.jwt.claim.role', true) not in ('service_role')
     and current_user not in ('postgres', 'supabase_admin')
  then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_lock_role_trigger on public.profiles;
create trigger profiles_lock_role_trigger
  before update on public.profiles
  for each row
  execute function public.profiles_lock_role();

-- ---------------------------------------------------------------------------
-- 5. Create the profile automatically on signup
--    Role / organization come from the metadata sent by the signup form.
--    Only 'restaurant' and 'charity' can be self-selected — admins are
--    promoted manually.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id, role, full_name, organization_name, phone, address, city
  )
  values (
    new.id,
    case
      when new.raw_user_meta_data ->> 'role' = 'restaurant'
        then 'restaurant'::public.user_role
      else 'charity'::public.user_role
    end,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'organization_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'address'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'city'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
